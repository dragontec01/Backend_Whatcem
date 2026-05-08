import { Router } from "express";
import { check } from "express-validator";
import {
  crearUsuario,
  loginUsuario,
  revalidarToken,
  solicitarRecuperacion,
  restablecerPassword,
} from "../controllers/auth";
import { validarCampos } from "../middlewares/validar-campos";
import { validarJWT } from "../middlewares/validar-jwt";

const router = Router();

// ===========================
// RUTAS DE AUTENTICACIÓN
// ===========================

// Login de usuario (pública)
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe ser de 6 caracteres").isLength({ min: 6 }),
    validarCampos,
  ],
  loginUsuario,
);

// Crear usuario (solo para admins autenticados)
router.post(
  "/new",
  [
    validarJWT,
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe ser de 6 caracteres").isLength({ min: 6 }),
    validarCampos,
  ],
  crearUsuario,
);

// Revalidar token (renovar JWT)
router.get("/renew", validarJWT, revalidarToken);

// ===========================
// RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// ===========================

// Solicitar recuperación de contraseña
router.post(
  "/forgot-password",
  [check("email", "El email es obligatorio").isEmail(), validarCampos],
  solicitarRecuperacion,
);

// Restablecer contraseña con token
router.post(
  "/reset-password",
  [
    check("token", "El token es obligatorio").not().isEmpty(),
    check("password", "La nueva contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
    validarCampos,
  ],
  restablecerPassword,
);

export default router;