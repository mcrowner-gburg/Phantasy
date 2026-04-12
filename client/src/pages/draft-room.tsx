import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Music, Timer, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function DraftRoom() {
  const { id: leagueId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startCountdown, setStartCountdown] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get draft status
  const { data: league, isLoading: leagueLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-status`],
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  }) as { data: any, isLoading: boolean };

  // Get draft order
  const { data: draftOrder, isLoading: draftOrderLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-order`],
    enabled: !!leagueId,
  }) as { data: any[], isLoading: boolean };

  // Get draft picks
  const { data: draftPicks } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-picks`],
    refetchInterval: 2000, // Poll for real-time updates
  });

  // Get available songs for this league
  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ["/api/songs", leagueId],
    queryFn: () => fetch(`/api/songs?leagueId=${leagueId}`).then(res => res.json()),
    refetchInterval: 5000, // Refresh available songs
  });

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
      toast({
        title: "Pick successful!",
        description: "Your song has been drafted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Draft failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start draft mutation (for league owners)
  const startDraftMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/leagues/${leagueId}/start-draft`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
      toast({
        title: "Draft started!",
        description: "The draft is now active.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start draft",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
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

  // Pick timer — resets each time the current player changes
  useEffect(() => {
    if (league?.draftStatus !== "active" || !league?.pickDeadline) return;

    const update = () => {
      const secs = Math.max(0, Math.floor((new Date(league.pickDeadline).getTime() - Date.now()) / 1000));
      setTimeRemaining(secs);

      // When it's our turn and the clock hits 0, trigger server auto-pick
      if (secs === 0 && league.currentPlayer === user?.id) {
        apiRequest("POST", `/api/leagues/${leagueId}/auto-pick`, { userId: user?.id }).then(() => {
          queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-status`] });
          queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}/draft-picks`] });
          queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
        }).catch(() => {});
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [league?.currentPlayer, league?.draftStatus, league?.pickDeadline, user?.id]);

  const filteredSongs = songs?.filter((song: any) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isMyTurn = league && league.currentPlayer === user?.id;
  const isOwner = league && league.ownerId === user?.id;
  const currentPlayer = draftOrder?.find((member: any) => member.userId === league?.currentPlayer);

  // Build the snake pick order for the current and next round
  const buildSnakeRoundOrder = (members: any[], round: number) => {
    if (!members || members.length === 0) return [];
    // odd rounds: forward (0→N-1), even rounds: backward (N-1→0)
    return round % 2 === 1 ? [...members] : [...members].reverse();
  };

  const currentRound = league?.currentRound ?? 1;
  const currentRoundOrder = buildSnakeRoundOrder(draftOrder || [], currentRound);
  const nextRoundOrder = buildSnakeRoundOrder(draftOrder || [], currentRound + 1);
  // Picks already made in the current round
  const picksInCurrentRound = ((league?.currentPick ?? 1) - 1) % (draftOrder?.length || 1);
  // Remaining picks in this round = players after the current position
  const remainingThisRound = currentRoundOrder.slice(picksInCurrentRound);

  // Loading and error handling
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
                <div className="mt-4 text-center space-y-3">
                  {league.draftDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Draft starts {new Date(league.draftDate).toLocaleString()}
                      </p>
                      {startCountdown > 0 && (
                        <div className="flex items-center justify-center gap-2">
                          <Timer className="h-4 w-4 text-blue-600" />
                          <span className="font-mono text-lg text-blue-600">
                            {startCountdown >= 3600
                              ? `${Math.floor(startCountdown / 3600)}h ${Math.floor((startCountdown % 3600) / 60)}m`
                              : startCountdown >= 60
                              ? `${Math.floor(startCountdown / 60)}m ${startCountdown % 60}s`
                              : `${startCountdown}s`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {isOwner && (
                    <Button
                      onClick={() => startDraftMutation.mutate()}
                      disabled={startDraftMutation.isPending}
                      size="lg"
                      variant="outline"
                    >
                      Start Draft Now
                    </Button>
                  )}
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Songs */}
            <div className="lg:col-span-2">
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
                      className="w-full"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {songsLoading ? (
                    <div className="text-center py-8">Loading songs...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSongs.map((song: any) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div>
                            <div className="font-medium">{song.title}</div>
                            <div className="text-sm text-gray-600">
                              {song.category} • {song.plays24Months} plays (24 months)
                            </div>
                          </div>
                          {isMyTurn && league && league.draftStatus === "active" && (
                            <Button
                              onClick={() => draftMutation.mutate(song.id)}
                              disabled={draftMutation.isPending}
                              size="sm"
                            >
                              Draft
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Draft Board */}
            <div className="space-y-6">
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
                      {/* Remaining picks this round */}
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
                      {/* Preview of next round */}
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