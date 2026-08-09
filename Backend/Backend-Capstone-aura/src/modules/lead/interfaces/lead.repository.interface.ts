import type { ListingDto } from '../../listing/interfaces/listing.repository.interface.js';
import type { ColorSwatch } from '../../recommendation/engine/color-palette.js';
import type { PersonalColor } from '../../recommendation/engine/dataset-rule-engine.js';

export interface SubmitLeadInput {
  slug: string;
  imagePath: string;
  mimetype: string;
  followerName?: string;
  followerHandle?: string;
  email?: string;
  location?: string;
}

export interface RecommendedListingDto {
  product: ListingDto;
  matchScore: number;
  recommendedShade?: string;
  aiReason: string;
}

export interface LeadScanResultDto {
  leadId: string;
  scanId: string;
  confidence: number;
  personalColor: PersonalColor;
  undertone: string;
  skinTone: string;
  faceShape: string;
  bestColorPalette: ColorSwatch[];
  recommendedProducts: RecommendedListingDto[];
}

export interface CustomerLeadDto {
  id: string;
  scanDate: string;
  followerName: string | null;
  followerHandle: string | null;
  email: string | null;
  selfieUrl: string | null;
  detectedSkinTone: string;
  detectedUndertone: string;
  personalColor: string | null;
  confidence: number;
  faceShape: string;
  bestColorPalette: ColorSwatch[];
  matchedProductCount: number;
  topMatchedProduct: string | null;
  clickedAffiliate: boolean;
  estimatedCommission: number;
  location: string | null;
}
