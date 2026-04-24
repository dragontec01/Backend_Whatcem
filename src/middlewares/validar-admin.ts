// src/middlewares/validar-admin.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Usuario from "../models/cxUser";

/**
 * NOTA SOBRE EL JWT DE ESTE PROYECTO
 * ------------------------------------
 * generarJWT (helpers/jwt.ts) firma: { uid, name }
 * auth.middleware.ts tiene JwtPayload con { userId, email } — ese middleware
 * es de otro sistema y NO es compatible con los tokens que genera este backend.
 *
 * validarAdmin usa ÚNICAMENTE el payload { uid, name } que genera generarJWT.
 * NO importa JwtPayload de auth.middleware para evitar la confusión.
 */

// Payload real que produce generarJWT
interface TokenPayload {
  uid: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Extiende Request para poder inyectar datos hacia el controlador
export interface AdminRequest extends Request {
  uid?: string;
  name?: string;
  accessType?: string;
}

export const validarAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  // Lee el token del header Authorization: Bearer <token>
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ ok: false, msg: "No hay token en la petición" });
  }

  try {
    const seed = process.env.SECRET_JWT_SEED || "Palabra-Secreta-De-Respaldo";

    // Decodifica con el payload real: { uid, name }
    const payload = jwt.verify(token, seed) as TokenPayload;

    // Buscar el usuario por su _id (que se guardó en payload.uid)
    const usuario = await Usuario.findById(payload.uid);

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        msg: "Token no válido: usuario no encontrado en BD",
      });
    }

    if (usuario.accessType !== "superadmin") {
      return res.status(403).json({
        ok: false,
        msg: `Acceso denegado. Tu rol es '${usuario.accessType}', se requiere 'superadmin'`,
      });
    }

    // Inyectar en el request para uso posterior en controladores
    req.uid        = String(payload.uid);
    req.name       = payload.name;
    req.accessType = usuario.accessType;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ ok: false, msg: "Token expirado" });
    }
    return res.status(401).json({ ok: false, msg: "Token no válido" });
  }
};