import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Usuario from "../models/cxUser";
import { generarJWT } from "../helpers/jwt";
import { validationResult } from "express-validator";

// ─── Helper: validar express-validator errors ─────────────────────────────────
const validarCampos = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return false;
  }
  return true;
};

// 1. SOLICITAR RECUPERACIÓN
export const solicitarRecuperacion = async (req: Request, res: Response) => {
  if (!validarCampos(req, res)) return;
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, msg: "No existe un usuario con ese email" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    (usuario as any).resetPasswordToken = token;
    (usuario as any).resetPasswordExpires = new Date(Date.now() + 3600000);
    await usuario.save();

    res.json({ ok: true, msg: "Token de recuperación generado", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 2. RESTABLECER CONTRASEÑA
export const restablecerPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "El token es inválido o ha expirado" });
    }

    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);
    (usuario as any).resetPasswordToken = null;
    (usuario as any).resetPasswordExpires = null;
    await usuario.save();

    res.json({ ok: true, msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 3. CREAR USUARIO
// ── Solo alcanzable si validarAdmin pasó (el que llama es superadmin) ─────────
export const crearUsuario = async (req: Request, res: Response) => {
  if (!validarCampos(req, res)) return;

  // Acepta tanto "userName" (desde AdminUsers) como "name" (compatibilidad)
  const { email, password, name, userName } = req.body;
  const nombreUsuario = (userName || name || "").trim();

  if (!nombreUsuario) {
    return res.status(400).json({
      ok: false,
      msg: "El nombre de usuario es obligatorio (campo: userName)",
    });
  }

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un usuario con ese correo" });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const usuario = new Usuario({
      userName: nombreUsuario,
      email,
      password: passwordHash,
      accessType: "regular", // Los usuarios creados por superadmin son regulares
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.userName);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.userName,
      email: usuario.email,
      accessType: usuario.accessType,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error al crear usuario" });
  }
};

// 4. LOGIN
export const loginUsuario = async (req: Request, res: Response) => {
  if (!validarCampos(req, res)) return;
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "El usuario no existe con ese email" });
    }

    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({ ok: false, msg: "Password incorrecto" });
    }

    const token = await generarJWT(usuario.id, usuario.userName);

    res.json({
      ok: true,
      uid: usuario.id,
      name: usuario.userName,
      email: usuario.email,
      accessType: usuario.accessType, // ← El frontend lo necesita para RBAC
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 5. REVALIDAR TOKEN
export const revalidarToken = async (req: any, res: Response) => {
  const { uid, name } = req;

  // Releer accessType actualizado desde BD en cada revalidación
  const usuario = await Usuario.findById(uid).select("accessType email");

  const token = await generarJWT(uid, name);
  res.json({
    ok: true,
    uid,
    name,
    email: usuario?.email,
    accessType: usuario?.accessType,
    token,
  });
};