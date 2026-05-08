import { Router } from "express";
import { registrarCliente } from "../controllers/client";
import { validarJWT } from "../middlewares/validar-jwt";

const router = Router();

router.use(validarJWT);

router.post("/", registrarCliente);

export default router;
