import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const validarJWT = (req: any, res: Response, next: NextFunction) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    // ── CORRECCIÓN: extraer también accessType del payload ────────────────
    // generarJWT firma { uid, name, accessType } — los tres deben extraerse
    // para que crearUsuario pueda verificar req.accessType === "admin"
    const { uid, name, accessType }: any = jwt.verify(
      token,
      process.env.SECRET_JWT_SEED || "Palabra-Secreta-De-Respaldo",
    );

    req.uid        = uid;
    req.name       = name;
    req.accessType = accessType; // ← antes faltaba esta línea

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }
};