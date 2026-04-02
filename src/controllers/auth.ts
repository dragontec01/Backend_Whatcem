import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario";
import { generarJWT } from "../helpers/jwt";

// 1. CREAR USUARIO
export const crearUsuario = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res
        .status(400)
        .json({ ok: false, msg: "Un usuario ya existe con ese correo" });
    }
    usuario = new Usuario(req.body);
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);
    await usuario.save();
    const token = await generarJWT(usuario.id, usuario.name);
    res
      .status(201)
      .json({ ok: true, uid: usuario.id, name: usuario.name, token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ ok: false, msg: "Por favor hable con el administrador" });
  }
};

// 2. LOGIN USUARIO (¡Esta es la que faltaba en tu último archivo!)
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

// 3. REVALIDAR TOKEN
export const revalidarToken = async (req: any, res: Response) => {
  const { uid, name } = req;
  const token = await generarJWT(uid, name);
  res.json({ ok: true, uid, name, token });
};
