import { Router } from "express";
import { check } from "express-validator";
import {
  crearUsuario,
  loginUsuario,
  revalidarToken,
} from "../controllers/auth";
import { validarJWT } from "../middlewares/validar-jwt";
const router = Router();

// 1. Crear nuevo usuario (POST /api/auth/new)
router.post(
  "/new",
  [
    // Middlewares de validación
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe de ser de 6 caracteres").isLength({
      min: 6,
    }),
  ],
  crearUsuario,
);

// 2. Login de usuario (POST /api/auth/login)
router.post(
  "/login",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe de ser de 6 caracteres").isLength({
      min: 6,
    }),
  ],
  loginUsuario,
);

// 3. Revalidar Token (GET /api/auth/renew)
router.get("/renew", validarJWT, revalidarToken);

export default router;
