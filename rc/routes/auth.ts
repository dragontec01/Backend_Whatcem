import { Router } from "express";
// Si el archivo se llama auth.ts y está en controllers, esta es la ruta:
import { crearUsuario } from "../controllers/auth";

const router = Router();

// Definir la ruta de creación de usuario
router.post("/new", crearUsuario);

export default router;
