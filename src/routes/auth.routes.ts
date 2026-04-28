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

// --- RUTAS DE AUTENTICACIÓN EXISTENTES ---

router.post(
  "/",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe ser de 6 caracteres").isLength({
      min: 6,
    }),
    validarCampos,
  ],
  loginUsuario,
);

// Crear usuario (Solo para Admins - el middleware validarJWT extrae el accessType)
router.post(
  "/new",
  [
    validarJWT,
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe ser de 6 caracteres").isLength({
      min: 6,
    }),
    validarCampos,
  ],
  crearUsuario,
);

router.get("/renew", validarJWT, revalidarToken);

// --- RUTAS DE RECUPERACIÓN DE CONTRASEÑA ---

// 1. Solicitar recuperación
router.post(
  "/forgot-password",
  [check("email", "El email es obligatorio").isEmail(), validarCampos],
  solicitarRecuperacion,
);

// 2. Restablecer contraseña
router.post(
  "/reset-password",
  [
    check("token", "El token es obligatorio").not().isEmpty(),
    check(
      "password",
      "La nueva contraseña debe tener al menos 6 caracteres",
    ).isLength({ min: 6 }),
    validarCampos,
  ],
  restablecerPassword,
);

export default router;
