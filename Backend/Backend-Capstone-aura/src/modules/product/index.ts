import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { ProductController, createProductSchema, updateProductSchema } from './controllers/product.controller.js';
import type { IProductRepository } from './interfaces/product.repository.interface.js';
import { ProductService } from './services/product.service.js';
import type { IIngredientLookupClient } from '../../shared/services/ingredient-lookup-client.js';

export interface ProductModuleDeps {
  productRepository: IProductRepository;
  ingredientLookupClient: IIngredientLookupClient;
}

export function createProductModule(deps: ProductModuleDeps): Router {
  const service = new ProductService(deps.productRepository, deps.ingredientLookupClient);
  const controller = new ProductController(service);
  const router = Router();

  router.get('/', asyncHandler(controller.list));
  router.get('/categories', asyncHandler(controller.categories));
  router.get('/brands', asyncHandler(controller.brands));
  router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validateRequest(createProductSchema),
    asyncHandler(controller.create),
  );
  router.get('/:id', asyncHandler(controller.getById));
  router.patch(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    validateRequest(updateProductSchema),
    asyncHandler(controller.update),
  );
  router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(controller.remove));

  return router;
}
