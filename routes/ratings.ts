import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/clothe/:clotheId", async (req, res) => {
  const { clotheId } = req.params;

  try {
    const ratings = await prisma.rating.findMany({
      where: { clotheId: Number(clotheId) },
      include: { user: { select: { name: true } } },
    });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(400).json({ error: "Error fetching ratings" });
  }
});

router.post("/:clotheId", async (req, res) => {
  const { clotheId } = req.params;
  const { userId, score } = req.body;

  if (!userId || !score) {
    return res.status(400).json({ error: "User ID and score are required" });
  }

  try {
    const rating = await prisma.rating.create({
      data: {
        userId,
        clotheId: Number(clotheId),
        score,
      },
    });
    res.status(201).json(rating);
  } catch (error) {
    res.status(400).json({ error: "Error creating rating" });
  }
});

router.put("/:ratingId", async (req, res) => {
  const { ratingId } = req.params;
  const { score } = req.body;

  if (!score) {
    return res.status(400).json({ error: "Score is required" });
  }

  try {
    const rating = await prisma.rating.update({
      where: { id: Number(ratingId) },
      data: { score },
    });
    res.status(200).json(rating);
  } catch (error) {
    res.status(400).json({ error: "Error updating rating" });
  }
});

router.delete("/:ratingId", async (req, res) => {
  const { ratingId } = req.params;

  try {
    await prisma.rating.delete({
      where: { id: Number(ratingId) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Error deleting rating" });
  }
});

export default router;
