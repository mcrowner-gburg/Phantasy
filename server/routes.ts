import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTourSchema, insertLeagueSchema, insertDraftedSongSchema, insertSongPerformanceSchema } from "@shared/schema";
import { z } from "zod";
import { phishApi } from "./services/phish-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, totalPoints: user.totalPoints } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, totalPoints: user.totalPoints } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
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
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/active", async (req, res) => {
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

  app.get("/api/tours/:id", async (req, res) => {
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

  app.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  // League routes
  app.get("/api/leagues", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const leagues = await storage.getUserLeagues(userId);
      res.json(leagues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leagues" });
    }
  });

  app.post("/api/leagues", async (req, res) => {
    try {
      const leagueData = insertLeagueSchema.parse(req.body);
      const { ownerId } = req.body;
      
      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID required" });
      }
      
      const league = await storage.createLeague({ ...leagueData, ownerId });
      res.json(league);
    } catch (error) {
      res.status(400).json({ message: "Invalid league data" });
    }
  });

  app.post("/api/leagues/:id/join", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      await storage.joinLeague(userId, leagueId);
      res.json({ message: "Successfully joined league" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join league" });
    }
  });

  app.get("/api/leagues/:id/standings", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const standings = await storage.getLeagueStandings(leagueId);
      res.json(standings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });

  // Song routes
  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getAllSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const songs = await storage.getAllSongs();
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes((q as string).toLowerCase())
      );
      
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Failed to search songs" });
    }
  });

  // Draft routes
  app.get("/api/drafted-songs", async (req, res) => {
    try {
      const userIdStr = req.query.userId as string;
      const leagueIdStr = req.query.leagueId as string;
      
      if (!userIdStr || !leagueIdStr) {
        return res.status(400).json({ message: "User ID and League ID required" });
      }
      
      const userId = parseInt(userIdStr);
      const leagueId = parseInt(leagueIdStr);
      
      if (isNaN(userId) || isNaN(leagueId)) {
        return res.status(400).json({ message: "Invalid User ID or League ID" });
      }
      
      const draftedSongs = await storage.getDraftedSongs(userId, leagueId);
      res.json(draftedSongs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drafted songs" });
    }
  });

  app.post("/api/draft", async (req, res) => {
    try {
      const draftData = insertDraftedSongSchema.parse(req.body);
      
      // Check if song is already drafted by this user in this league
      const existingDrafts = await storage.getDraftedSongs(draftData.userId, draftData.leagueId);
      const alreadyDrafted = existingDrafts.some(draft => draft.songId === draftData.songId);
      
      if (alreadyDrafted) {
        return res.status(400).json({ message: "Song already drafted" });
      }
      
      const draftedSong = await storage.draftSong(draftData);
      
      // Create activity
      const song = await storage.getSong(draftData.songId);
      if (song) {
        await storage.createActivity(
          draftData.userId,
          draftData.leagueId,
          "draft",
          `You drafted "${song.title}"`
        );
      }
      
      res.json(draftedSong);
    } catch (error) {
      res.status(400).json({ message: "Failed to draft song" });
    }
  });

  // Concert routes
  app.get("/api/concerts", async (req, res) => {
    try {
      // Get recent shows from Phish.net API
      const recentShows = await phishApi.getRecentShows(20);
      
      // Transform Phish.net data to our format
      const concerts = recentShows.map(show => ({
        id: parseInt(show.showid),
        tourId: 1, // Associate with current tour
        date: new Date(show.showdate),
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [], // Will be populated when setlist is fetched
        isCompleted: true, // Recent shows are completed
      }));
      
      res.json(concerts);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      res.status(500).json({ message: "Failed to fetch concerts" });
    }
  });

  app.get("/api/concerts/upcoming", async (req, res) => {
    try {
      // Get upcoming shows from Phish.net API
      const upcomingShows = await phishApi.getUpcomingShows();
      
      // Transform Phish.net data to our format
      const concerts = upcomingShows.map(show => ({
        id: parseInt(show.showid),
        tourId: 1, // Associate with current tour
        date: new Date(show.showdate),
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: false,
      }));
      
      res.json(concerts);
    } catch (error) {
      console.error("Error fetching upcoming concerts:", error);
      res.status(500).json({ message: "Failed to fetch upcoming concerts" });
    }
  });

  app.get("/api/concerts/:id/setlist", async (req, res) => {
    try {
      const showId = req.params.id;
      const setlistData = await phishApi.getSetlist(showId);
      
      if (!setlistData) {
        return res.status(404).json({ message: "Setlist not found" });
      }
      
      res.json(setlistData);
    } catch (error) {
      console.error("Error fetching setlist:", error);
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
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
  app.post("/api/performances", async (req, res) => {
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

  app.get("/api/concerts/:id/performances", async (req, res) => {
    try {
      const concertIdStr = req.params.id;
      const concertId = parseInt(concertIdStr);
      
      if (isNaN(concertId)) {
        return res.status(400).json({ message: "Invalid concert ID" });
      }
      
      const performances = await storage.getConcertPerformances(concertId);
      res.json(performances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch concert performances" });
    }
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
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
      
      // Get upcoming concerts from Phish.net API
      const upcomingShows = await phishApi.getUpcomingShows();
      const upcomingConcerts = upcomingShows.map(show => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: new Date(show.showdate),
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: false,
      }));
      
      // Get league standings
      const leagueStandings = await storage.getLeagueStandings(currentLeague.id);

      res.json({
        user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
        tour: activeTour,
        league: currentLeague,
        draftedSongs: draftedSongs.slice(0, 10), // Limit for display
        recentActivities: recentActivities.slice(0, 5),
        upcomingConcerts: upcomingConcerts.slice(0, 3),
        leagueStandings: leagueStandings.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
