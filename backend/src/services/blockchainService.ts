import { ethers } from 'ethers';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Wallet | null = null;

  private init(): void {
    if (!env.ETHEREUM_RPC_URL || !env.TREASURY_PRIVATE_KEY) {
      logger.warn('Blockchain service not configured — missing RPC URL or private key');
      return;
    }
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(env.ETHEREUM_RPC_URL);
      this.signer = new ethers.Wallet(env.TREASURY_PRIVATE_KEY, this.provider);
    }
  }

  async purchaseToken(
    tokenSymbol: string,
    amountUSD: number,
    userId: string
  ): Promise<{ hash: string; blockNumber: number }> {
    this.init();
    if (!this.signer || !this.provider) {
      throw new Error('Blockchain service not configured');
    }

    logger.info(`Blockchain: purchasing ${tokenSymbol} for user ${userId}, amount $${amountUSD}`);

    // In production: call smart contract's purchase function
    // const contract = new ethers.Contract(env.XCAPITAL_TOKEN_ADDRESS, TOKEN_ABI, this.signer);
    // const tx = await contract.purchase({ value: ethers.parseEther(String(amountETH)) });

    // Placeholder — returns mock tx info
    return {
      hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    };
  }

  async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<string> {
    this.init();
    if (!this.provider) return '0';

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  async getETHBalance(walletAddress: string): Promise<string> {
    this.init();
    if (!this.provider) return '0';
    const balance = await this.provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  }

  async isValidAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }
}

export const blockchainService = new BlockchainService();
