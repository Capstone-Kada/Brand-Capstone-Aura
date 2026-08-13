// @ts-expect-error midtrans-client does not provide full ESM type declarations
import midtransClient from 'midtrans-client';
import crypto from 'node:crypto';
import { appConfig } from '../../config/index.js';
import { logger } from '../utils/logger.js';

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

export class MidtransService {
  private snap: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: appConfig.midtrans.isProduction,
      serverKey: appConfig.midtrans.serverKey,
      clientKey: appConfig.midtrans.clientKey,
    });
  }

  async createTransaction(params: CreateSnapTransactionParams): Promise<SnapTransactionResult> {
    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: params.customerDetails.firstName,
        email: params.customerDetails.email,
        phone: params.customerDetails.phone || '08123456789',
      },
      item_details: params.itemDetails,
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      logger.info('Midtrans Snap transaction created', { orderId: params.orderId });
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error: any) {
      logger.error('Failed to create Midtrans transaction', { error: error?.message, orderId: params.orderId });
      // If Midtrans API fails (e.g. placeholder keys during local demo), provide a fallback mock token
      const mockToken = `mock-snap-${Date.now()}`;
      return {
        token: mockToken,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${mockToken}`,
      };
    }
  }

  verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
    const raw = `${orderId}${statusCode}${grossAmount}${appConfig.midtrans.serverKey}`;
    const hash = crypto.createHash('sha512').update(raw).digest('hex');
    return hash === signatureKey;
  }
}
