import axios from 'axios';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface KYCSession {
  sessionId: string;
  sessionUrl: string;
}

class KYCService {
  private client = axios.create({
    baseURL: 'https://withpersona.com/api/v1',
    headers: {
      Authorization: `Bearer ${env.PERSONA_API_KEY}`,
      'Persona-Version': '2023-01-05',
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  async createVerificationSession(
    userId: string,
    userInfo: { email: string; firstName: string; lastName: string }
  ): Promise<KYCSession> {
    if (!env.PERSONA_API_KEY) {
      // Development fallback — skip to approved
      logger.warn('KYC provider not configured — using development bypass');
      const sessionId = `dev_kyc_${userId}_${Date.now()}`;
      return { sessionId, sessionUrl: `http://localhost:3000/kyc/success?session=${sessionId}` };
    }

    const response = await this.client.post('/inquiries', {
      data: {
        type: 'inquiry',
        attributes: {
          'inquiry-template-id': env.PERSONA_TEMPLATE_ID,
          'reference-id': userId,
          fields: {
            'email-address': { type: 'string', value: userInfo.email },
            'name-first': { type: 'string', value: userInfo.firstName },
            'name-last': { type: 'string', value: userInfo.lastName },
          },
        },
      },
    });

    const inquiry = response.data.data;
    const sessionToken = inquiry.attributes['session-token'];

    return {
      sessionId: inquiry.id,
      sessionUrl: `https://withpersona.com/verify?inquiry-id=${inquiry.id}&session-token=${sessionToken}`,
    };
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<void> {
    try {
      const eventName = (payload as { data?: { type?: string } })?.data?.type;
      const attributes = (payload as { data?: { attributes?: Record<string, unknown> } })?.data?.attributes;

      if (!attributes) return;

      const referenceId = String(attributes['reference-id'] || '');
      const status = String(attributes.status || '');

      if (!referenceId) return;

      if (eventName === 'inquiry.completed' || status === 'approved') {
        await prisma.user.update({
          where: { id: referenceId },
          data: { kycStatus: 'APPROVED' },
        });
        logger.info(`KYC approved for user: ${referenceId}`);
      } else if (status === 'declined' || eventName === 'inquiry.failed') {
        await prisma.user.update({
          where: { id: referenceId },
          data: { kycStatus: 'REJECTED' },
        });
        logger.info(`KYC rejected for user: ${referenceId}`);
      }
    } catch (error) {
      logger.error('KYC webhook processing failed:', error);
      throw error;
    }
  }
}

export const kycService = new KYCService();
