-- AlterTable
ALTER TABLE "products" ADD COLUMN     "composition" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "composition_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "composition_updated_at" TIMESTAMP(3);
