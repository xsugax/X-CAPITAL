import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { kycService } from "../services/kycService";

const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { expiresIn: env.JWT_EXPIRES_IN as any },
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
};

// Demo user — trial access (no DB required)
const DEMO_EMAIL = "demo@xcapital.io";
const DEMO_HASH =
  "$2a$12$eoJiAf7pHIobInM2n/xLI.gi2Zn5r59xSOSOpBidvYxJu4Oht3AhK"; // Demo1234!

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res
        .status(409)
        .json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash, firstName, lastName, phone },
      });
      await tx.wallet.create({ data: { userId: newUser.id } });
      await tx.portfolio.create({
        data: { userId: newUser.id, totalValue: 0, totalCost: 0, totalPnL: 0 },
      });
      return newUser;
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          kycStatus: user.kycStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // ── Demo shortcut (no DB needed) ──────────────────────────────────────
    if (email === DEMO_EMAIL) {
      const validDemo = await bcrypt.compare(password, DEMO_HASH);
      if (!validDemo) {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
        return;
      }
      const { accessToken, refreshToken: demoRt } = generateTokens(
        "demo-user-id",
        DEMO_EMAIL,
      );
      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: demoRt,
          user: {
            id: "demo-user-id",
            email: DEMO_EMAIL,
            firstName: "Demo",
            lastName: "User",
            tier: "GOLD",
            kycStatus: "VERIFIED",
            accreditationStatus: "ACCREDITED",
          },
        },
      });
      return;
    }
    // ──────────────────────────────────────────────────────────────────────

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tier: user.tier,
          kycStatus: user.kycStatus,
          accreditationStatus: user.accreditationStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token required" });
      return;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      storedToken.user.id,
      storedToken.user.email,
    );

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        tier: true,
        kycStatus: true,
        accreditationStatus: true,
        createdAt: true,
        wallet: { select: { fiatBalance: true, cryptoBalance: true } },
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const initiateKYC = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { kycStatus: true, email: true, firstName: true, lastName: true },
    });

    if (user?.kycStatus === "APPROVED") {
      res.json({ success: true, message: "KYC already verified" });
      return;
    }

    const kycSession = await kycService.createVerificationSession(
      req.user!.id,
      {
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
      },
    );

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { kycStatus: "PENDING", kycProviderId: kycSession.sessionId },
    });

    res.json({ success: true, data: { sessionUrl: kycSession.sessionUrl } });
  } catch (error) {
    next(error);
  }
};

export const kycWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body;
    await kycService.handleWebhook(payload);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
