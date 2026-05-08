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

    // Respuesta genérica aunque el email no exista (seguridad)
    if (!usuario) {
      return res.json({
        ok: true,
        msg: "Si el correo existe, recibirás un enlace de recuperación pronto",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    (usuario as any).resetPasswordToken   = token;
    (usuario as any).resetPasswordExpires = new Date(Date.now() + 3_600_000); // 1 hora

    await usuario.save();

    await enviarEmailRecuperacion(
      usuario.email,
      (usuario as any).userName,
      token,
    );

    res.json({
      ok: true,
      msg: "Si el correo existe, recibirás un enlace de recuperación pronto",
    });
  } catch (error) {
    console.error("solicitarRecuperacion error:", error);
    res.status(500).json({ ok: false, msg: "Error interno. Intenta de nuevo." });
  }
};

// ============================================
// 2. RESTABLECER CONTRASEÑA
// ============================================
export const restablecerPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "El token es inválido o ha expirado" });
    }

    const salt = bcrypt.genSaltSync(10);
    usuario.password = bcrypt.hashSync(password, salt);

    (usuario as any).resetPasswordToken   = null;
    (usuario as any).resetPasswordExpires = null;

    await usuario.save();

    res.json({ ok: true, msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("restablecerPassword error:", error);
    res.status(500).json({ ok: false, msg: "Error interno. Intenta de nuevo." });
  }
};

// ============================================
// 3. CREAR USUARIO (SOLO ADMIN)
// ============================================
export const crearUsuario = async (req: any, res: Response) => {
  const { email, password, name, accessType = "regular" } = req.body;

  try {
    if (req.accessType !== "admin") {
      return res.status(403).json({
        ok: false,
        msg: "No tienes permisos de administrador para crear usuarios",
      });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res
        .status(400)
        .json({ ok: false, msg: "Ya existe un usuario con ese correo" });
    }

    const salt         = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const usuario = new Usuario({
      email,
      password: passwordHash,
      userName: name,
      accessType,
    });

    await usuario.save();

    res.status(201).json({
      ok:         true,
      uid:        usuario.id,
      name:       (usuario as any).userName,
      email:      usuario.email,
      accessType: (usuario as any).accessType,
      msg:        "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("crearUsuario error:", error);
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

    // DEBUG temporal — eliminar cuando el login funcione
    console.log("Hash en BD:", usuario.password);
    console.log("Password recibido:", password);
    console.log("compareSync:", bcrypt.compareSync(password, usuario.password));

    const validPassword = bcrypt.compareSync(password, usuario.password);

    if (!validPassword) {
      return res
        .status(400)
        .json({ ok: false, msg: "Credenciales incorrectas" });
    }

    const token = await generarJWT(
      usuario.id,
      (usuario as any).userName,
      (usuario as any).accessType,
    );

    res.json({
      ok:         true,
      uid:        usuario.id,
      name:       (usuario as any).userName,
      email:      usuario.email,
      accessType: (usuario as any).accessType,
      token,
    });
  } catch (error) {
    console.error("loginUsuario error:", error);
    res.status(500).json({ ok: false, msg: "Error interno. Intenta de nuevo." });
  }
};

// ============================================
// 5. REVALIDAR TOKEN
// ============================================
export const revalidarToken = async (req: any, res: Response) => {
  const { uid, name, accessType } = req;

  try {
    const token = await generarJWT(uid, name, accessType);
    res.json({ ok: true, uid, name, accessType, token });
  } catch (error) {
    console.error("revalidarToken error:", error);
    res.status(500).json({ ok: false, msg: "Error al revalidar token" });
  }
};