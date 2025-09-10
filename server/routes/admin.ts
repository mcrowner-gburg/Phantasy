import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin, requireLeagueAdmin, AuthenticatedRequest } from '../middleware/admin';
import { insertPointAdjustmentSchema, insertLeagueInviteSchema, insertUserSchema } from '@shared/schema';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const router = Router();

// Note: Each route now has specific middleware requirements

// Get show data for admin point adjustment (requires league admin or global admin)
router.get('/shows/:concertId/league/:leagueId', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const concertId = parseInt(req.params.concertId);
    const leagueId = parseInt(req.params.leagueId);

    if (isNaN(concertId) || isNaN(leagueId)) {
      return res.status(400).json({ message: 'Invalid concert or league ID' });
    }

    const showData = await storage.getShowPointsForAdmin(leagueId, concertId);
    if (!showData) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(showData);
  } catch (error) {
    console.error('Error fetching show data for admin:', error);
    res.status(500).json({ message: 'Failed to fetch show data' });
  }
});

// Create point adjustment (requires league admin or global admin)
router.post('/adjustments', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = insertPointAdjustmentSchema.parse({
      ...req.body,
      adjustedBy: req.user!.id
    });

    // Check if user has a song drafted in this league
    if (validatedData.userId) {
      const draftedSongs = await storage.getDraftedSongs(validatedData.userId, validatedData.leagueId);
      const hasSong = draftedSongs.some(draft => draft.songId === validatedData.songId);
      
      if (!hasSong) {
        return res.status(400).json({ message: 'User does not have this song drafted in this league' });
      }
    }

    const adjustment = await storage.createPointAdjustment(validatedData);

    // Update user points if there's a difference
    if (validatedData.userId && validatedData.adjustedPoints !== validatedData.originalPoints) {
      const pointsDifference = validatedData.adjustedPoints - validatedData.originalPoints;
      await storage.updateUserPointsAfterAdjustment(validatedData.userId, pointsDifference);
    }

    res.json({ adjustment, message: 'Point adjustment created successfully' });
  } catch (error) {
    console.error('Error creating point adjustment:', error);
    res.status(500).json({ message: 'Failed to create point adjustment' });
  }
});

// Get point adjustments for a league/show (requires league admin or global admin)
router.get('/adjustments/league/:leagueId', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const concertId = req.query.concertId ? parseInt(req.query.concertId as string) : undefined;

    if (isNaN(leagueId)) {
      return res.status(400).json({ message: 'Invalid league ID' });
    }

    const adjustments = await storage.getPointAdjustments(leagueId, concertId);
    res.json(adjustments);
  } catch (error) {
    console.error('Error fetching point adjustments:', error);
    res.status(500).json({ message: 'Failed to fetch point adjustments' });
  }
});

// Get all concerts for admin management
router.get('/concerts', async (req: AuthenticatedRequest, res) => {
  try {
    const concerts = await storage.getConcerts();
    res.json(concerts);
  } catch (error) {
    console.error('Error fetching concerts for admin:', error);
    res.status(500).json({ message: 'Failed to fetch concerts' });
  }
});

// Get all leagues for admin management
router.get('/leagues', async (req: AuthenticatedRequest, res) => {
  try {
    const leagues = await storage.getAllLeagues();
    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues for admin:', error);
    res.status(500).json({ message: 'Failed to fetch leagues' });
  }
});

// Promote user to league admin (only global admins or league owners)
router.post('/leagues/:leagueId/promote/:userId', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const leagueId = parseInt(req.params.leagueId);
    const userIdToPromote = parseInt(req.params.userId);

    if (isNaN(leagueId) || isNaN(userIdToPromote)) {
      return res.status(400).json({ message: 'Invalid league or user ID' });
    }

    // Check if current user is global admin or league owner
    const isGlobalAdmin = await storage.isUserAdmin(req.session.user.id);
    const league = await storage.getLeague(leagueId);
    
    if (!isGlobalAdmin && league?.ownerId !== req.session.user.id) {
      return res.status(403).json({ message: 'Only global admins or league owners can promote members' });
    }

    await storage.promoteToLeagueAdmin(userIdToPromote, leagueId);
    res.json({ message: 'User promoted to league admin successfully' });
  } catch (error) {
    console.error('Error promoting user to league admin:', error);
    res.status(500).json({ message: 'Failed to promote user' });
  }
});

