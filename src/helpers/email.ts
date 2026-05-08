import nodemailer from "nodemailer";

/**
 * CORRECCIÓN: la URL del enlace debe coincidir con la ruta del frontend.
 *
 * Ruta en router/index.tsx:  /reset-password/:token
 * URL anterior en email.ts:  /auth/reset-password/:token  ← INCORRECTO
 * URL corregida:             /reset-password/:token       ← CORRECTO
 *
 * La variable de entorno FRONTEND_URL debe estar en el .env del backend:
 *   FRONTEND_URL=http://localhost:5173
 *
 * En producción:
 *   FRONTEND_URL=https://tu-dominio.com
 */

export const enviarEmailRecuperacion = async (
  email: string,
  nombre: string,
  token: string,
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ── URL corregida: /reset-password/:token (sin /auth/) ────────────────────
  const urlFront = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const year     = new Date().getFullYear();

  await transporter.sendMail({
    from: '"Soporte CX Dtec" <soporte@cxdtec.com>',
    to: email,
    subject: "Restablece tu contraseña — CX Dtec",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña — CX Dtec</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:Arial,sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#f0f2f5;padding:48px 16px;">
    <tr><td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="600"
             style="max-width:600px;background-color:#ffffff;border-radius:16px;
                    overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr>
          <td align="center" style="background-color:#0d5c73;padding:28px 40px;">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" valign="middle"
                    style="background-color:rgba(255,255,255,0.15);border-radius:8px;
                           width:36px;height:36px;padding:8px;">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNy41IiBoZWlnaHQ9IjcuNSIgcng9IjEuNSIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxMSIgeT0iMSIgd2lkdGg9IjcuNSIgaGVpZ2h0PSI3LjUiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMSIgeT0iMTEiIHdpZHRoPSI3LjUiIGhlaWdodD0iNy41IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjExIiB5PSIxMSIgd2lkdGg9IjcuNSIgaGVpZ2h0PSI3LjUiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
                       width="20" height="20" alt="" style="display:block;">
                </td>
                <td style="padding-left:10px;">
                  <span style="color:#ffffff;font-size:18px;font-weight:600;">CX Dtec</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="padding:40px 48px 32px;">
            <p style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:600;letter-spacing:-0.02em;">
              ¡Hola, ${nombre}!
            </p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en
              <strong style="color:#0d5c73;">CX Dtec</strong>.
              Si no fuiste tú, puedes ignorar este correo.
            </p>
            <div style="height:1px;background-color:#e5e7eb;margin:0 0 24px;"></div>
            <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">
              Haz clic en el botón para crear una nueva contraseña.
              Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.
            </p>
            <p style="margin:0 0 32px;color:#9ca3af;font-size:12px;">
              Si el enlace expira, solicita uno nuevo desde el login.
            </p>
            <!-- Botón CTA -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#0d5c73;border-radius:10px;">
                      <a href="${urlFront}" target="_blank"
                         style="display:inline-block;padding:14px 36px;font-size:14px;
                                font-weight:600;color:#ffffff;text-decoration:none;
                                letter-spacing:0.02em;border-radius:10px;">
                        Restablecer contraseña &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Enlace de respaldo -->
        <tr>
          <td style="padding:0 48px 32px;">
            <div style="background-color:#f8fafc;border-radius:8px;
                         border:1px solid #e2e8f0;padding:14px 16px;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:11px;
                         text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">
                ¿El botón no funciona?
              </p>
              <p style="margin:0;color:#374151;font-size:12px;line-height:1.6;word-break:break-all;">
                Copia este enlace en tu navegador:<br>
                <span style="color:#0d5c73;">${urlFront}</span>
              </p>
            </div>
          </td>
        </tr>

        <!-- Separador -->
        <tr><td style="padding:0 48px;">
          <div style="height:1px;background-color:#e5e7eb;"></div>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 48px 32px;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;line-height:1.6;">
              Este correo fue enviado automáticamente. Por favor, no respondas.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              &copy; ${year} CX Dtec Inc. Todos los derechos reservados.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });
};