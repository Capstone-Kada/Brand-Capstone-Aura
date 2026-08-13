import type { PrismaClient } from '@prisma/client';

export type PersonalColor = 'Winter' | 'Spring' | 'Summer' | 'Autumn';

const DATASET_SKIN_TONES = ['Fair', 'Light', 'Medium', 'Tan', 'Deep'] as const;
type DatasetSkinTone = (typeof DATASET_SKIN_TONES)[number];
type DatasetUndertone = 'Warm' | 'Cool';

/**
 * dataset\data\recommendations.csv and shade_mapping.csv only cover
 * undertone in {Cool, Warm} and skinTone up to "Deep" — the frontend's
 * Undertone/SkinTone unions also allow Neutral/Olive/Rich Deep, for which
 * no source data exists. These are documented, deliberate fallback buckets
 * (not AI-derived), applied before any dataset lookup.
 */
export function normalizeUndertone(undertone: string): DatasetUndertone {
  if (undertone === 'Neutral') return 'Cool';
  if (undertone === 'Olive') return 'Warm';
  return undertone === 'Warm' ? 'Warm' : 'Cool';
}

export function normalizeSkinTone(skinTone: string): DatasetSkinTone {
  if (skinTone === 'Rich Deep') return 'Deep';
  return (DATASET_SKIN_TONES as readonly string[]).includes(skinTone)
    ? (skinTone as DatasetSkinTone)
    : 'Medium';
}

/**
 * Backend-derived (never AI-sourced) skinTone+undertone -> PersonalColor.
 * shade_mapping.csv is a full 4(personalColor) x 2(undertone) x 5(skinTone)
 * cross product, so it cannot itself be used to derive personalColor — every
 * personalColor legitimately pairs with every undertone/skinTone combo. This
 * heuristic instead buckets by warmth + depth.
 */
export function derivePersonalColor(skinTone: string, undertone: string): PersonalColor {
  const isWarm = normalizeUndertone(undertone) === 'Warm';
  const isDeepish = ['Tan', 'Deep'].includes(normalizeSkinTone(skinTone));

  if (isWarm) return isDeepish ? 'Autumn' : 'Spring';
  return isDeepish ? 'Winter' : 'Summer';
}

export interface DatasetRankedMatch {
  listingId: string;
  productId: string;
  matchScore: number;
  reason: string;
  priority: number;
}

/**
 * Ranks an affiliator's own AffiliatorListing catalog against the imported
 * RecommendationRule lookup table for a derived personalColor/undertone/
 * skinTone. Falls back to an empty list for categories/listings that have no
 * matching rule row (e.g. a listing the affiliator added manually, not from
 * the dataset) — callers should top up with RecommendationRuleEngine.rankProducts
 * for those.
 */
export async function rankListingsFromDataset(
  db: PrismaClient,
  affiliatorId: string,
  personalColor: PersonalColor,
  undertone: string,
  skinTone: string,
  limit = 8,
): Promise<DatasetRankedMatch[]> {
  const rules = await db.recommendationRule.findMany({
    where: {
      personalColor,
      undertone: normalizeUndertone(undertone),
      skinTone: normalizeSkinTone(skinTone),
      product: { affiliatorListings: { some: { affiliatorId } } },
    },
    orderBy: [{ category: 'asc' }, { priority: 'asc' }],
    include: {
      product: {
        select: { affiliatorListings: { where: { affiliatorId }, select: { id: true } } },
      },
    },
  });

  const seenListing = new Set<string>();
  const matches: DatasetRankedMatch[] = [];
  for (const rule of rules) {
    const listingId = rule.product.affiliatorListings[0]?.id;
    if (!listingId || seenListing.has(listingId)) continue;
    seenListing.add(listingId);
    matches.push({
      listingId,
      productId: rule.productId,
      matchScore: rule.recommendationScore,
      reason: rule.reason,
      priority: rule.priority,
    });
    if (matches.length >= limit) break;
  }
  return matches;
}
