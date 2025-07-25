import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin, requireLeagueAdmin, AuthenticatedRequest } from '../middleware/admin';
import { insertPointAdjustmentSchema } from '@shared/schema';

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

export default router;