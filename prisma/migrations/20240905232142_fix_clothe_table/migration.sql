/*
  Warnings:

  - You are about to drop the column `material` on the `clothes` table. All the data in the column will be lost.
  - Added the required column `name` to the `clothes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clothes` DROP COLUMN `material`,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    MODIFY `size` VARCHAR(50) NOT NULL;
