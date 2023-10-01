import express from 'express';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const app = express();

const isAdminAuth = app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.get('Authorization')!;
    const JWTToken = bearer.split(' ').at(-1)!;
    const JWT_SECRET = process.env.ADMIN_SECRET_JWT_KEY!;
    try {
      const decodedToken = jwt.verify(JWTToken, JWT_SECRET);
      req.admin = decodedToken;
      next();
    } catch (error) {
      res.status(401).json();
    }
  } catch (error) {
    res.status(500).json();
  }
});

export default isAdminAuth;
