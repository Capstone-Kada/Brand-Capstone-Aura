import type { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../../shared/utils/api-response.js';
import type { SubscriptionService } from '../services/subscription.service.js';

export const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'ELITE']),
});

export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  checkout = async (req: Request, res: Response): Promise<void> => {
    const parsed = checkoutSchema.parse(req.body);
    const result = await this.subscriptionService.checkout(req.affiliatorId as string, parsed);
    sendSuccess(res, result, 201);
  };

  webhook = async (req: Request, res: Response): Promise<void> => {
    const result = await this.subscriptionService.handleWebhook(req.body);
    sendSuccess(res, result, 200);
  };
}
