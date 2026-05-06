import * as jwt from "jsonwebtoken";

export const generarJWT = (
  uid: string,
  name: string,
  accessType: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name, accessType };

    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED || "default-secret-key",
      { expiresIn: "2h" },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token as string);
        }
      },
    );
  });
};
