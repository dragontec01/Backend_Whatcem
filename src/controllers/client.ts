import { Request, Response } from "express";
import Client from "../models/client";

export const registrarCliente = async (req: Request, res: Response) => {
  try {
    const { name, owner, email, phone, tenants } = req.body;

    // 1. Verificar si el cliente ya existe
    const existeCliente = await Client.findOne({ email });
    if (existeCliente) {
      return res.status(400).json({
        ok: false,
        msg: "Un cliente con ese correo ya existe",
      });
    }

    // 2. Crear el cliente
    const nuevoCliente = new Client({
      name,
      owner,
      email,
      phone,
      tenants: tenants.map((t: any) => ({
        ...t,
        soldBy: req.uid,
      })),
    });

    await nuevoCliente.save();

    res.status(201).json({
      ok: true,
      client: nuevoCliente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al registrar el cliente, hable con el administrador",
    });
  }
};
