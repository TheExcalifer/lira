import express from 'express';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
const app = express();

const isUserAuth: RequestHandler = app.use((req, res, next) => {
  try {
    const bearer = req.get('Authorization');
    if (!bearer) return res.status(400).json({ error: 'Provide JWT token' });

    const JWTToken = bearer.split(' ').at(-1)!;
    const JWT_SECRET = process.env.SECRET_JWT_KEY!;
    try {
      const decodedToken = jwt.verify(JWTToken, JWT_SECRET);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).json();
    }
  } catch (error) {
    res.status(500).json();
  }
});

export default isUserAuth;
