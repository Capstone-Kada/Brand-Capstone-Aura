/**
 * CLI: backfill AI-inferred ingredient composition for existing products.
 *
 *   npm run backfill:composition
 *   npx tsx scripts/backfill-composition.ts --limit=20 --dry-run
 */
import { PrismaClient } from '@prisma/client';
import { IngredientLookupClient } from '../src/shared/services/ingredient-lookup-client.js';

const prisma = new PrismaClient();
const lookupClient = new IngredientLookupClient();

function parseArgs(argv: string[]): { limit: number; dryRun: boolean } {
  let limit = 100;
  let dryRun = false;

  for (const arg of argv) {
    if (arg.startsWith('--limit=')) limit = Math.max(1, Number(arg.slice('--limit='.length)));
    if (arg === '--dry-run') dryRun = true;
  }

  return { limit, dryRun };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const { limit, dryRun } = parseArgs(process.argv.slice(2));

  const products = await prisma.product.findMany({
    where: { compositionStatus: { in: ['pending', 'failed'] } },
    take: limit,
    select: { id: true, brand: true, name: true, category: true },
  });

  let completed = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const composition = await lookupClient.lookupIngredients({
        brand: product.brand,
        name: product.name,
        category: product.category,
      });

      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: { composition, compositionStatus: 'completed', compositionUpdatedAt: new Date() },
        });
      }
      completed += 1;
      // eslint-disable-next-line no-console
      console.log(`[ok] ${product.brand} ${product.name} -> ${composition.length} ingredients`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'unknown';
      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: { compositionStatus: 'failed', compositionUpdatedAt: new Date() },
        });
      }
      // eslint-disable-next-line no-console
      console.log(`[fail] ${product.brand} ${product.name} -> ${message}`);
    }

    await delay(300);
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ processed: products.length, completed, failed, dryRun }, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
