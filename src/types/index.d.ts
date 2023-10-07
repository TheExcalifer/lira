import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      admin: any;
      user: any;
    }
  }
}
