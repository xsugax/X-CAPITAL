import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { brokerService } from "../services/brokerService";
import { blockchainService } from "../services/blockchainService";
import {
  AssetType,
  ExecutionSource,
  OrderStatus,
  Prisma,
} from "@prisma/client";

export const getAssets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { type, search, limit = "50", offset = "0" } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { symbol: { contains: String(search).toUpperCase() } },
        { name: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where: where as Prisma.AssetWhereInput,
        orderBy: { marketCap: "desc" },
        take: parseInt(String(limit)),
        skip: parseInt(String(offset)),
      }),
      prisma.asset.count({
        where: where as Prisma.AssetWhereInput,
      }),
    ]);

    res.json({ success: true, data: { assets, total } });
  } catch (error) {
    next(error);
  }
};

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found" });
      return;
    }

    // Fetch live price from broker if stock/ETF
    let livePrice = null;
    if (asset.type === AssetType.STOCK || asset.type === AssetType.ETF) {
      try {
        livePrice = await brokerService.getQuote(asset.symbol);
      } catch {
        // Use stored price as fallback
      }
    }

    res.json({ success: true, data: { ...asset, livePrice } });
  } catch (error) {
    next(error);
  }
};

export const getAssetChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const { period = "1D" } = req.query;

    const data = await brokerService.getBars(
      symbol.toUpperCase(),
      String(period),
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const buyAsset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { assetId, amount } = req.body;
    const userId = req.user!.id;

    const [asset, wallet] = await Promise.all([
      prisma.asset.findUnique({ where: { id: assetId } }),
      prisma.wallet.findUnique({ where: { userId } }),
    ]);

    if (!asset || !asset.isTradable) {
      res
        .status(404)
        .json({ success: false, message: "Asset not found or not tradable" });
      return;
    }

    if (!wallet || Number(wallet.fiatBalance) < amount) {
      res.status(400).json({ success: false, message: "Insufficient balance" });
      return;
    }

    // Determine execution source
    let executionSource: ExecutionSource = ExecutionSource.BROKER;
    let brokerOrderId: string | null = null;
    let txHash: string | null = null;

    if (asset.type === AssetType.STOCK || asset.type === AssetType.ETF) {
      // Route to broker (Alpaca)
      const brokerOrder = await brokerService.placeOrder({
        symbol: asset.symbol,
        qty: amount / Number(asset.price),
        side: "buy",
        type: "market",
      });
      brokerOrderId = brokerOrder.id;
    } else if (asset.type === AssetType.TOKEN) {
      // Route to blockchain
      executionSource = ExecutionSource.BLOCKCHAIN;
      const tx = await blockchainService.purchaseToken(
        asset.symbol,
        amount,
        userId,
      );
      txHash = tx.hash;
    } else {
      executionSource = ExecutionSource.INTERNAL;
    }

    // Record order and deduct balance
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          assetId,
          type: "BUY",
          amount,
          quantity: amount / Number(asset.price),
          price: asset.price,
          status: OrderStatus.FILLED,
          executionSource,
          brokerOrderId,
          txHash,
          filledAt: new Date(),
        },
      });

      // Deduct from wallet
      await tx.wallet.update({
        where: { userId },
        data: { fiatBalance: { decrement: amount } },
      });

      // Update portfolio holding
      const portfolio = await tx.portfolio.findUnique({ where: { userId } });
      if (portfolio) {
        const existing = await tx.portfolioHolding.findUnique({
          where: {
            portfolioId_assetId: { portfolioId: portfolio.id, assetId },
          },
        });

        if (existing) {
          const newQty = Number(existing.quantity) + Number(newOrder.quantity);
          const newAvgCost =
            (Number(existing.quantity) * Number(existing.avgCost) + amount) /
            newQty;
          await tx.portfolioHolding.update({
            where: { id: existing.id },
            data: {
              quantity: newQty,
              avgCost: newAvgCost,
              currentValue: newQty * Number(asset.price),
            },
          });
        } else {
          await tx.portfolioHolding.create({
            data: {
              portfolioId: portfolio.id,
              assetId,
              quantity: Number(newOrder.quantity),
              avgCost: Number(asset.price),
              currentValue: amount,
            },
          });
        }

        // Update portfolio totals
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: {
            totalCost: { increment: amount },
            totalValue: { increment: amount },
          },
        });
      }

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet!.id,
          amount,
          type: "TRADE",
          status: "COMPLETED",
          reference: newOrder.id,
          metadata: { action: "BUY", asset: asset.symbol },
        },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: `Successfully purchased ${asset.symbol}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const sellAsset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { assetId, quantity } = req.body;
    const userId = req.user!.id;

    const [asset, portfolio] = await Promise.all([
      prisma.asset.findUnique({ where: { id: assetId } }),
      prisma.portfolio.findUnique({ where: { userId } }),
    ]);

    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found" });
      return;
    }

    const holding = portfolio
      ? await prisma.portfolioHolding.findUnique({
          where: {
            portfolioId_assetId: { portfolioId: portfolio.id, assetId },
          },
        })
      : null;

    if (!holding || Number(holding.quantity) < quantity) {
      res
        .status(400)
        .json({ success: false, message: "Insufficient holdings" });
      return;
    }

    const saleAmount = quantity * Number(asset.price);

    let brokerOrderId: string | null = null;
    if (asset.type === AssetType.STOCK || asset.type === AssetType.ETF) {
      const brokerOrder = await brokerService.placeOrder({
        symbol: asset.symbol,
        qty: quantity,
        side: "sell",
        type: "market",
      });
      brokerOrderId = brokerOrder.id;
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          assetId,
          type: "SELL",
          amount: saleAmount,
          quantity,
          price: asset.price,
          status: OrderStatus.FILLED,
          executionSource: ExecutionSource.BROKER,
          brokerOrderId,
          filledAt: new Date(),
        },
      });

      // Credit wallet
      const wallet = await tx.wallet.update({
        where: { userId },
        data: { fiatBalance: { increment: saleAmount } },
      });

      // Update holding
      const newQty = Number(holding.quantity) - quantity;
      if (newQty <= 0) {
        await tx.portfolioHolding.delete({ where: { id: holding.id } });
      } else {
        await tx.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            quantity: newQty,
            currentValue: newQty * Number(asset.price),
          },
        });
      }

      // Record transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: saleAmount,
          type: "TRADE",
          status: "COMPLETED",
          reference: newOrder.id,
          metadata: { action: "SELL", asset: asset.symbol },
        },
      });

      return newOrder;
    });

    res.json({
      success: true,
      message: `Successfully sold ${asset.symbol}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        asset: {
          select: { symbol: true, name: true, type: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { asset: true },
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (order.status !== "PENDING") {
      res
        .status(400)
        .json({
          success: false,
          message: "Only pending orders can be cancelled",
        });
      return;
    }

    if (order.brokerOrderId) {
      await brokerService.cancelOrder(order.brokerOrderId);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    next(error);
  }
};
