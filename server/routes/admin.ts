import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/adminController";
import { storage } from "../storage-db";
import { phishApi } from "../services/phish-api";
import { db } from "../db";
import { draftedSongs, songs } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/users", createUser);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/concerts", async (_req, res) => {
  try {
    const shows = await storage.getCachedShows();
    const completed = shows
      .filter((s: any) => new Date(s.showDate) < new Date())
      .sort((a: any, b: any) => new Date(b.showDate).getTime() - new Date(a.showDate).getTime())
      .map((s: any) => ({
        id: s.id,
        date: s.showDate,
        venue: s.venue,
        city: s.city,
        state: s.state,
      }));
    res.json(completed);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch concerts" });
  }
});

router.get("/leagues", async (_req, res) => {
  try {
    const leagues = await storage.getAllLeagues();
    res.json(leagues);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch leagues" });
  }
});

// GET /api/admin/shows/:concertId/league/:leagueId
// Returns the phish.in setlist for a show + which league members drafted each song
router.get("/shows/:concertId/league/:leagueId", async (req, res) => {
  try {
    const concertId = parseInt(req.params.concertId);
    const leagueId = parseInt(req.params.leagueId);

    // Look up the cached show to get its date
    const shows = await storage.getCachedShows();
    const show = shows.find((s: any) => s.id === concertId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const showDate = new Date(show.showDate).toISOString().split("T")[0];

    // Fetch setlist from phish.in
    const tracks = await phishApi.getSetlist(showDate);
    if (!tracks || tracks.length === 0) {
      return res.json({ concert: { venue: show.venue, city: show.city, date: show.showDate }, songPerformances: [] });
    }

    // Get all drafted songs for this league
    const drafted = await db
      .select({ songId: draftedSongs.songId, userId: draftedSongs.userId })
      .from(draftedSongs)
      .where(eq(draftedSongs.leagueId, leagueId));

    // Build a map of song title -> drafters
    // First, resolve drafted song titles
    const draftersByTitle: Record<string, { userId: number; username: string }[]> = {};
    for (const d of drafted) {
      if (!d.songId) continue;
      const [song] = await db.select().from(songs).where(eq(songs.id, d.songId)).limit(1);
      if (!song) continue;
      const user = await storage.getUser(d.userId!);
      if (!user) continue;
      const title = song.title.toLowerCase();
      if (!draftersByTitle[title]) draftersByTitle[title] = [];
      draftersByTitle[title].push({ userId: user.id, username: user.username });
    }

    // Determine the first position in each set so we can flag set openers
    const firstPositionBySet: Record<string, number> = {};
    for (const track of tracks) {
      const setKey = track.set || "Set 1";
      const pos = track.position || 0;
      if (!(setKey in firstPositionBySet) || pos < firstPositionBySet[setKey]) {
        firstPositionBySet[setKey] = pos;
      }
    }

    // Build song performances from tracks
    const songPerformances = tracks.map((track: any, idx: number) => {
      const title = track.song || track.title || "";
      const draftedBy = draftersByTitle[title.toLowerCase()] || [];
      const setKey = track.set || "Set 1";
      const isEncore = track.isEncore || setKey.toLowerCase().includes("encore");
      const isSetOpener = !isEncore && track.position === firstPositionBySet[setKey];
      // duration from phish.in is in milliseconds
      const durationSeconds = track.duration ? Math.round(track.duration / 1000) : 0;
      return {
        id: idx,
        song: { title },
        setNumber: setKey,
        position: track.position || idx + 1,
        isSetOpener,
        isEncore,
        durationSeconds,
        draftedBy,
      };
    });

    res.json({
      concert: { venue: show.venue, city: show.city, state: show.state, date: show.showDate },
      songPerformances,
    });
  } catch (e: any) {
    console.error("Error fetching admin show data:", e);
    res.status(500).json({ message: e.message || "Failed to fetch show data" });
  }
});

export default router;
