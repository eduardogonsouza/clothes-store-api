import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();


router.get("/", async (req_, res) => {
  try {
    const brands = await prisma.clothingBrand.findMany();
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ erro: "Informe o nome da marca" });
    return;
  }

  try {
    const brands = await prisma.clothingBrand.create({
      data: { name },
    });
    res.status(201).json(brands);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const brands = await prisma.clothingBrand.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ erro: "Informe o nome da marca" });
    return;
  }

  try {
    const brands = await prisma.clothingBrand.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
