import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { StatusCodes } from "http-status-codes";

interface TokenI {
  id: string;
}

export function verificaToken(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers["authtoken"] as string | undefined;

  if (!authToken) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Token não informado ou inválido" });
    return;
  }

  try {
    jwt.verify(authToken, process.env.JWT_KEY as string) as TokenI;

    next();
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .json({ error: "Token não informado ou inválido" });
  }
}
