import * as jwt from "jsonwebtoken";
import config from "../config";

export const generarJWT = (
  uid: string,
  name: string,
  accessType: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name, accessType };
    const seed = process.env.SECRET_JWT_SEED || config.jwtSecret;

    jwt.sign(
      payload,
      seed,
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