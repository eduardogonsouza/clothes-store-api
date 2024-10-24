import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/clothe/:clotheId", async (req, res) => {
  const { clotheId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { clotheId: Number(clotheId) },
      include: { user: { select: { name: true } } },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(400).json({ error: "Error fetching comments" });
  }
});

router.post("/:clotheId", async (req, res) => {
  const { clotheId } = req.params;
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: "User ID and content are required" });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId,
        clotheId: Number(clotheId),
        content,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: "Error creating comment" });
  }
});

router.put("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const comment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: { content },
    });
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ error: "Error updating comment" });
  }
});

router.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Error deleting comment" });
  }
});

export default router;
