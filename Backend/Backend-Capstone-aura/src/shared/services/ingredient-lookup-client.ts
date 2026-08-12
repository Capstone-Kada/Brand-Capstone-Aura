import axios, { type AxiosInstance, isAxiosError } from 'axios';
import { z } from 'zod';
import { appConfig } from '../../config/index.js';
import { AiServiceError } from '../errors/app-error.js';
import { logger } from '../utils/logger.js';

/**
 * Built against a generic OpenAI-compatible chat-completions contract, the most common
 * shape for custom/self-hosted AI backends. If the configured provider's request/response
 * shape differs, only this file needs to change.
 */
const ingredientListSchema = z.array(z.string().min(1)).max(50);

export interface IngredientLookupInput {
  brand: string;
  name: string;
  category: string;
}

export interface IIngredientLookupClient {
  lookupIngredients(input: IngredientLookupInput): Promise<string[]>;
}

function buildPrompt({ brand, name, category }: IngredientLookupInput): string {
  return [
    `List the likely cosmetic ingredients (INCI names) for this ${category} product:`,
    `Brand: ${brand}`,
    `Product: ${name}`,
    '',
    'Respond with ONLY a JSON array of ingredient name strings, no other text.',
  ].join('\n');
}

function extractJsonArray(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in response');
    return JSON.parse(match[0]);
  }
}

export class IngredientLookupClient implements IIngredientLookupClient {
  private readonly http: AxiosInstance;

  constructor(
    private readonly baseUrl = appConfig.ingredientAi.baseUrl,
    private readonly apiKey = appConfig.ingredientAi.apiKey,
    private readonly model = appConfig.ingredientAi.model,
    timeoutMs = appConfig.ingredientAi.timeoutMs,
  ) {
    this.http = axios.create({ timeout: timeoutMs });
  }

  async lookupIngredients(input: IngredientLookupInput): Promise<string[]> {
    if (!this.baseUrl || !this.apiKey) {
      throw new AiServiceError('Ingredient AI not configured', {
        missing: [
          !this.baseUrl && 'INGREDIENT_AI_BASE_URL',
          !this.apiKey && 'INGREDIENT_AI_API_KEY',
        ].filter(Boolean),
      });
    }

    const started = Date.now();
    try {
      const response = await this.http.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: buildPrompt(input) }],
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } },
      );

      const content: unknown = response.data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new AiServiceError('Ingredient AI returned an unexpected payload shape');
      }

      const parsed = ingredientListSchema.safeParse(extractJsonArray(content));
      if (!parsed.success) {
        throw new AiServiceError('Ingredient AI returned an invalid ingredient list', parsed.error.issues);
      }

      logger.info('Ingredient lookup completed', {
        durationMs: Date.now() - started,
        brand: input.brand,
        name: input.name,
        ingredientCount: parsed.data.length,
      });

      return parsed.data;
    } catch (error) {
      logger.error('Ingredient lookup failed', {
        durationMs: Date.now() - started,
        brand: input.brand,
        name: input.name,
        error: error instanceof Error ? error.message : 'unknown',
      });

      if (error instanceof AiServiceError) {
        throw error;
      }

      if (isAxiosError(error)) {
        throw new AiServiceError(error.message || 'Ingredient AI request failed', {
          status: error.response?.status,
        });
      }

      throw new AiServiceError('Failed to reach ingredient AI service');
    }
  }
}
