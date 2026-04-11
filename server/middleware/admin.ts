import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage-db';

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

const getSessionUserId = (req: AuthenticatedRequest): number | null => {
  return (req.session as any)?.user?.id || (req.session as any)?.userId || null;
};

// Superadmin only - can manage all users and assign admins
export const requireSuperAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const isSuperAdmin = await storage.isUserSuperAdmin(userId);
    if (!isSuperAdmin) return res.status(403).json({ message: 'Super admin access required' });

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin or Superadmin
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const isAdmin = await storage.isUserAdmin(userId);
    if (!isAdmin) return res.status(403).json({ message: 'Admin access required' });

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Superadmin, global admin, or owner/admin of the specific league
export const requireLeagueAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    if (await storage.isUserAdmin(userId)) return next();

    const leagueId = req.params.leagueId || req.body.leagueId;
    if (!leagueId) return res.status(400).json({ message: 'League ID required' });

    const isLeagueAdmin = await storage.isUserLeagueAdmin(userId, parseInt(leagueId));
    if (!isLeagueAdmin) return res.status(403).json({ message: 'League admin access required' });

    next();
  } catch (error) {
    console.error('League admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};