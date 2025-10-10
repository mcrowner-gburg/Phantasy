// packages/domain/draft/DraftEngine.ts
// Pure domain DraftEngine. Depends only on a storage interface and an emitter.
// It validates turn order, uniqueness, and persists picks via storage API.
// The storage interface is intentionally minimal — adapt to your real storage API.

export type DraftPick = {
  leagueId: number;
  userId: number;
  songId: number;
};

export type League = {
  id: number;
  draft_started: boolean | null;
  draft_order: number[]; // user ids in draft order for entire draft (snake ordering should be precomputed)
  current_pick_index: number; // index into draft_order for whose turn it is
  current_round: number;
  picks_per_round?: number;
  pick_timeout_seconds?: number | null;
};

export type DraftedSong = {
  id?: number;
  league_id: number;
  song_id: number;
  drafted_by: number;
  draft_round: number;
  draft_pick: number;
  created_at?: string;
};

export interface Storage {
  // minimal methods used by DraftEngine; adapt names/types to your storage.ts
  getLeague(leagueId: number): Promise<League | undefined>;
  isSongDraftedInLeague(songId: number, leagueId: number): Promise<boolean>;
  draftSong(d: DraftedSong): Promise<DraftedSong>;
  getDraftedSongsForLeague(leagueId: number): Promise<DraftedSong[]>;
  getLeagueMembers(leagueId: number): Promise<{ userId: number }[]>;
  // update league state (current pick index, round) — atomic in your DB
  updateLeagueState(leagueId: number, patch: Partial<League>): Promise<void>;
  // optional: run callback inside DB transaction if available in your storage
  transaction?<T>(fn: (trx: Storage) => Promise<T>): Promise<T>;
}

export type Emitter = {
  // any "emit" function: e.g. socket.io.Server or a simple EventEmitter
  emit(room: string, event: string, payload?: any): void;
  to?(room: string): { emit: (event: string, payload?: any) => void }; // if using socket.io style
};

export class DraftEngine {
  private storage: Storage;
  private emitter?: Emitter;
  private roomPrefix = "league_";

  constructor(storage: Storage, emitter?: Emitter) {
    this.storage = storage;
    this.emitter = emitter;
  }

  private emit(leagueId: number, event: string, payload?: any) {
    if (!this.emitter) return;
    const room = `${this.roomPrefix}${leagueId}`;
    // support socket.io style `to(room).emit(event, payload)`
    if (typeof (this.emitter as any).to === "function") {
      (this.emitter as any).to(room).emit(event, payload);
      return;
    }
    // fallback to simple emit(room, event, payload)
    try {
      (this.emitter as any).emit(room, event, payload);
    } catch (err) {
      // swallow; emitter is optional
      console.warn("Emitter failed", err);
    }
  }

  /**
   * Get draft state useful for clients: drafted songs, league info, next user id
   */
  async getDraftState(leagueId: number) {
    const league = await this.storage.getLeague(leagueId);
    if (!league) throw new Error("League not found");

    const drafted = await this.storage.getDraftedSongsForLeague(leagueId);
    const nextUserId = league.draft_order[league.current_pick_index] ?? null;

    return {
      league,
      drafted,
      nextUserId,
    };
  }

  /**
   * Make a pick. Validates turn order and uniqueness.
   * This uses storage.transaction if provided, otherwise performs sequential operations.
   */
  async makePick(pick: DraftPick) {
    const action = async (st: Storage) => {
      const league = await st.getLeague(pick.leagueId);
      if (!league) throw new Error("League not found");
      if (!league.draft_started) throw new Error("Draft not started");

      const expectedUserId = league.draft_order[league.current_pick_index];
      if (expectedUserId !== pick.userId) {
        throw new Error("Not this user's turn");
      }

      const already = await st.isSongDraftedInLeague(
        pick.songId,
        pick.leagueId,
      );
      if (already) throw new Error("Song already drafted in this league");

      // Compute round and pick number (basic)
      const picksSoFar = await st.getDraftedSongsForLeague(pick.leagueId);
      const picksCount = picksSoFar.length;
      const picksPerRound = league.picks_per_round ?? league.draft_order.length;
      const draftRound = Math.floor(picksCount / picksPerRound) + 1;
      const draftPickNumber = (picksCount % picksPerRound) + 1;

      const drafted: DraftedSong = {
        league_id: pick.leagueId,
        song_id: pick.songId,
        drafted_by: pick.userId,
        draft_round: draftRound,
        draft_pick: draftPickNumber,
      };

      const created = await st.draftSong(drafted);

      // advance pick index (simple: +1 mod draft_order.length; adapt for snake logic if needed)
      const nextIndex =
        (league.current_pick_index + 1) % league.draft_order.length;
      const nextRound = draftRound + (nextIndex === 0 ? 1 : 0);

      await st.updateLeagueState(pick.leagueId, {
        current_pick_index: nextIndex,
        current_round: nextRound,
      });

      return created;
    };

    let result;
    if (typeof this.storage.transaction === "function") {
      result = await this.storage.transaction((trx) => action(trx));
    } else {
      result = await action(this.storage);
    }

    // emit after commit
    this.emit(pick.leagueId, "draft:pick", {
      leagueId: pick.leagueId,
      songId: pick.songId,
      userId: pick.userId,
    });

    return result;
  }

  /**
   * Start the draft: mark draft_started true and set current_pick_index to 0
   */
  async startDraft(leagueId: number) {
    const league = await this.storage.getLeague(leagueId);
    if (!league) throw new Error("League not found");
    if (league.draft_started) throw new Error("Draft already started");

    await this.storage.updateLeagueState(leagueId, {
      draft_started: true,
      current_pick_index: 0,
      current_round: 1,
    });

    this.emit(leagueId, "draft:started", { leagueId });
    return { ok: true };
  }

  /**
   * Forcibly auto-pick the next available song (used when user times out).
   * Strategy: find first non-drafted song from provided candidate list or from storage API.
   */
  async autoPick(
    leagueId: number,
    userId: number,
    candidateSongIds: number[] = [],
  ) {
    // candidateSongIds optional; storage could offer available songs list
    // naive strategy: try candidates then fail
    for (const sid of candidateSongIds) {
      const already = await this.storage.isSongDraftedInLeague(sid, leagueId);
      if (!already) {
        // reuse makePick logic (it will validate turn)
        return this.makePick({ leagueId, userId, songId: sid });
      }
    }
    throw new Error("No available song to auto-pick");
  }
}
