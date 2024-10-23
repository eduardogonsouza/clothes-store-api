import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = Router();

function validaSenha(senha: string) {
  const mensa: string[] = [];

  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres");
  }

  let pequenas = 0;
  let grandes = 0;
  let numeros = 0;
  let simbolos = 0;

  for (const letra of senha) {
    if (/[a-z]/.test(letra)) {
      pequenas++;
    } else if (/[A-Z]/.test(letra)) {
      grandes++;
    } else if (/[0-9]/.test(letra)) {
      numeros++;
    } else {
      simbolos++;
    }
  }

  if (pequenas === 0 || grandes === 0 || numeros === 0 || simbolos === 0) {
    mensa.push(
      "Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos"
    );
  }

  return mensa;
}

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const senhaErros = validaSenha(password);
  if (senhaErros.length > 0) {
    return res.status(400).json({ errors: senhaErros });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      const senhaErros = validaSenha(password);
      if (senhaErros.length > 0) {
        return res.status(400).json({ errors: senhaErros });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

router.post("/request-reset/:email", async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const recoveryCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { recoveryCode },
    });

    console.log(`Código de recuperação para ${email}: ${recoveryCode}`);
  } catch (error) {
    res.status(500).json({ error: "Erro ao solicitar redefinição de senha" });
  }
});

router.post("/reset-password/:email", async (req, res) => {
  const { email } = req.params;
  const { recoveryCode, newPassword } = req.body;

  if (!email || !recoveryCode || !newPassword) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const senhaErros = validaSenha(newPassword);
  if (senhaErros.length > 0) {
    return res.status(400).json({ errors: senhaErros });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.recoveryCode !== recoveryCode) {
      return res.status(400).json({ error: "Código de recuperação inválido" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, recoveryCode: null },
    });

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
});

export default router;
