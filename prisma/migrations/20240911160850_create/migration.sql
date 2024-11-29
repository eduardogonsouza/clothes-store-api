-- CreateTable
CREATE TABLE "clothingBrands" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,

    CONSTRAINT "clothingBrands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "size" VARCHAR(50) NOT NULL,
    "highlight" BOOLEAN NOT NULL DEFAULT true,
    "photo" VARCHAR(500) NOT NULL,
    "clothingBrandId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clothes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clothes" ADD CONSTRAINT "clothes_clothingBrandId_fkey" FOREIGN KEY ("clothingBrandId") REFERENCES "clothingBrands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
