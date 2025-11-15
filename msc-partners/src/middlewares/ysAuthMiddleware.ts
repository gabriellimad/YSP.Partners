import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { unauthorized, invalidToken } from '../status/status';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

function authenticateToken(req: CustomRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(unauthorized).json({ error: 'Token não fornecido' });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.status(invalidToken).json({ error: 'Token inválido' });
      return;
    }

    req.user = user;
    next();
  });
}

export default authenticateToken;
