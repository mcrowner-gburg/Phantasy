import { db } from "./db";
import { leagues } from "../shared/schema";
import { and, eq, isNotNull, lte, or } from "drizzle-orm";

let draftLoop: NodeJS.Timeout | null = null;

// Returns true if any league needs the automation loop running:
// - "active" drafts need auto-pick enforcement
// - "scheduled" drafts with a draftDate need to be watched for auto-start
async function anyDraftsPending(): Promise<boolean> {
  const rows = await db
    .select({ id: leagues.id })
    .from(leagues)
    .where(
      or(
        eq(leagues.draftStatus, "active"),
        and(eq(leagues.draftStatus, "scheduled"), isNotNull(leagues.draftDate))
      )
    )
    .limit(1);
  return rows.length > 0;
}

async function runDraftAutomation() {
  try {
    const { storage } = await import("./storage-db");
    const now = new Date();

    const toStart = await db
      .select()
      .from(leagues)
      .where(
        and(
          eq(leagues.draftStatus, "scheduled"),
          isNotNull(leagues.draftDate),
          lte(leagues.draftDate, now)
        )
      );
    for (const league of toStart) {
      try {
        await storage.startDraft(league.id);
        console.log(`[DraftAuto] Auto-started draft for league ${league.id}`);
      } catch (e) {
        console.error(`[DraftAuto] Failed to start league ${league.id}:`, e);
      }
    }

    const timedOut = await db
      .select()
      .from(leagues)
      .where(
        and(
          eq(leagues.draftStatus, "active"),
          isNotNull(leagues.pickDeadline),
          lte(leagues.pickDeadline, now)
        )
      );
    for (const league of timedOut) {
      if (!league.currentPlayer) continue;
      try {
        const songs = await storage.getAvailableSongsPlayedLastYear(league.id);
        if (songs.length > 0) {
          await storage.makeDraftPick(
            league.id,
            league.currentPlayer,
            songs[0].id,
            league.pickTimeLimit ?? 90
          );
          console.log(
            `[DraftAuto] Auto-picked for player ${league.currentPlayer} in league ${league.id}`
          );
        }
      } catch (e) {
        console.error(`[DraftAuto] Failed auto-pick for league ${league.id}:`, e);
      }
    }
  } catch (e) {
    console.error("[DraftAuto] Loop error:", e);
  }
}

async function tick() {
  await runDraftAutomation();
  if (!(await anyDraftsPending())) stopDraftAutomation();
}

export function startDraftAutomation() {
  if (draftLoop) return;
  console.log("[draft] automation started");
  draftLoop = setInterval(tick, 30_000);
}

export function stopDraftAutomation() {
  if (!draftLoop) return;
  clearInterval(draftLoop);
  draftLoop = null;
  console.log("[draft] automation stopped — no active drafts");
}

export async function ensureDraftAutomation() {
  if (!draftLoop && (await anyDraftsPending())) startDraftAutomation();
}
