import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const validarJWT = (req: any, res: Response, next: NextFunction) => {
  // Leer el token del header 'x-token'
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    // Verificar el token usando la semilla de tu .env
    const { uid, name }: any = jwt.verify(
      token,
      process.env.SECRET_JWT_SEED || "",
    );

    // Inyectamos el uid y name en la petición para que el controlador los use
    req.uid = uid;
    req.name = name;
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }

  next();
};
