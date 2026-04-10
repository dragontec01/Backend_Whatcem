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

// Ruta para crear un nuevo usuario
router.post(
  "/new",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password debe ser de 6 caracteres").isLength({
      min: 6,
    }),
    validarCampos,
  ],
  crearUsuario,
);

// 2. Ruta para el Login
router.post(
  "/",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password es obligatorio").isLength({ min: 6 }),
    validarCampos,
  ],
  loginUsuario,
);

router.get("/renew", validarJWT, revalidarToken);

export default router;

// Solicitar recuperación (envía token al "correo")
router.post(
  "/forgot-password",
  [check("email", "El email es obligatorio").isEmail(), validarCampos],
  solicitarRecuperacion,
);

// Restablecer con el token
router.post(
  "/reset-password",
  [
    check("token", "El token es obligatorio").not().isEmpty(),
    check("password", "El password debe ser de 6 caracteres").isLength({
      min: 6,
    }),
    validarCampos,
  ],
  restablecerPassword,
);
