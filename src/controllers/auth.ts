import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Usuario from "../models/cxUser";
import { generarJWT } from "../helpers/jwt";
import { enviarEmailRecuperacion } from "../helpers/email";

// ============================================
// 1. SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================
export const solicitarRecuperacion = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, msg: "No existe un usuario con ese email" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    // Guardar token y expiración (1 hora)
    (usuario as any).resetPasswordToken = token;
    (usuario as any).resetPasswordExpires = new Date(Date.now() + 3600000);

    await usuario.save();

    // Enviar el correo electrónico
    await enviarEmailRecuperacion(
      usuario.email,
      (usuario as any).userName,
      token,
    );

    res.json({
      ok: true,
      msg: "Se ha enviado un enlace de recuperación a su correo",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// ============================================
// 2. RESTABLECER CONTRASEÑA
// ============================================
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

    // Encriptar la nueva contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    // Limpiar campos de recuperación
    (usuario as any).resetPasswordToken = undefined;
    (usuario as any).resetPasswordExpires = undefined;

    await usuario.save();

    res.json({ ok: true, msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// ============================================
// 3. CREAR USUARIO (SOLO ADMIN)
// ============================================
export const crearUsuario = async (req: any, res: Response) => {
  const { email, password, name, accessType = "regular" } = req.body;

  try {
    // Verificar que quien hace la petición es ADMIN
    if (req.accessType !== "admin") {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permisos de administrador para crear usuarios",
      });
    }

    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un usuario con ese correo" });
    }

    // Crear nuevo usuario
    usuario = new Usuario({
      email,
      password,
      userName: name,
      accessType,
    });

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: (usuario as any).userName,
      email: usuario.email,
      accessType: (usuario as any).accessType,
      msg: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Error al crear usuario" });
  }
};

// ============================================
// 4. LOGIN DE USUARIO
// ============================================
export const loginUsuario = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    // Validar contraseña
    const validPassword = bcrypt.compareSync(password, usuario.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    // Generar JWT incluyendo uid, name y accessType
    const token = await generarJWT(
      usuario.id,
      (usuario as any).userName,
      (usuario as any).accessType,
    );

    res.json({
      ok: true,
      uid: usuario.id,
      name: (usuario as any).userName,
      email: usuario.email,
      accessType: (usuario as any).accessType,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// ============================================
// 5. REVALIDAR TOKEN
// ============================================
export const revalidarToken = async (req: any, res: Response) => {
  const { uid, name, accessType } = req;

  try {
    // Generar nuevo JWT
    const token = await generarJWT(uid, name, accessType);

    res.json({
      ok: true,
      uid,
      name,
      accessType,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Error al revalidar token" });
  }
};
