import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { PrismaClient } from "@prisma/client";
import { verificaToken } from "../middlewares/auth";

export const adminRouter: Router = Router();

type authTokenPayload = {
  id: string;
};

const prisma = new PrismaClient();

adminRouter.post("/verifyToken", async (req: Request, res: Response) => {
  const authToken = req.body["authToken"] as string | undefined;

  if (!authToken) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Token não informado ou inválido" });
    return;
  }

  try {
    const payload = jwt.verify(
      authToken,
      process.env.JWT_KEY as string
    ) as authTokenPayload;

    return res.status(StatusCodes.OK).json({ ...payload });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .json({ error: "Token não informado ou inválido" });
  }
});

adminRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Email e senha são obrigatórios" });
    }

    const adminUser = await prisma.admin.findUnique({
      where: { email }
    });

    if (!adminUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Credenciais inválidas" });
    }

    const authToken = jwt.sign(
      {
        id: adminUser.id
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    );

    const { password: adminPassword, ...adminWithoutPassword } = adminUser;

    return res.status(200).json({
      ...adminWithoutPassword,
      authToken
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Erro ao fazer login" });
  }
});

adminRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Dados faltantes" });
    }

    const isEmailUnvailable = await prisma.admin.findUnique({
      where: { email }
    });

    if (isEmailUnvailable) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Não é possivel cadastrar com esses dados!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.admin.create({
      data: { name, password: hashedPassword, email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const authToken = jwt.sign(
      {
        id: adminUser.id
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ admin: adminUser, authToken });
  } catch (error) {
    console.log("Dentro do Catch");
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
});

adminRouter.get("/", verificaToken, async (_req: Request, res: Response) => {
  try {
    const adminUsers = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        password: false,
        email: true
      }
    });
    res.json(adminUsers);
  } catch (error) {
    res.status(500).json({ message: "Erro buscando dados" });
  }
});

adminRouter.get(
  "/analytics",
  verificaToken,
  async (_req: Request, res: Response) => {
    try {
      const clothesByBrand = await prisma.clothingBrand.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { clothes: true }
          }
        },
        orderBy: {
          name: "asc"
        }
      });

      const totalComments = await prisma.comment.count();

      res.json({ clothesByBrand, totalComments });
    } catch (error) {
      res.status(500).json({ message: "Erro buscando dados" });
    }
  }
);