// Get league members (requires league admin or global admin)
router.get('/leagues/:leagueId/members', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    
    if (isNaN(leagueId)) {
      return res.status(400).json({ message: 'Invalid league ID' });
    }

    const members = await storage.getLeagueMembers(leagueId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching league members:', error);
    res.status(500).json({ message: 'Failed to fetch league members' });
  }
});

// Get leagues user can admin (for league admin interface)
router.get('/user-admin-leagues', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.session.user.id;
    
    // Global admins can see all leagues
    const isGlobalAdmin = await storage.isUserAdmin(userId);
    if (isGlobalAdmin) {
      const allLeagues = await storage.getAllLeagues();
      return res.json(allLeagues);
    }

    // Otherwise, get leagues where user is admin or owner
    const userLeagues = await storage.getUserLeagues(userId);
    const adminLeagues = [];
    
    for (const league of userLeagues) {
      const isLeagueAdmin = await storage.isUserLeagueAdmin(userId, league.id);
      if (isLeagueAdmin) {
        adminLeagues.push(league);
      }
    }

    res.json(adminLeagues);
  } catch (error) {
    console.error('Error fetching user admin leagues:', error);
    res.status(500).json({ message: 'Failed to fetch admin leagues' });
  }
});

// Create league invite (requires league admin or global admin)
router.post('/leagues/:leagueId/invites', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const leagueId = parseInt(req.params.leagueId);
    if (isNaN(leagueId)) {
      return res.status(400).json({ message: 'Invalid league ID' });
    }

    const { maxUses, expiresAt } = req.body;
    
    // Generate unique invite code
    const inviteCode = nanoid(10);

    const inviteData = {
      leagueId,
      inviteCode,
      createdBy: req.session.user.id,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    const invite = await storage.createLeagueInvite(inviteData);
    res.json(invite);
  } catch (error) {
    console.error('Error creating league invite:', error);
    res.status(500).json({ message: 'Failed to create league invite' });
  }
});

// Get league invites (requires league admin or global admin)
router.get('/leagues/:leagueId/invites', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    if (isNaN(leagueId)) {
      return res.status(400).json({ message: 'Invalid league ID' });
    }

    const invites = await storage.getLeagueInvites(leagueId);
    res.json(invites);
  } catch (error) {
    console.error('Error fetching league invites:', error);
    res.status(500).json({ message: 'Failed to fetch league invites' });
  }
});

// Deactivate league invite (requires league admin or global admin)
router.delete('/leagues/:leagueId/invites/:inviteId', requireLeagueAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const inviteId = parseInt(req.params.inviteId);
    if (isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID' });
    }

    await storage.deactivateInvite(inviteId);
    res.json({ message: 'Invite deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating invite:', error);
    res.status(500).json({ message: 'Failed to deactivate invite' });
  }
});

// User Management Routes (requires global admin)

// Get all users with optional search
router.get('/users', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const search = req.query.search as string;
    
    let users;
    if (search) {
      users = await storage.searchUsers(search);
    } else {
      users = await storage.getAllUsers();
    }
    
    // Remove sensitive data like password hashes
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role || 'user',
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      isPhoneVerified: user.isPhoneVerified
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/users', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    if (userData.email) {
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user'
    });
    
    // Return safe user data
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      isPhoneVerified: user.isPhoneVerified
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const updateSchema = z.object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      role: z.enum(['user', 'admin']).optional(),
      password: z.string().min(6).optional()
    });
    
    const updates = updateSchema.parse(req.body);
    
    // Hash password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const user = await storage.updateUser(userId, updates);
    
    // Return safe user data
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      isPhoneVerified: user.isPhoneVerified
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Prevent self-deletion
    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await storage.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Update user role
router.put('/users/:id/role', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const roleSchema = z.object({
      role: z.enum(['user', 'admin'])
    });
    
    const { role } = roleSchema.parse(req.body);
    
    // Prevent self-demotion
    if (userId === req.user!.id && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot demote your own account' });
    }
    
    await storage.updateUserRole(userId, role);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

export default router;