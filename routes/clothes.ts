import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  try {
    const clothes = await prisma.clothe.findMany({
      include: {
        clothingBrand: true,
      },
    });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const clothe = await prisma.clothe.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        clothingBrand: true,
        ratings: { include: { user: { select: { name: true } } } },
        comments: { include: { user: { select: { name: true } } } },
      },
    });

    if (!clothe) {
      return res.status(404).json({ error: "Roupa não encontrada" });
    }

    const averageRating =
      clothe.ratings.reduce((sum, rating) => sum + rating.score, 0) /
        clothe.ratings.length || 0;

    res.json({ ...clothe, averageRating });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar roupa" });
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    photo,
    price,
    size,
    description,
    highlight = true,
    clothingBrandId,
  } = req.body;

  if (!name || !photo || !price || !size || !clothingBrandId || !description) {
    res.status(400).json({
      erro: "Informe dados corretamente!",
    });
    return;
  }

  try {
    const clothes = await prisma.clothe.create({
      data: {
        name,
        photo,
        price,
        size,
        description,
        highlight,
        clothingBrandId,
      },
    });
    res.status(201).json(clothes);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const clothes = await prisma.clothe.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    photo,
    price,
    description,
    size,
    highlight = true,
    clothingBrandId,
  } = req.body;

  if (!name || !photo || !price || !description || !size || !clothingBrandId) {
    res.status(400).json({
      erro: "Informe os dados corretamente",
    });
    return;
  }

  try {
    const clothes = await prisma.clothe.update({
      where: { id: Number(id) },
      data: {
        name,
        photo,
        price,
        size,
        description,
        highlight,
        clothingBrandId,
      },
    });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params;

  try {
    const clothes = await prisma.clothe.findMany({
      include: {
        clothingBrand: true,
      },
      where: {
        OR: [
          { name: { contains: termo } },
          { clothingBrand: { name: { contains: termo } } },
        ],
      },
    });
    res.status(200).json(clothes);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
