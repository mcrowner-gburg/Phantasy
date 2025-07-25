import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { smsService } from "./services/sms";
import { nanoid } from "nanoid";

export function setupAuth(app: express.Application) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
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

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Phone number validation (if provided)
      if (phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({ message: 'Invalid phone number format' });
        }
      }

      // Check if user already exists (by username, email, or phone)
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

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        phoneNumber: phoneNumber || undefined,
        password: hashedPassword,
        totalPoints: 0,
      });

      // Set session
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

      // Find user by username or email
      let user = await storage.getUserByUsername(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByEmail(usernameOrEmail);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session with both userId and user object for compatibility
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

  // Phone-based authentication endpoints
  app.post('/api/auth/request-phone-code', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      // Check if phone number exists in system
      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: 'Phone number not registered' });
      }

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save verification code to database
      await storage.createPhoneVerificationCode({
        phoneNumber,
        code,
        expiresAt,
      });

      // Send SMS if service is available
      if (smsService.isAvailable()) {
        const sent = await smsService.sendAuthCode(phoneNumber, code);
        if (sent) {
          res.json({ message: 'Verification code sent to your phone' });
        } else {
          res.json({ message: 'Code generated but SMS failed. Check console for code.', code }); // For development
        }
      } else {
        // For development - return code in response
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

      // Verify the code
      const verificationCode = await storage.getValidPhoneVerificationCode(phoneNumber, code);
      if (!verificationCode) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Mark code as used
      await storage.markPhoneVerificationCodeUsed(verificationCode.id);

      // Get user and set session
      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Set session
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

  // SMS League Invite endpoint
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

// Middleware to check authentication
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  (req as any).userId = userId;
  next();
}