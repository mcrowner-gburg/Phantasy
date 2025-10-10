import { storage } from "../storage";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import {
  InsertUserInput,
  InsertLeagueInviteInput,
  InsertPointAdjustmentInput,
} from "@shared/schema";

// --- USERS ---
export const createUserService = async (data: InsertUserInput) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return storage.user.create({ ...data, password: hashedPassword });
};

export const getUsersService = () => storage.user.findMany();

export const updateUserService = async (
  id: string,
  data: Partial<InsertUserInput>,
) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return storage.user.update({ where: { id }, data });
};

export const deleteUserService = (id: string) =>
  storage.user.delete({ where: { id } });

// --- LEAGUE INVITES ---
export const createLeagueInviteService = (data: InsertLeagueInviteInput) => {
  return storage.leagueInvite.create({ ...data, code: nanoid() });
};

export const getLeagueInvitesService = () => storage.leagueInvite.findMany();

// --- POINT ADJUSTMENTS ---
export const createPointAdjustmentService = (
  data: InsertPointAdjustmentInput,
) => {
  return storage.pointAdjustment.create({ data });
};

export const getPointAdjustmentsService = () =>
  storage.pointAdjustment.findMany();
