import { Router } from "express";
import { check } from "express-validator";
import {
  crearUsuario,
  loginUsuario,
  revalidarToken,
  solicitarRecuperacion,
  restablecerPassword,
} from "../controllers/auth";
import { validarJWT } from "../middlewares/validar-jwt";
import { validarAdmin } from "../middlewares/validar-admin"; // ← NUEVO

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/new  →  Crear usuario
// PROTEGIDA: solo superadmin puede crear usuarios
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/new",
  [
    validarAdmin, // 1° verifica token + rol superadmin
    check("userName", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe tener mínimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  crearUsuario
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login  →  Login (pública)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe tener mínimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  loginUsuario
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/renew  →  Revalidar token (cualquier usuario autenticado)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/renew", validarJWT, revalidarToken);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password  →  Solicitar recuperación (pública)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/forgot-password",
  [check("email", "El email es obligatorio").isEmail()],
  solicitarRecuperacion
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password  →  Restablecer contraseña (pública)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/reset-password",
  [
    check("token", "El token es obligatorio").not().isEmpty(),
    check("password", "El password debe tener mínimo 6 caracteres").isLength({
      min: 6,
    }),
  ],
  restablecerPassword
);

export default router;