import { Router } from "express";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { Pool } from "@neondatabase/serverless";
import Twilio from "twilio";
import ws from "ws";

const pool = new Pool(); // Make sure DATABASE_URL is set in Render
const router = Router();

// --- Example Zod schema ---
const insertUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

// --- POST /api/admin/users ---
router.post("/users", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Example: insert into DB (replace with your Drizzle logic)
    await pool.query(
      "INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4)",
      [nanoid(), userData.username, userData.email, hashedPassword]
    );

    res.status(201).json({ message: "User created" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Example Twilio SMS route ---
router.post("/sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    const client = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export { router };
