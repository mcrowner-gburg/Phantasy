import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin, AuthenticatedRequest } from '../middleware/admin';
import { insertPointAdjustmentSchema } from '@shared/schema';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get show data for admin point adjustment
router.get('/shows/:concertId/league/:leagueId', async (req: AuthenticatedRequest, res) => {
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

// Create point adjustment
router.post('/adjustments', async (req: AuthenticatedRequest, res) => {
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

// Get point adjustments for a league/show
router.get('/adjustments/league/:leagueId', async (req: AuthenticatedRequest, res) => {
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

export default router;