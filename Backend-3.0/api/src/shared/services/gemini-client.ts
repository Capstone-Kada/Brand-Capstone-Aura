import axios, { type AxiosInstance } from 'axios';
import { z } from 'zod';
import { appConfig } from '../../config/index.js';
import type { ColorSwatch } from '../../modules/recommendation/engine/color-palette.js';
import { logger } from '../utils/logger.js';

export interface ScanNarrativeInput {
  followerName?: string;
  skinTone: string;
  undertone: string;
  faceShape: string;
  personalColor: string;
  /** Resolved from ShadeMapping via resolveColorPalette() — the "retrieval" grounding. */
  palette: ColorSwatch[];
  topProducts: Array<{ name: string; brand: string; category: string }>;
  skinPref?: string;
  finishPref?: string;
  budgetPref?: string;
}

export interface IGeminiClient {
  /**
   * Generates a short Bahasa Indonesia narrative summarizing an AI scan
   * result, grounded in the caller's already-retrieved ShadeMapping/product
   * data. Never throws — this is presentational/optional, unlike AiClient's
   * predict() which the scan flow can't proceed without. On any failure
   * (unconfigured, network error, malformed response) it logs and resolves
   * to `null`, and callers should treat that as "no narrative available".
   */
  generateScanNarrative(input: ScanNarrativeInput): Promise<string | null>;
}

const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string() })).min(1),
        }),
      }),
    )
    .min(1),
});

function buildPrompt(input: ScanNarrativeInput): string {
  const paletteNames = input.palette.map((swatch) => swatch.name).join(', ') || 'tidak ada data palet';
  const productNames =
    input.topProducts.map((p) => `${p.name} (${p.brand})`).join(', ') || 'tidak ada produk yang cocok';

  let prefsText = '';
  if (input.skinPref || input.finishPref || input.budgetPref) {
    prefsText = `\nPreferensi Tambahan Pengguna:\n- Keluhan Kulit: ${input.skinPref || '-'}\n- Hasil Akhir: ${input.finishPref || '-'}\n- Budget: ${input.budgetPref || '-'}`;
  }

  return `Kamu adalah asisten kecantikan AI. Tulis SATU paragraf pendek (2-3 kalimat) dalam Bahasa Indonesia, nada ramah dan personal, merangkum hasil AI skin analysis berikut untuk ditampilkan langsung ke pengguna di aplikasi. Jelaskan juga MENGAPA produk-produk ini direkomendasikan berdasarkan hasil analisis wajah dan preferensi pengguna (jika ada). Jangan pakai markdown, jangan pakai tanda kutip pembuka/penutup, jangan tulis judul — balas HANYA dengan paragraf narasinya.

Data hasil scan:
- Nama panggilan pengguna: ${input.followerName || 'Anda'}
- Skin tone: ${input.skinTone}
- Undertone: ${input.undertone}
- Bentuk wajah: ${input.faceShape}
- Personal color season: ${input.personalColor}
- Palet warna terbaik yang direkomendasikan: ${paletteNames}
- Produk yang paling cocok: ${productNames}${prefsText}`;
}

export class GeminiClient implements IGeminiClient {
  private readonly http: AxiosInstance;
  private readonly apiKey?: string;
  private readonly model: string;

  constructor(
    apiKey = appConfig.gemini.apiKey,
    model = appConfig.gemini.model,
    timeoutMs = appConfig.gemini.timeoutMs,
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.http = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: timeoutMs,
    });
  }

  async generateScanNarrative(input: ScanNarrativeInput): Promise<string | null> {
    if (!this.apiKey) {
      return null;
    }

    const started = Date.now();
    try {
      const response = await this.http.post(
        `/models/${this.model}:generateContent`,
        { contents: [{ parts: [{ text: buildPrompt(input) }] }] },
        { headers: { 'x-goog-api-key': this.apiKey, 'Content-Type': 'application/json' } },
      );

      const parsed = geminiResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        logger.error('Gemini narrative generation returned an invalid payload', {
          durationMs: Date.now() - started,
          issues: parsed.error.issues,
        });
        return null;
      }

      const text = parsed.data.candidates[0].content.parts[0].text.trim();
      logger.info('Gemini narrative generation completed', { durationMs: Date.now() - started });
      return text || null;
    } catch (error) {
      logger.error('Gemini narrative generation failed', {
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : 'unknown',
      });
      return null;
    }
  }
}
