/**
 * PreDraftScreen.tsx  —  NOT YET WIRED INTO THE APP
 *
 * Shown in the draft room when draftStatus === "scheduled" and all players
 * are present. Replaces the plain "Start Draft Now" button with a two-step
 * flow:
 *
 *   1. Owner clicks "🎲 Randomize Draft Order"
 *      → calls POST /api/leagues/:id/randomize-draft-order (new endpoint needed)
 *      → server shuffles members, stores order, returns ordered array
 *   2. DuckRace component plays out the reveal
 *   3. Owner confirms → POST /api/leagues/:id/start-draft fires and draft begins
 *
 * Non-owners see a waiting screen during the race; the race result is broadcast
 * via the existing 2-second poll on draft-status so everyone sees the same order.
 *
 * Integration: in draft-room.tsx, replace the "scheduled" block with:
 *   <PreDraftScreen leagueId={leagueId} league={league} members={draftOrder} isOwner={isOwner} />
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Shuffle, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DuckRace } from "./DuckRace";

interface Member {
  userId: number;
  username?: string;
  user?: { username: string };
}

interface League {
  id: number;
  name: string;
  draftDate?: string;
  pickTimeLimit?: number;
}

interface PreDraftScreenProps {
  leagueId: string;
  league: League;
  members: Member[];
  isOwner: boolean;
}

type ScreenPhase = "waiting" | "racing" | "starting";

export function PreDraftScreen({ leagueId, league, members, isOwner }: PreDraftScreenProps) {
  const [phase, setPhase] = useState<ScreenPhase>("waiting");
  const [orderedPlayers, setOrderedPlayers] = useState<{ userId: number; username: string }[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // POST /api/leagues/:id/randomize-draft-order
  // New endpoint needed on the server — shuffles members, stores order, returns array
  const randomizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/leagues/${leagueId}/randomize-draft-order`, {});
    },
    onSuccess: (data: any) => {
      // Server returns { orderedUserIds: number[] }
      const ordered = (data.orderedUserIds as number[]).map((uid) => {
        const member = members.find((m) => m.userId === uid);
        return {
          userId: uid,
          username: member?.user?.username ?? member?.username ?? `Player ${uid}`,
        };
      });
      setOrderedPlayers(ordered);
      setPhase("racing");
    },
    onError: (err: any) => {
      toast({ title: "Failed to randomize", description: err.message, variant: "destructive" });
    },
  });

  // POST /api/leagues/:id/start-draft — fires after race completes
  const startMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/leagues/${leagueId}/start-draft`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-order`] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to start draft", description: err.message, variant: "destructive" });
    },
  });

  // Duck race finished — start the actual draft
  const handleRaceComplete = () => {
    setPhase("starting");
    startMutation.mutate();
  };

  // ── Duck race overlay ─────────────────────────────────────────────────────
  if (phase === "racing" && orderedPlayers.length > 0) {
    return <DuckRace orderedPlayers={orderedPlayers} onComplete={handleRaceComplete} />;
  }

  // ── Starting transition ───────────────────────────────────────────────────
  if (phase === "starting") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🏁</div>
          <p className="text-2xl font-black text-white">Draft is live!</p>
          <p className="text-gray-400">Get your picks ready…</p>
        </div>
      </div>
    );
  }

  // ── Pre-race waiting room ─────────────────────────────────────────────────
  const memberCount = members.length;
  const draftDate = league.draftDate ? new Date(league.draftDate) : null;

  return (
    <div className="space-y-4">
      {/* Player roster */}
      <div className="flex flex-wrap gap-2 justify-center">
        {members.map((m) => {
          const name = m.user?.username ?? m.username ?? `Player ${m.userId}`;
          return (
            <div
              key={m.userId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700"
            >
              <span className="text-sm">🦆</span>
              <span className="text-sm text-white font-medium">{name}</span>
            </div>
          );
        })}
      </div>

      {/* Scheduled time */}
      {draftDate && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Scheduled for {draftDate.toLocaleString()}</span>
        </div>
      )}

      {/* Player count */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Users className="h-4 w-4" />
        <span>{memberCount} players in the league</span>
      </div>

      {/* Owner controls */}
      {isOwner ? (
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg px-8 gap-2"
            onClick={() => randomizeMutation.mutate()}
            disabled={randomizeMutation.isPending || memberCount < 2}
          >
            <Shuffle className="h-5 w-5" />
            {randomizeMutation.isPending ? "Shuffling…" : "🎲 Race for Draft Order!"}
          </Button>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            This runs a duck race to randomly determine who picks when.
            All league members will see the live results.
          </p>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400">
          <div className="text-3xl mb-2 animate-bounce">🦆</div>
          <p className="text-sm">Waiting for the league owner to start the draft…</p>
        </div>
      )}
    </div>
  );
}
