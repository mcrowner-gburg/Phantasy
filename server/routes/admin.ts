import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/adminController";
import { storage } from "../storage-db";

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

export default router;
