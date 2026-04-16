import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Users, Music, Timer, Crown, Zap, Star, StarOff, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useWishList } from "@/hooks/useWishList";
import { PreDraftScreen } from "@/components/PreDraftScreen";

export default function DraftRoom() {
  const { id: leagueId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startCountdown, setStartCountdown] = useState(0);
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false);
  const autoDraftFiredRef = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const leagueIdNum = leagueId ? parseInt(leagueId) : undefined;
  const { list: wishList, toggle: toggleQueue, move: moveQueue, remove: removeQueue } = useWishList(leagueIdNum);

  // Get draft status
  const { data: league, isLoading: leagueLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-status`],
    refetchInterval: 2000,
  }) as { data: any, isLoading: boolean };

  // Get draft order
  const { data: draftOrder, isLoading: draftOrderLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-order`],
    enabled: !!leagueId,
  }) as { data: any[], isLoading: boolean };

  // Get draft picks
  const { data: draftPicks } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-picks`],
    refetchInterval: 2000,
  });

  // Get available songs for this league
  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ["/api/songs", leagueId],
    queryFn: () => fetch(`/api/songs?leagueId=${leagueId}`).then(res => res.json()),
    refetchInterval: 5000,
  });

  // Remove queue songs that got drafted by someone else
  useEffect(() => {
    if (!songs || !league || league.draftStatus !== "active") return;
    const availableIds = new Set((songs as any[]).map((s: any) => s.id));
    wishList.forEach(id => { if (!availableIds.has(id)) removeQueue(id); });
  }, [songs]);

  // Draft pick mutation
  const draftMutation = useMutation({
    mutationFn: async (songId: number) => {
      return apiRequest("POST", `/api/leagues/${leagueId}/draft-pick`, {
        userId: user?.id,
        songId,
        timeUsed: (league?.pickTimeLimit || 90) - timeRemaining,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-picks`] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({ title: "Pick successful!", description: "Your song has been drafted." });
    },
    onError: (error: any) => {
      toast({ title: "Draft failed", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  // Auto-draft mutation — queue-aware: tries queue songs first, then falls back to most-played
  const autoDraftMutation = useMutation({
    mutationFn: async () => {
      const availableIds = new Set((songs as any[] ?? []).map((s: any) => s.id));
      const preferredSongIds = wishList.filter(id => availableIds.has(id));
      const res = await apiRequest("POST", `/api/leagues/${leagueId}/auto-pick`, {
        userId: user?.id,
        preferredSongIds,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-picks`] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      const fromQueue = data?.fromQueue;
      toast({
        title: fromQueue ? "Queue pick made!" : "Auto-drafted!",
        description: data?.songTitle
          ? `${fromQueue ? "Picked from your queue" : "Auto-picked"}: ${data.songTitle}`
          : "Your pick has been made automatically.",
      });
    },
    onError: (error: any) => {
      toast({ title: "Auto-draft failed", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  // Start draft mutation (for league owners)
  const startDraftMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/leagues/${leagueId}/start-draft`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
      toast({ title: "Draft started!", description: "The draft is now active." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to start draft", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  // Countdown to scheduled draft start
  useEffect(() => {
    if (league?.draftStatus !== "scheduled" || !league?.draftDate) return;
    const update = () => {
      const secs = Math.max(0, Math.floor((new Date(league.draftDate).getTime() - Date.now()) / 1000));
      setStartCountdown(secs);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [league?.draftStatus, league?.draftDate]);

  // Pick timer — countdown display only. Server-side automation handles timed-out picks.
  useEffect(() => {
    if (league?.draftStatus !== "active" || !league?.pickDeadline) return;

    const update = () => {
      const secs = Math.max(0, Math.floor((new Date(league.pickDeadline).getTime() - Date.now()) / 1000));
      setTimeRemaining(secs);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [league?.currentPlayer, league?.draftStatus, league?.pickDeadline]);

  // When auto-draft is enabled and it becomes the user's turn, pick immediately.
  // Use a short timeout so rapid isMyTurn flickers (caused by 2s poll) don't double-fire.
  const isMyTurn = league && league.currentPlayer === user?.id;
  useEffect(() => {
    if (!isMyTurn || !autoDraftEnabled) {
      autoDraftFiredRef.current = false;
      return;
    }
    if (autoDraftFiredRef.current) return;
    autoDraftFiredRef.current = true;
    const t = setTimeout(() => { autoDraftMutation.mutate(); }, 400);
    return () => clearTimeout(t);
  }, [isMyTurn, autoDraftEnabled]);

  const filteredSongs = (songs as any[] ?? []).filter((song: any) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwner = league && league.ownerId === user?.id;
  const currentPlayer = draftOrder?.find((member: any) => member.userId === league?.currentPlayer);

  // Queue songs — only ones still available
  const availableSongIds = new Set((songs as any[] ?? []).map((s: any) => s.id));
  const queueSongs = wishList
    .filter(id => availableSongIds.has(id))
    .map(id => (songs as any[])?.find((s: any) => s.id === id))
    .filter(Boolean);

  // Build the snake pick order for the current and next round
  const buildSnakeRoundOrder = (members: any[], round: number) => {
    if (!members || members.length === 0) return [];
    return round % 2 === 1 ? [...members] : [...members].reverse();
  };

  const currentRound = league?.currentRound ?? 1;
  const currentRoundOrder = buildSnakeRoundOrder(draftOrder || [], currentRound);
  const nextRoundOrder = buildSnakeRoundOrder(draftOrder || [], currentRound + 1);
  const picksInCurrentRound = ((league?.currentPick ?? 1) - 1) % (draftOrder?.length || 1);
  const remainingThisRound = currentRoundOrder.slice(picksInCurrentRound);

  if (leagueLoading || draftOrderLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <div className="lg:ml-64 p-4">
          <div className="text-center">Loading draft room...</div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <div className="lg:ml-64 p-4">
          <div className="text-center text-red-600">League not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationSidebar />
      <div className="lg:ml-64 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Draft Status Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  {league?.name} - Draft Room
                </div>
                <Badge variant={
                  league?.draftStatus === "active" ? "default" :
                  league?.draftStatus === "scheduled" ? "secondary" :
                  league?.draftStatus === "completed" ? "outline" : "destructive"
                }>
                  {league?.draftStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{league?.currentRound || 1}</div>
                  <div className="text-sm text-gray-600">Round</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{league?.currentPick || 1}</div>
                  <div className="text-sm text-gray-600">Overall Pick</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{draftOrder?.length || 0}</div>
                  <div className="text-sm text-gray-600">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{league?.pickTimeLimit || 90}s</div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                </div>
              </div>

              {league && league.draftStatus === "scheduled" && (
                <div className="mt-4">
                  <PreDraftScreen
                    leagueId={leagueId!}
                    league={league}
                    members={draftOrder ?? []}
                    isOwner={!!isOwner}
                  />
                </div>
              )}

              {league && league.draftStatus === "active" && (
                <div className="mt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {isMyTurn ? "Your Turn!" : `${currentPlayer?.user?.username || currentPlayer?.username || 'Unknown Player'}'s Turn`}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Timer className="h-4 w-4" />
                      <span className={`font-mono text-lg ${timeRemaining <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                      </span>
                      {!isMyTurn && (
                        <span className="text-xs text-gray-500">until auto-pick</span>
                      )}
                    </div>
                    <Button
                      variant={autoDraftEnabled ? "default" : "outline"}
                      size="sm"
                      className="mt-3"
                      onClick={() => setAutoDraftEnabled(prev => !prev)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {autoDraftEnabled ? "Auto Draft: On" : "Auto Draft: Off"}
                    </Button>
                    {autoDraftEnabled && queueSongs.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Will pick from your queue ({queueSongs.length} song{queueSongs.length !== 1 ? "s" : ""})
                      </p>
                    )}
                    {autoDraftEnabled && queueSongs.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Queue empty — will pick most-played available song
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Songs */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Available Songs ({filteredSongs.length})
                  </CardTitle>
                  <div>
                    <Input
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {songsLoading ? (
                    <div className="text-center py-8">Loading songs...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSongs.map((song: any) => {
                        const queuePos = wishList.indexOf(song.id);
                        const inQueue = queuePos !== -1;
                        return (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              inQueue
                                ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Queue toggle star */}
                              <button
                                onClick={() => toggleQueue(song.id)}
                                className={`flex-shrink-0 transition-colors ${
                                  inQueue ? "text-yellow-500 hover:text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                                }`}
                                title={inQueue ? "Remove from queue" : "Add to queue"}
                              >
                                {inQueue ? <Star className="h-4 w-4" fill="currentColor" /> : <Star className="h-4 w-4" />}
                              </button>
                              {inQueue && (
                                <span className="text-xs font-bold text-yellow-600 w-5 flex-shrink-0">
                                  #{queuePos + 1}
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className={`font-medium truncate ${inQueue ? "text-yellow-800 dark:text-yellow-200" : ""}`}>
                                  {song.title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {song.category} • {song.plays24Months} plays (24 months)
                                </div>
                              </div>
                            </div>
                            {isMyTurn && league && league.draftStatus === "active" && (
                              <Button
                                onClick={() => draftMutation.mutate(song.id)}
                                disabled={draftMutation.isPending}
                                size="sm"
                                className="ml-2 flex-shrink-0"
                              >
                                Draft
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Your Picks */}
              {(() => {
                const myPicks = (draftPicks as any[] ?? []).filter(
                  (p: any) => p.userId === user?.id || p.user?.id === user?.id
                );
                if (myPicks.length === 0) return null;
                return (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-blue-500" />
                        My Picks
                        <Badge variant="outline" className="ml-auto text-xs">
                          {myPicks.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {myPicks.map((pick: any, idx: number) => (
                          <div
                            key={pick.id}
                            className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          >
                            <span className="text-xs font-bold text-blue-500 w-5 flex-shrink-0 pt-0.5">
                              R{pick.draftRound ?? idx + 1}
                            </span>
                            <span className="text-sm font-medium leading-tight">
                              {pick.song?.title ?? `Pick #${pick.pickNumber}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Draft Queue */}
              <Card className="border-yellow-400 border-opacity-60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <Star className="h-4 w-4" fill="currentColor" />
                    My Queue
                    {queueSongs.length > 0 && (
                      <Badge variant="outline" className="ml-auto text-yellow-600 border-yellow-400 text-xs">
                        {queueSongs.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {queueSongs.length === 0
                      ? "Star songs below to build your queue"
                      : "Your picks in priority order"}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {queueSongs.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <StarOff className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No songs queued yet.</p>
                      <p className="text-xs mt-1">Tap ★ next to any song to add it.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {queueSongs.map((song: any, idx: number) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                        >
                          <span className="text-xs font-bold text-yellow-600 w-5 flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{song.title}</p>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {/* Draft from queue button — only on user's turn */}
                            {isMyTurn && league?.draftStatus === "active" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-6 px-2 text-xs mr-1"
                                onClick={() => draftMutation.mutate(song.id)}
                                disabled={draftMutation.isPending}
                              >
                                Draft
                              </Button>
                            )}
                            <button
                              onClick={() => moveQueue(song.id, -1)}
                              disabled={idx === 0}
                              className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5"
                              title="Move up"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => moveQueue(song.id, 1)}
                              disabled={idx === queueSongs.length - 1}
                              className="text-gray-400 hover:text-gray-700 disabled:opacity-20 p-0.5"
                              title="Move down"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeQueue(song.id)}
                              className="text-gray-300 hover:text-red-400 p-0.5"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Draft top of queue shortcut */}
                  {isMyTurn && league?.draftStatus === "active" && queueSongs.length > 0 && (
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => draftMutation.mutate(queueSongs[0].id)}
                      disabled={draftMutation.isPending}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      Draft #{1}: {queueSongs[0].title}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Draft Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {league?.draftStatus === "active" ? `Round ${currentRound} Order` : "Draft Order"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {league?.draftStatus === "active" && draftOrder && draftOrder.length > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Round {currentRound} {currentRound % 2 === 1 ? "→" : "←"}
                        </div>
                        <div className="space-y-1">
                          {remainingThisRound.map((member: any, i: number) => {
                            const isCurrent = member.userId === league?.currentPlayer;
                            const isMe = member.userId === user?.id;
                            return (
                              <div
                                key={`curr-${member.userId}-${i}`}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  isCurrent
                                    ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400'
                                    : 'bg-gray-50 dark:bg-gray-800'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                  {picksInCurrentRound + i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{member.user?.username || member.username || 'Unknown'}</div>
                                  {isMe && <div className="text-xs text-blue-600">You</div>}
                                </div>
                                {isCurrent && <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {currentRound < (league?.draftRounds ?? 10) && (
                        <div>
                          <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                            Round {currentRound + 1} {(currentRound + 1) % 2 === 1 ? "→" : "←"}
                          </div>
                          <div className="space-y-1">
                            {nextRoundOrder.map((member: any, i: number) => (
                              <div
                                key={`next-${member.userId}-${i}`}
                                className="flex items-center gap-2 p-1.5 rounded bg-gray-50 dark:bg-gray-800 opacity-50"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 text-xs flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </div>
                                <div className="text-sm truncate text-gray-500">{member.user?.username || member.username || 'Unknown'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draftOrder && Array.isArray(draftOrder) ? draftOrder.map((member: any, index: number) => (
                        <div
                          key={member.userId}
                          className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{member.user?.username || member.username || 'Unknown User'}</div>
                            {member.userId === user?.id && (
                              <div className="text-xs text-blue-600">You</div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500">No players in draft order</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Picks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Picks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {draftPicks && Array.isArray(draftPicks) ? draftPicks.slice(-10).reverse().map((pick: any) => (
                      <div key={pick.id} className="text-sm">
                        <div className="font-medium">{pick.song?.title || 'Unknown Song'}</div>
                        <div className="text-gray-600">
                          Pick #{pick.pickNumber} - {pick.user?.username || 'Unknown User'}
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">No picks yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
