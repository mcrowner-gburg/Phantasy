import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// --- CREATE USER ---
export const createUser = async (req: Request, res: Response) => {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  try {
    const data = userSchema.parse(req.body);
    const user = await storage.createUser(data); // your storage logic
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// --- READ ALL USERS ---
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// --- UPDATE USER ---
export const updateUser = async (req: Request, res: Response) => {
  const updateSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  });

  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const user = await storage.updateUser(parseInt(id), data);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// --- DELETE USER ---
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteUser(parseInt(id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
