-- CreateTable
CREATE TABLE `clothingBrands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clothes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DECIMAL(10, 2) NOT NULL,
    `size` MEDIUMINT NOT NULL,
    `highlight` BOOLEAN NOT NULL DEFAULT true,
    `photo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `material` ENUM('Cotton', 'Elastane', 'Wool', 'Silk', 'Viscose', 'Tencel', 'Linen', 'Poliester') NOT NULL DEFAULT 'Cotton',
    `clothingBrandId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clothes` ADD CONSTRAINT `clothes_clothingBrandId_fkey` FOREIGN KEY (`clothingBrandId`) REFERENCES `clothingBrands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
