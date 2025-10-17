// controllers/adminController.ts
import { z } from "zod";               // external
import { Pool } from "@neondatabase/serverless"; // external
import Twilio from "twilio";           // external

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Example: create a new user
export const createUser = async (userData: any) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.parse(userData);

  // Twilio example (sending SMS)
  const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  await client.messages.create({
    to: "+1234567890",
    from: process.env.TWILIO_FROM,
    body: `User ${parsed.email} created!`,
  });

  // DB insert example
  await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
    parsed.email,
    parsed.password,
  ]);

  return { success: true };
};
