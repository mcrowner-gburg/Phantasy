import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  }
}

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

export const requireLeagueAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Global admins can manage any league
    const isGlobalAdmin = await storage.isUserAdmin(req.session.user.id);
    if (isGlobalAdmin) {
      req.user = req.session.user;
      return next();
    }

    // Extract league ID from params or body
    const leagueId = req.params.leagueId || req.body.leagueId;
    if (!leagueId) {
      return res.status(400).json({ message: 'League ID required' });
    }

    // Check if user is league admin or league owner
    const isLeagueAdmin = await storage.isUserLeagueAdmin(req.session.user.id, parseInt(leagueId));
    
    if (!isLeagueAdmin) {
      return res.status(403).json({ message: 'League admin access required' });
    }

    req.user = req.session.user;
    next();
  } catch (error) {
    console.error('League admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};