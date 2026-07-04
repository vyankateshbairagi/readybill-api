/*
  Warnings:

  - You are about to drop the column `dueAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SaleItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceNo]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Made the column `mobile` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `invoiceNo` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Customer_mobile_key";

-- AlterTable
ALTER TABLE "public"."Customer" ALTER COLUMN "mobile" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "dueAmount",
DROP COLUMN "paidAmount",
DROP COLUMN "totalAmount",
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "invoiceNo" TEXT NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."SaleItem" DROP COLUMN "createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "Sale_invoiceNo_key" ON "public"."Sale"("invoiceNo");
