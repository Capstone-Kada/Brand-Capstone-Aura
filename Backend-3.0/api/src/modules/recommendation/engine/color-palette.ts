import { logger } from '../../../shared/utils/logger.js';

export interface ColorSwatch {
  name: string;
  colorHex: string;
}

/**
 * Base color words -> hex, covering every recurring word found across the 40
 * rows of dataset\data\shade_mapping.csv. Order matters: more specific words
 * are checked before generic ones (e.g. "brick" before "red") since matching
 * is substring-based against free-text phrases like "Brick red, terracotta".
 */
const COLOR_WORD_TO_HEX: Array<[string, string]> = [
  ['brick', '#B22222'],
  ['cranberry', '#9F000F'],
  ['terracotta', '#E2725B'],
  ['cinnamon', '#D2691E'],
  ['champagne', '#F7E7CE'],
  ['bronze', '#CD7F32'],
  ['camel', '#C19A6B'],
  ['chocolate', '#7B3F00'],
  ['charcoal', '#36454F'],
  ['taupe', '#8B8589'],
  ['apricot', '#FBCEB1'],
  ['coral', '#FF7F50'],
  ['peach', '#FFCBA4'],
  ['gold', '#D4AF37'],
  ['silver', '#C0C0C0'],
  ['rose', '#C08081'],
  ['mauve', '#B784A7'],
  ['berry', '#8B004B'],
  ['olive', '#708238'],
  ['navy', '#1F2A44'],
  ['plum', '#8E4585'],
  ['nude', '#E3BC9A'],
  ['beige', '#D2B48C'],
  ['pink', '#FFC0CB'],
  ['red', '#C41E3A'],
];

const FALLBACK_HEX = '#9CA3AF';

function hexForPhrase(phrase: string): string {
  const lower = phrase.toLowerCase();
  const match = COLOR_WORD_TO_HEX.find(([word]) => lower.includes(word));
  if (!match) {
    logger.warn('No hex mapping for shade_mapping color phrase', { phrase });
    return FALLBACK_HEX;
  }
  return match[1];
}

/**
 * Extracts up to 4 distinct color swatches from a ShadeMapping row's
 * free-text color fields (comma-separated phrases, no hex codes in the
 * source data — see dataset\data\shade_mapping.csv).
 */
export function resolveColorPalette(mapping: {
  recommendedJewelryColor: string;
  recommendedBlushColor: string;
  recommendedEyeshadowPalette: string;
  recommendedLipColor: string;
}): ColorSwatch[] {
  const phrases = [
    mapping.recommendedJewelryColor,
    mapping.recommendedBlushColor,
    mapping.recommendedEyeshadowPalette,
    mapping.recommendedLipColor,
  ].flatMap((value) => value.split(',').map((v) => v.trim()));

  const seen = new Set<string>();
  const palette: ColorSwatch[] = [];
  for (const phrase of phrases) {
    if (!phrase) continue;
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    palette.push({ name: phrase, colorHex: hexForPhrase(phrase) });
    if (palette.length >= 4) break;
  }
  return palette;
}
