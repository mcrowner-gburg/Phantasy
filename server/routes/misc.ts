import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { insertTourSchema, insertSongPerformanceSchema } from "@shared/schema";
import { sendPasswordResetEmail } from "../services/email";
import { phishApi } from "../services/phish-api";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { z } from "zod";

const router = Router();

// User routes
router.get("/api/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ id: user.id, username: user.username, totalPoints: user.totalPoints });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Tour routes
router.get("/api/tours", async (req, res) => {
  try {
    const tours = await storage.getTours();
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tours" });
  }
});

router.get("/api/tours/active", async (req, res) => {
  try {
    const activeTour = await storage.getActiveTour();
    if (!activeTour) {
      return res.status(404).json({ message: "No active tour found" });
    }
    res.json(activeTour);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active tour" });
  }
});

router.get("/api/tours/:id", async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    const tour = await storage.getTour(tourId);
    
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tour" });
  }
});

router.post("/api/tours", requireAuth, requireAdmin, async (req, res) => {
  try {
    const tourData = insertTourSchema.parse(req.body);
    const tour = await storage.createTour(tourData);
    res.json(tour);
  } catch (error) {
    res.status(400).json({ message: "Invalid tour data" });
  }
});

// Activity routes
router.get("/api/activities", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const leagueId = req.query.leagueId ? parseInt(req.query.leagueId as string) : undefined;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    
    const activities = await storage.getUserActivities(userId, leagueId);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

// Song Performance routes
router.post("/api/performances", requireAuth, requireAdmin, async (req, res) => {
  try {
    const performanceData = insertSongPerformanceSchema.parse(req.body);
    const performance = await storage.createSongPerformance(performanceData);
    
    // Calculate and update points for this performance
    await storage.calculateAndUpdatePoints(performanceData.concertId);
    
    res.json(performance);
  } catch (error) {
    res.status(400).json({ message: "Failed to create song performance" });
  }
});

// Dashboard data endpoint
router.get("/api/dashboard", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get active tour
    const activeTour = await storage.getActiveTour();
    
    // Get user's leagues (assume first one for demo)
    const leagues = await storage.getUserLeagues(userId);
    const currentLeague = leagues[0];

    if (!currentLeague) {
      return res.json({
        user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
        tour: activeTour,
        league: null,
        draftedSongs: [],
        recentActivities: [],
        upcomingConcerts: [],
        leagueStandings: []
      });
    }

    // Get drafted songs
    const draftedSongs = await storage.getDraftedSongs(userId, currentLeague.id);
    
    // Get recent activities
    const recentActivities = await storage.getUserActivities(userId, currentLeague.id);
    
    // Get recent shows (last 3 completed shows) from Phish.net API
    const recentShows = await phishApi.getRecentShows(20);
    const recentConcerts = recentShows.slice(0, 3).map((show: any) => ({
      id: parseInt(show.showid),
      tourId: 1,
      date: show.showdate,
      venue: show.venue,
      city: show.city,
      state: show.state,
      country: show.country,
      setlist: [],
      isCompleted: true,
    }));

    // Get upcoming concerts from Phish.net API
    const upcomingShows = await phishApi.getUpcomingShows();
    const upcomingConcerts = upcomingShows
      .map((show: any) => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: show.showdate,
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: false,
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
    
    // Get league standings
    const leagueStandings = await storage.getLeagueStandings(currentLeague.id);

    // Always include the requesting user's standings entry even if outside top 10
    const top10 = leagueStandings.slice(0, 10);
    const userInTop10 = top10.some((s: any) => s.id === userId);
    const standingsForDashboard = userInTop10
      ? top10
      : [...top10, leagueStandings.find((s: any) => s.id === userId)].filter(Boolean);

    res.json({
      user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
      tour: activeTour,
      league: currentLeague,
      draftedSongs: draftedSongs.slice(0, 10),
      recentActivities: recentActivities.slice(0, 5),
      recentConcerts: recentConcerts,
      upcomingConcerts: upcomingConcerts,
      leagueStandings: standingsForDashboard
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// Password Recovery Routes
router.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    console.log(`forgot-password: user lookup for ${email}: ${user ? `found id=${user.id}` : 'not found'}`);
    if (!user) {
      return res.json({ message: "If this email is registered, you will receive a password reset link." });
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    console.log(`forgot-password: saving reset token for user ${user.id}`);
    await storage.createPasswordResetToken({ userId: user.id, token: resetToken, expiresAt });
    console.log(`forgot-password: token saved, calling sendPasswordResetEmail`);

    const baseUrl = "https://phishphantasy.live";
    const sent = await sendPasswordResetEmail(email, resetToken, baseUrl);
    console.log(`forgot-password: sendPasswordResetEmail returned ${sent}`);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send reset email — please contact support" });
    }

    res.json({ message: "If this email is registered, you will receive a password reset link." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
});

router.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    
    // Find and validate token
    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(resetToken.userId, hashedPassword);
    
    // Mark token as used
    await storage.markTokenAsUsed(resetToken.id);
    
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;
