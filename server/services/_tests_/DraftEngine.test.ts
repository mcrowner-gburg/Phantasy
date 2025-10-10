// packages/domain/draft/__tests__/DraftEngine.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DraftEngine, DraftPick } from "../DraftEngine";

function makeMockStorage() {
  // simple in-memory "DB"
  const leagues: Record<number, any> = {
    1: {
      id: 1,
      draft_started: true,
      draft_order: [10, 20, 30],
      current_pick_index: 0,
      current_round: 1,
      picks_per_round: 3,
    },
  };
  const drafted: any[] = [];

  return {
    async getLeague(leagueId: number) {
      return leagues[leagueId];
    },
    async isSongDraftedInLeague(songId: number, leagueId: number) {
      return drafted.some(
        (d) => d.song_id === songId && d.league_id === leagueId,
      );
    },
    async draftSong(d) {
      const id = drafted.length + 1;
      const record = { id, ...d };
      drafted.push(record);
      return record;
    },
    async getDraftedSongsForLeague(leagueId: number) {
      return drafted.filter((d) => d.league_id === leagueId);
    },
    async getLeagueMembers(leagueId: number) {
      return leagues[leagueId].draft_order.map((u: number) => ({ userId: u }));
    },
    async updateLeagueState(leagueId: number, patch: any) {
      Object.assign(leagues[leagueId], patch);
    },
    // optional transaction wrapper
    async transaction(fn: any) {
      return fn(this);
    },
  };
}

describe("DraftEngine", () => {
  let storage: any;
  let emitted: any[] = [];
  const emitter = {
    to(room: string) {
      return {
        emit: (event: string, payload?: any) =>
          emitted.push({ room, event, payload }),
      };
    },
  };

  beforeEach(() => {
    storage = makeMockStorage();
    emitted = [];
  });

  it("allows the right user to pick and advances turn", async () => {
    const eng = new DraftEngine(storage, emitter);
    // first pick: user 10
    const pick: DraftPick = { leagueId: 1, userId: 10, songId: 100 };
    const res = await eng.makePick(pick);
    expect(res.song_id).toBe(100);

    // league current_pick_index advanced to 1 (next user 20)
    const league = await storage.getLeague(1);
    expect(league.current_pick_index).toBe(1);

    // event emitted
    expect(emitted.length).toBe(1);
    expect(emitted[0].event).toBe("draft:pick");
  });

  it("rejects picks out of turn", async () => {
    const eng = new DraftEngine(storage, emitter);
    // it's user 10's turn; user 20 tries to pick
    await expect(
      eng.makePick({ leagueId: 1, userId: 20, songId: 101 }),
    ).rejects.toThrow();
  });

  it("rejects double-picks", async () => {
    const eng = new DraftEngine(storage, emitter);
    await eng.makePick({ leagueId: 1, userId: 10, songId: 200 });
    // advance turn so same user can't pick twice
    await expect(
      eng.makePick({ leagueId: 1, userId: 20, songId: 200 }),
    ).rejects.toThrow("Song already drafted");
  });

  it("startDraft flips draft_started and emits", async () => {
    // create a league that isn't started
    storage = makeMockStorage();
    storage.getLeague = async (id: number) => ({
      id: 2,
      draft_started: false,
      draft_order: [1, 2],
      current_pick_index: 0,
      current_round: 0,
      picks_per_round: 2,
    });
    const eng = new DraftEngine(storage, emitter);
    await eng.startDraft(2);
    const l = await storage.getLeague(2);
    expect(l.draft_started).toBe(true);
    expect(emitted.find((e) => e.event === "draft:started")).toBeTruthy();
  });
});
