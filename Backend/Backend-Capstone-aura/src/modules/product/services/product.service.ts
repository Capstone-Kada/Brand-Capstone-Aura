import { NotFoundError } from '../../../shared/errors/app-error.js';
import type { IIngredientLookupClient } from '../../../shared/services/ingredient-lookup-client.js';
import { logger } from '../../../shared/utils/logger.js';
import type {
  CreateProductInput,
  IProductRepository,
  ProductDto,
  ProductListFilter,
  UpdateProductInput,
} from '../interfaces/product.repository.interface.js';

export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly ingredientLookupClient?: IIngredientLookupClient,
  ) {}

  list(filter?: ProductListFilter): Promise<ProductDto[]> {
    return this.productRepository.findAllActive(filter);
  }

  async getById(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  listCategories(): Promise<string[]> {
    return this.productRepository.listCategories();
  }

  listBrands(): Promise<string[]> {
    return this.productRepository.listBrands();
  }

  async create(data: CreateProductInput): Promise<ProductDto> {
    const product = await this.productRepository.create(data);
    void this.runIngredientLookup(product);
    return product;
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductDto> {
    await this.getById(id);
    const product = await this.productRepository.update(id, data);
    if (data.brand !== undefined || data.name !== undefined) {
      void this.runIngredientLookup(product);
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.productRepository.softDelete(id);
  }

  /**
   * Fire-and-forget: never awaited by callers, never throws. Runs after the
   * triggering request has already responded.
   */
  private async runIngredientLookup(product: ProductDto): Promise<void> {
    if (!this.ingredientLookupClient) return;

    try {
      const composition = await this.ingredientLookupClient.lookupIngredients({
        brand: product.brand,
        name: product.name,
        category: product.category,
      });
      await this.productRepository.updateCompositionResult(product.id, {
        composition,
        status: 'completed',
      });
    } catch (error) {
      logger.error('Product ingredient lookup failed', {
        productId: product.id,
        error: error instanceof Error ? error.message : 'unknown',
      });
      await this.productRepository.updateCompositionResult(product.id, {
        composition: [],
        status: 'failed',
      });
    }
  }
}
