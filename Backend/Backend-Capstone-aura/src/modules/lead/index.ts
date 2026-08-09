import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { resolveAffiliatorId } from '../../middlewares/resolve-affiliator.js';
import { validateRequest } from '../../middlewares/validate.js';
import { handleMulterError, uploadScanImage } from '../../middlewares/index.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import type { IAiClient } from '../../shared/services/ai-client.js';
import { LeadController, recordClickSchema } from './controllers/lead.controller.js';
import { LeadService } from './services/lead.service.js';

export interface LeadModuleDeps {
  db: PrismaClient;
  aiClient: IAiClient;
}

export function createLeadModule(deps: LeadModuleDeps): Router {
  const service = new LeadService(deps.db, deps.aiClient);
  const controller = new LeadController(service);
  const router = Router();

  router.post(
    '/',
    (req, res, next) => {
      uploadScanImage(req, res, (err: unknown) => {
        if (err) {
          handleMulterError(err, req, res, next);
          return;
        }
        next();
      });
    },
    asyncHandler(controller.submit),
  );

  router.post('/clicks', validateRequest(recordClickSchema), asyncHandler(controller.recordClick));

  router.get(
    '/',
    authenticate,
    authorize('AFFILIATOR'),
    resolveAffiliatorId(deps.db),
    asyncHandler(controller.list),
  );

  return router;
}
