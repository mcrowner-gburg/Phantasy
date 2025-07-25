import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const isAdmin = await storage.isUserAdmin(req.session.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = req.session.user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};