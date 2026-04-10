import { Request, Response } from "express";
import { storage } from "../storage-db";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({ username, email, password: hashedPassword, role: role || "user" });
    res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error("Admin createUser error:", error);
    res.status(500).json({ message: error.message || "Failed to create user" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, totalPoints: u.totalPoints, createdAt: u.createdAt })));
  } catch (error: any) {
    console.error("Admin getUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    const user = await storage.updateUserRole(userId, role);
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error: any) {
    console.error("Admin updateUser error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    await storage.deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};