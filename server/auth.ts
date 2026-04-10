import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage-db";
import { smsService } from "./services/sms";
import { nanoid } from "nanoid";
import { pool } from "./db";

export function setupAuth(app: express.Application) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET not set");
  }

  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
  pool,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

  app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  }));

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, phoneNumber, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({ message: 'Invalid phone number format' });
        }
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      if (phoneNumber) {
        const existingPhone = await storage.getUserByPhone(phoneNumber);
        if (existingPhone) {
          return res.status(409).json({ message: 'Phone number already exists' });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        email,
        phoneNumber: phoneNumber || undefined,
        password: hashedPassword,
        totalPoints: 0,
      });

      (req.session as any).userId = user.id;

      res.json({ user: { id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, totalPoints: user.totalPoints } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username/email and password are required' });
      }

      let user = await storage.getUserByUsername(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByEmail(usernameOrEmail);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      (req.session as any).userId = user.id;
      (req.session as any).user = { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role || 'user' 
      };

      res.json({ user: { id: user.id, username: user.username, email: user.email, totalPoints: user.totalPoints, role: user.role || 'user' } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.patch('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { email, phoneNumber } = req.body;

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      if (phoneNumber && phoneNumber.trim() !== '' && !/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Please enter a valid phone number' });
      }

      const updatedUser = await storage.updateUserProfile(userId, {
        email: email || undefined,
        phoneNumber: phoneNumber && phoneNumber.trim() !== '' ? phoneNumber : null
      });

      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          totalPoints: updatedUser.totalPoints,
          role: updatedUser.role || 'user'
        }
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      res.status(400).json({ message: error.message || 'Failed to update profile' });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email, totalPoints: user.totalPoints, role: user.role || 'user' } });
    } catch (error) {
      console.error('User fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/request-phone-code', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: 'Phone number not registered' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createPhoneVerificationCode({
        phoneNumber,
        code,
        expiresAt,
      });

      if (smsService.isAvailable()) {
        const sent = await smsService.sendAuthCode(phoneNumber, code);
        if (sent) {
          res.json({ message: 'Verification code sent to your phone' });
        } else {
          res.json({ message: 'Code generated but SMS failed. Check console for code.', code });
        }
      } else {
        res.json({ message: 'SMS service unavailable. Your code is:', code });
      }
    } catch (error) {
      console.error('Phone code request error:', error);
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  });

  app.post('/api/auth/verify-phone-code', async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      
      if (!phoneNumber || !code) {
        return res.status(400).json({ message: 'Phone number and code are required' });
      }

      const verificationCode = await storage.getValidPhoneVerificationCode(phoneNumber, code);
      if (!verificationCode) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      await storage.markPhoneVerificationCodeUsed(verificationCode.id);

      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      (req.session as any).userId = user.id;

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          phoneNumber: user.phoneNumber,
          totalPoints: user.totalPoints 
        } 
      });
    } catch (error) {
      console.error('Phone verification error:', error);
      res.status(500).json({ message: 'Verification failed' });
    }
  });

  app.post('/api/auth/send-sms-invite', async (req, res) => {
    try {
      const { phoneNumber, leagueName, inviteCode } = req.body;
      
      if (!phoneNumber || !leagueName || !inviteCode) {
        return res.status(400).json({ message: 'Phone number, league name, and invite code are required' });
      }

      if (smsService.isAvailable()) {
        const sent = await smsService.sendLeagueInvite(phoneNumber, leagueName, inviteCode);
        if (sent) {
          res.json({ message: 'Invite sent successfully' });
        } else {
          res.status(500).json({ message: 'Failed to send SMS invite' });
        }
      } else {
        res.status(503).json({ message: 'SMS service unavailable' });
      }
    } catch (error) {
      console.error('SMS invite error:', error);
      res.status(500).json({ message: 'Failed to send SMS invite' });
    }
  });
}

export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  (req as any).userId = userId;
  next();
}