import nodemailer from "nodemailer";

export const enviarEmailRecuperacion = async (
  email: string,
  nombre: string,
  token: string,
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const urlFront = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Soporte Whatcem" <soporte@whatcem.com>',
    to: email,
    subject: "Restablece tu contraseña",
    html: `
            <p>Hola ${nombre},</p>
            <p>Has solicitado restablecer tu contraseña para tu cuenta en Whatcem.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${urlFront}">Restablecer mi contraseña</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `,
  });
};
