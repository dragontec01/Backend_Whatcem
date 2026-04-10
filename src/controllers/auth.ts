import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Usuario from "../models/Usuario";
import { generarJWT } from "../helpers/jwt";

// 1. SOLICITAR RECUPERACIÓN (Genera el token temporal)
export const solicitarRecuperacion = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, msg: "No existe un usuario con ese email" });
    }

    // Crear un token único y aleatorio
    const token = crypto.randomBytes(20).toString("hex");

    // Guardar token y expiración (1 hora)
    // Usamos el casting 'any' si el modelo aún no reconoce los campos nuevos
    (usuario as any).resetPasswordToken = token;
    (usuario as any).resetPasswordExpires = new Date(Date.now() + 3600000);

    await usuario.save();

    res.json({
      ok: true,
      msg: "Token de recuperación generado",
      token, // Este es el que usarás en Postman
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 2. RESTABLECER CONTRASEÑA (Usa el token para cambiar la clave)
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

    res.json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 3. CREAR USUARIO (Registro)
export const crearUsuario = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Un usuario ya existe con ese correo",
      });
    }

    usuario = new Usuario(req.body);
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    console.log("✅ Registro exitoso en DB");

    const token = await generarJWT(usuario.id, usuario.name);

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Error al crear usuario" });
  }
};

// 4. LOGIN USUARIO
export const loginUsuario = async (req: Request, res: Response) => {
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

    const token = await generarJWT(usuario.id, usuario.name);
    res.json({ ok: true, uid: usuario.id, name: usuario.name, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Hable con el administrador" });
  }
};

// 5. REVALIDAR TOKEN
export const revalidarToken = async (req: any, res: Response) => {
  const { uid, name } = req;
  const token = await generarJWT(uid, name);
  res.json({ ok: true, uid, name, token });
};
