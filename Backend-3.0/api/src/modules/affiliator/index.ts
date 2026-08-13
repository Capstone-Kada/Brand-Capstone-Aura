import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import {
  AffiliatorController,
  updateAffiliatorSchema,
  updateAffiliatorStatusSchema,
} from './controllers/affiliator.controller.js';
import type { IAffiliatorRepository } from './interfaces/affiliator.repository.interface.js';
import { AffiliatorService } from './services/affiliator.service.js';

export interface AffiliatorModuleDeps {
  affiliatorRepository: IAffiliatorRepository;
}

export function createAffiliatorModule(deps: AffiliatorModuleDeps): Router {
  const service = new AffiliatorService(deps.affiliatorRepository);
  const controller = new AffiliatorController(service);
  const router = Router();

  router.use(authenticate);

  router.get('/me', authorize('AFFILIATOR'), asyncHandler(controller.me));
  router.patch(
    '/me',
    authorize('AFFILIATOR'),
    validateRequest(updateAffiliatorSchema),
    asyncHandler(controller.updateMe),
  );
  router.post(
    '/me/api-key/regenerate',
    authorize('AFFILIATOR'),
    asyncHandler(controller.regenerateApiKey),
  );

  router.get('/', authorize('ADMIN'), asyncHandler(controller.list));
  router.get('/:id', authorize('ADMIN'), asyncHandler(controller.getById));
  router.patch(
    '/:id/status',
    authorize('ADMIN'),
    validateRequest(updateAffiliatorStatusSchema),
    asyncHandler(controller.updateStatus),
  );
  router.patch(
    '/:id',
    authorize('ADMIN'),
    validateRequest(updateAffiliatorSchema),
    asyncHandler(controller.update),
  );
  router.delete('/:id', authorize('ADMIN'), asyncHandler(controller.delete));

  return router;
}
