import jwt from 'jsonwebtoken';

export const generarJWT = (uid: string, name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name };
    
    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED || 'Palabra-Secreta-De-Respaldo',
      {
        expiresIn: '24h',
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject('No se pudo generar el token');
        } else {
          resolve(token as string);
        }
      }
    );
  });
};