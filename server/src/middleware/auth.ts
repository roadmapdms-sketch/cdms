import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  role?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: { message: 'Access denied. No token provided.' } 
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.userId = decoded.userId;
    req.email = decoded.email;
    req.role = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ 
      error: { message: 'Invalid token.' } 
    });
  }
};

export const requireRole = (roles: readonly string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const r = req as AuthRequest;
    if (!r.role || !roles.includes(r.role)) {
      return res.status(403).json({
        error: { message: 'Access denied. Insufficient permissions.' },
      });
    }
    next();
  };
};
