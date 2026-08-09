import type { AffiliatorListing, PrismaClient, Product } from '@prisma/client';
import type {
  CreateListingInput,
  IListingRepository,
  ListingDto,
  UpdateListingInput,
} from '../interfaces/listing.repository.interface.js';

type ListingRow = AffiliatorListing & { product: Product };

const listingInclude = { product: true } as const;

function mapRow(row: ListingRow): ListingDto {
  return {
    id: row.id,
    productId: row.productId,
    name: row.product.name,
    brand: row.product.brand,
    category: row.product.category,
    mainCategory: row.product.mainCategory,
    price: row.priceOverride ?? row.product.price,
    originalPrice: row.originalPriceOverride ?? row.product.originalPrice,
    imageUrl: row.product.imageUrl,
    affiliateUrl: row.affiliateUrl,
    shade: row.shadeOverride ?? row.product.shade,
    suitableSkinTones: row.product.suitableSkinTones,
    suitableUndertones: row.product.suitableUndertones,
    suitableSkinTypes: row.product.suitableSkinTypes,
    targetsConcerns: row.product.targetsConcerns,
    matchScoreWeight: row.matchScoreWeight,
    status: row.status,
    clicks: row.clicks,
    conversions: row.conversions,
    revenueGenerated: row.revenueGenerated,
    affiliatorNote: row.affiliatorNote,
  };
}

export class ListingRepository implements IListingRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAllForAffiliator(affiliatorId: string): Promise<ListingDto[]> {
    const rows = await this.db.affiliatorListing.findMany({
      where: { affiliatorId },
      include: listingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapRow);
  }

  async findByIdForAffiliator(id: string, affiliatorId: string): Promise<ListingDto | null> {
    const row = await this.db.affiliatorListing.findFirst({
      where: { id, affiliatorId },
      include: listingInclude,
    });
    return row ? mapRow(row) : null;
  }

  async create(affiliatorId: string, data: CreateListingInput): Promise<ListingDto> {
    const row = await this.db.affiliatorListing.create({
      data: {
        affiliatorId,
        productId: data.productId,
        affiliateUrl: data.affiliateUrl,
        priceOverride: data.priceOverride,
        shadeOverride: data.shadeOverride,
        matchScoreWeight: data.matchScoreWeight ?? 80,
        affiliatorNote: data.affiliatorNote,
      },
      include: listingInclude,
    });
    return mapRow(row);
  }

  async createMany(affiliatorId: string, productIds: string[]): Promise<ListingDto[]> {
    const products = await this.db.product.findMany({ where: { id: { in: productIds } } });
    await this.db.affiliatorListing.createMany({
      data: products.map((product) => ({
        affiliatorId,
        productId: product.id,
        affiliateUrl: product.affiliateUrl ?? product.sourceUrl ?? '',
      })),
      skipDuplicates: true,
    });
    const rows = await this.db.affiliatorListing.findMany({
      where: { affiliatorId, productId: { in: productIds } },
      include: listingInclude,
    });
    return rows.map(mapRow);
  }

  async update(id: string, data: UpdateListingInput): Promise<ListingDto> {
    const row = await this.db.affiliatorListing.update({
      where: { id },
      data,
      include: listingInclude,
    });
    return mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.affiliatorListing.delete({ where: { id } });
  }

  async incrementClick(id: string, converted: boolean, revenue: number): Promise<void> {
    await this.db.affiliatorListing.update({
      where: { id },
      data: {
        clicks: { increment: 1 },
        conversions: converted ? { increment: 1 } : undefined,
        revenueGenerated: converted ? { increment: revenue } : undefined,
      },
    });
  }
}
