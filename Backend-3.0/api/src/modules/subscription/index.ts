import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { MidtransService } from '../../shared/services/midtrans.service.js';
import { SubscriptionService, SUBSCRIPTION_PLANS } from './services/subscription.service.js';
import { SubscriptionController, checkoutSchema } from './controllers/subscription.controller.js';
import { sendSuccess } from '../../shared/utils/api-response.js';

export interface SubscriptionModuleDeps {
  db: PrismaClient;
}

export function createSubscriptionModule(deps: SubscriptionModuleDeps): Router {
  const midtransService = new MidtransService();
  const service = new SubscriptionService(deps.db, midtransService);
  const controller = new SubscriptionController(service);
  const router = Router();

  // Public webhook notification from Midtrans
  router.post('/webhook', asyncHandler(controller.webhook));

  // Public/all plans info
  router.get('/plans', (_req, res) => {
    sendSuccess(res, Object.values(SUBSCRIPTION_PLANS));
  });

  // Authenticated affiliator checkout route
  router.post(
    '/checkout',
    authenticate,
    authorize('AFFILIATOR'),
    validateRequest(checkoutSchema),
    asyncHandler(controller.checkout),
  );

  return router;
}

export { SubscriptionService, SUBSCRIPTION_PLANS };
