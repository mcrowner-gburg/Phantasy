/**
 * DuckRace.tsx  —  NOT YET WIRED INTO THE APP
 *
 * Pre-draft order reveal screen. The server already knows the random order;
 * this component receives it and animates a duck race where each duck's
 * finish position matches the predetermined draft pick order.
 *
 * Integration point: render this in draft-room.tsx when draftStatus === "scheduled"
 * and the owner clicks "Randomize Draft Order". Pass the ordered member list the
 * server returns, and onComplete() to move forward once the race finishes.
 *
 * Props:
 *   orderedPlayers  — members in draft pick order (index 0 = pick #1, crosses finish first)
 *   onComplete      — called after the race result card is shown and owner confirms
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle } from "lucide-react";

interface Player {
  userId: number;
  username: string;
}

interface DuckRaceProps {
  orderedPlayers: Player[];   // draft order from server: index 0 picks first
  onComplete: () => void;     // called when owner hits "Lock In & Start Draft"
}

// ─── timing constants ────────────────────────────────────────────────────────
const COUNTDOWN_MS   = 4_000;  // 3-2-1-GO animation before gates open
const WINNER_FINISH  = 7_000;  // ms after GO when pick-1 duck crosses the line
const PLACE_SPREAD   = 650;    // extra ms each subsequent duck adds

// place badges
const BADGE: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const placeSuffix = (n: number) => ["st","nd","rd"][n - 1] ?? "th";

type Phase = "countdown" | "racing" | "finished";

export function DuckRace({ orderedPlayers, onComplete }: DuckRaceProps) {
  const n = orderedPlayers.length;

  // Map userId → finish place (1-indexed)
  const finishPlace = Object.fromEntries(
    orderedPlayers.map((p, i) => [p.userId, i + 1])
  );

  // For each player, compute their CSS transition duration.
  // ease-in means all ducks look close at the start and separate near the end.
  const durationMs = (userId: number) =>
    WINNER_FINISH + (finishPlace[userId] - 1) * PLACE_SPREAD;

  // Shuffle lane positions once on mount so the winning duck isn't always
  // in lane 1 — finish order and lane order are independent.
  const [laneOrder] = useState<Player[]>(() => {
    const arr = [...orderedPlayers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  // ─── phase & countdown ───────────────────────────────────────────────────
  const [phase, setPhase]         = useState<Phase>("countdown");
  const [countNum, setCountNum]   = useState(3);
  const [finishedIds, setFinishedIds] = useState<number[]>([]);

  // kick off the race
  const [go, setGo] = useState(false);

  useEffect(() => {
    // 3 → 2 → 1 → GO!
    const ticks = [
      setTimeout(() => setCountNum(2), 1_000),
      setTimeout(() => setCountNum(1), 2_000),
      setTimeout(() => setCountNum(0), 3_000),   // "GO!"
      setTimeout(() => {
        setPhase("racing");
        setGo(true);
      }, COUNTDOWN_MS),
    ];
    return () => ticks.forEach(clearTimeout);
  }, []);

  // Schedule "duck crossed the finish line" events for each player
  useEffect(() => {
    if (phase !== "racing") return;
    const timers = orderedPlayers.map((p) =>
      setTimeout(() => {
        setFinishedIds((prev) => [...prev, p.userId]);
      }, durationMs(p.userId))
    );
    // Mark the whole race finished when the last duck crosses
    const lastMs = durationMs(orderedPlayers[n - 1].userId) + 600;
    const done = setTimeout(() => setPhase("finished"), lastMs);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [phase]);

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 overflow-hidden">

      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-yellow-400 opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top:  `${Math.random() * 100}%`,
              fontSize: `${6 + Math.random() * 10}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Shuffle className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">
            Draft Order Race
          </h1>
          <Shuffle className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-gray-400 text-sm">
          First duck to finish picks first!
        </p>
      </div>

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            key={countNum}
            className="text-9xl font-black text-yellow-400 drop-shadow-lg"
            style={{ animation: "ping-once 0.8s ease-out" }}
          >
            {countNum === 0 ? "GO! 🦆" : countNum}
          </div>
        </div>
      )}

      {/* Race track */}
      <div className="relative z-10 w-full max-w-3xl px-4">
        {/* Water / track lanes */}
        <div className="relative rounded-xl overflow-hidden border border-blue-800 bg-blue-950 shadow-2xl">

          {/* Finish line */}
          <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col items-center justify-center z-10 bg-gradient-to-l from-yellow-500/20 to-transparent border-r-0">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400 opacity-80" />
            <span className="text-yellow-400 text-xs font-bold rotate-90 whitespace-nowrap tracking-widest mt-2 opacity-70">
              FINISH
            </span>
          </div>

          {/* Start line */}
          <div className="absolute left-16 top-0 bottom-0 w-px bg-white opacity-10" />

          {/* Lanes — displayed in shuffled order so finish order isn't predictable by lane position */}
          {laneOrder.map((player, idx) => {
            const place = finishPlace[player.userId];
            const hasFinished = finishedIds.includes(player.userId);
            const myDuration = durationMs(player.userId);

            return (
              <div
                key={player.userId}
                className={`relative flex items-center border-b border-blue-900 last:border-b-0 ${
                  idx % 2 === 0 ? "bg-blue-950" : "bg-blue-900/40"
                }`}
                style={{ height: "56px" }}
              >
                {/* Lane number + player name */}
                <div className="w-16 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-blue-400 font-bold">
                    {idx + 1}
                  </span>
                </div>
                <div className="w-28 flex-shrink-0 truncate">
                  <span className="text-sm text-white font-medium">
                    {player.username}
                  </span>
                </div>

                {/* Duck — spans the full race track width */}
                <div
                  className="absolute"
                  style={{ left: "180px", right: "36px", top: 0, bottom: 0 }}
                >
                  {/* Animate left: 0 → calc(100% - 40px) across the container */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: go ? "calc(100% - 40px)" : "0px",
                      transform: "translateY(-50%)",
                      transition: go
                        ? `left ${myDuration}ms cubic-bezier(0.3, 0, 0.7, 1)`
                        : "none",
                    }}
                  >
                    {/* Water ripple — shown behind duck while racing */}
                    {go && !hasFinished && (
                      <span
                        className="absolute text-xs text-blue-300 opacity-50 pointer-events-none select-none"
                        style={{
                          right: "100%",
                          top: "50%",
                          transform: "translateY(-50%)",
                          animation: "fade-trail 0.5s ease-out infinite",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ～～
                      </span>
                    )}

                    {/* Duck body */}
                    <span
                      className="text-3xl select-none"
                      style={{
                        display: "inline-block",
                        animation: go && !hasFinished
                          ? "duck-bob 0.3s ease-in-out infinite alternate"
                          : "none",
                      }}
                    >
                      🦆
                    </span>
                  </div>
                </div>

                {/* Finish badge — appears when duck crosses */}
                {hasFinished && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 animate-bounce">
                    <span className="text-xl" title={`Pick #${place}`}>
                      {BADGE[place] ?? (
                        <span className="text-xs font-black text-yellow-300 bg-yellow-900 px-1.5 py-0.5 rounded-full">
                          {place}{placeSuffix(place)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live place announcer */}
        {phase === "racing" && finishedIds.length > 0 && (
          <div className="mt-3 text-center text-sm text-yellow-300 font-bold animate-pulse">
            🏁 {orderedPlayers.find(p => p.userId === finishedIds[finishedIds.length - 1])?.username} crosses in{" "}
            {finishedIds.length === 1 ? "1st" : `${finishedIds.length}${placeSuffix(finishedIds.length)}`}!
          </div>
        )}
      </div>

      {/* ─── Results card (phase: finished) ────────────────────────────────── */}
      {phase === "finished" && (
        <div className="relative z-10 mt-6 w-full max-w-md px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-black text-white">Draft Order Set!</h2>
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>

            <ol className="space-y-2 mb-5">
              {orderedPlayers.map((player, i) => (
                <li
                  key={player.userId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800"
                >
                  <span className="text-lg w-8 text-center flex-shrink-0">
                    {BADGE[i + 1] ?? (
                      <span className="text-sm font-bold text-gray-400">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <span className="text-white font-medium">{player.username}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    picks {i + 1}{placeSuffix(i + 1)}
                  </span>
                </li>
              ))}
            </ol>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
              size="lg"
              onClick={onComplete}
            >
              🏁 Lock In & Start Draft
            </Button>
          </div>
        </div>
      )}

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes ping-once {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes duck-bob {
          from { transform: translateY(-2px) rotate(-3deg); }
          to   { transform: translateY(2px)  rotate(3deg);  }
        }
        @keyframes fade-trail {
          0%   { opacity: 0.5; }
          100% { opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
