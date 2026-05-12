import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";   // ← agregar este import

export const validarJWT = (req: any, res: Response, next: NextFunction) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    const { uid, name, accessType }: any = jwt.verify(
      token,
      config.jwtSecret,   // ← mismo secret que usa generarJWT
    );

    req.uid        = uid;
    req.name       = name;
    req.accessType = accessType;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }
};