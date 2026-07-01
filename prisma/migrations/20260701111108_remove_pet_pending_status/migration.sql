/*
  Warnings:

  - The values [PENDING] on the enum `PetStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PetStatus_new" AS ENUM ('AVAILABLE', 'ADOPTED');
ALTER TABLE "pets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pets" ALTER COLUMN "status" TYPE "PetStatus_new" USING ("status"::text::"PetStatus_new");
ALTER TYPE "PetStatus" RENAME TO "PetStatus_old";
ALTER TYPE "PetStatus_new" RENAME TO "PetStatus";
DROP TYPE "PetStatus_old";
ALTER TABLE "pets" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;
