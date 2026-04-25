import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Trophy, User, Medal, TrendingUp, Music, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: number; username: string } | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  const { data: leagues } = useQuery<any[]>({
    queryKey: ["/api/leagues"],
    enabled: !!user?.id,
  });

  // Initialize from URL param or first league
  useEffect(() => {
    if (!leagues?.length) return;
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get("league");
    setSelectedLeagueId(fromUrl ? parseInt(fromUrl) : leagues[0].id);
  }, [leagues]);

  const leagueId = selectedLeagueId;

  const { data: standings, isLoading, refetch: refetchStandings } = useQuery<any[]>({
    queryKey: [`/api/leagues/${leagueId}/standings`],
    enabled: !!leagueId,
    staleTime: 0,
  });

  const { data: leagueInfo } = useQuery<any>({
    queryKey: [`/api/leagues/${leagueId}`],
    enabled: !!leagueId,
  });

  // Player song drill-down
  const { data: playerSongs, isLoading: songsLoading } = useQuery<any[]>({
    queryKey: [`/api/leagues/${leagueId}/player/${selectedPlayer?.id}/songs`],
    enabled: !!leagueId && !!selectedPlayer,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-400" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Medal className="text-orange-500" size={24} />;
      default: return <User className="text-gray-500" size={24} />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500 text-black";
      case 2: return "bg-gray-400 text-black";
      case 3: return "bg-orange-500 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />

      <div className="flex-1 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <p className="phish-text">See how you stack up against other players</p>
            </div>
            {leagues && leagues.length > 1 ? (
              <Select
                value={selectedLeagueId?.toString() ?? ""}
                onValueChange={(val) => {
                  setSelectedLeagueId(parseInt(val));
                  setSelectedPlayer(null);
                }}
              >
                <SelectTrigger className="w-48 border-green-500 text-green-400 bg-transparent">
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((l: any) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="border-green-500 text-green-500">
                {leagueInfo?.name || "Loading…"}
              </Badge>
            )}
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8">
          {/* Top 3 Podium */}
          {!isLoading && standings && standings.length >= 3 && (
            <Card className="glassmorphism border-gray-600 mb-8">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-center mb-8">Top Performers</h3>
                <div className="flex justify-center items-end space-x-8">
                  {/* 2nd */}
                  <div
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlayer({ id: standings[1].id, username: standings[1].username })}
                  >
                    <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Medal className="text-white" size={32} />
                    </div>
                    <p className="font-bold text-lg">{standings[1]?.username}</p>
                    <p className="phish-gold text-xl font-bold">{standings[1]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-gray-400 text-black mt-2">2nd Place</Badge>
                  </div>
                  {/* 1st */}
                  <div
                    className="text-center -mt-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlayer({ id: standings[0].id, username: standings[0].username })}
                  >
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Crown className="text-white" size={36} />
                    </div>
                    <p className="font-bold text-xl">{standings[0]?.username}</p>
                    <p className="phish-gold text-2xl font-bold">{standings[0]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-yellow-500 text-black mt-2">Champion</Badge>
                  </div>
                  {/* 3rd */}
                  <div
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlayer({ id: standings[2].id, username: standings[2].username })}
                  >
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Medal className="text-white" size={32} />
                    </div>
                    <p className="font-bold text-lg">{standings[2]?.username}</p>
                    <p className="phish-gold text-xl font-bold">{standings[2]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-orange-500 text-white mt-2">3rd Place</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className={`grid gap-6 ${selectedPlayer ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            {/* Full Standings */}
            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Full Standings</h3>
                  <p className="phish-text text-sm">{standings?.length || 0} players</p>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-700 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : standings && standings.length > 0 ? (
                  <div className="space-y-3">
                    {standings.map((player: any, index: number) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                          selectedPlayer?.id === player.id
                            ? "bg-green-900 bg-opacity-40 ring-1 ring-green-500"
                            : "hover:bg-black hover:bg-opacity-50 " + (index < 3 ? "bg-black bg-opacity-30" : "bg-black bg-opacity-20")
                        }`}
                        onClick={() =>
                          setSelectedPlayer(
                            selectedPlayer?.id === player.id
                              ? null
                              : { id: player.id, username: player.username }
                          )
                        }
                      >
                        <div className="flex items-center space-x-4">
                          <Badge className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(player.rank)}`}>
                            {player.rank}
                          </Badge>
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            {getRankIcon(player.rank)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-lg">{player.username}</p>
                              {player.rank <= 3 && (
                                <Badge className={`text-xs px-2 py-1 ${getRankBadgeColor(player.rank)}`}>
                                  {player.rank === 1 ? "Champion" : player.rank === 2 ? "Runner-up" : "3rd Place"}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm phish-text">
                              <span>{player.songCount || 0} songs drafted</span>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <TrendingUp size={14} />
                                <span>+{player.todayPoints || 0} last show</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold phish-gold text-xl">{player.totalPoints?.toLocaleString() ?? 0}</p>
                            <p className="text-sm phish-text">Total Points</p>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`text-gray-400 transition-transform ${selectedPlayer?.id === player.id ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 phish-text">
                    <Trophy className="mx-auto mb-4" size={48} />
                    <p className="text-lg mb-2">No standings available</p>
                    <p>
                      <button
                        className="text-green-400 hover:text-green-300 underline"
                        onClick={() => setLocation("/leagues")}
                      >
                        Join a league
                      </button>{" "}
                      to see standings here!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player Song Detail Panel */}
            {selectedPlayer && (
              <Card className="glassmorphism border-gray-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-green-400" />
                      {selectedPlayer.username}'s Songs
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      onClick={() => setSelectedPlayer(null)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <p className="text-sm phish-text">
                    {playerSongs
                      ? `${playerSongs.length} songs · ${playerSongs.reduce((s: number, p: any) => s + (p.points ?? 0), 0)} pts total`
                      : "Loading…"}
                  </p>
                </CardHeader>
                <CardContent>
                  {songsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse h-10 bg-gray-700 rounded" />
                      ))}
                    </div>
                  ) : playerSongs && playerSongs.length > 0 ? (
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                      {playerSongs.map((s: any, i: number) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                            s.points > 0
                              ? "bg-green-950 bg-opacity-60"
                              : "bg-black bg-opacity-20"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-gray-500 w-12 flex-shrink-0">
                              R{s.draftRound ?? "?"} #{s.draftPick ?? "?"}
                            </span>
                            <span className={`text-sm truncate ${s.points > 0 ? "text-white font-medium" : "text-gray-400"}`}>
                              {s.songTitle}
                            </span>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {s.points > 0 ? (
                              <Badge className="bg-green-600 text-white text-xs">
                                {s.points} pts
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-600">—</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 phish-text">
                      <Music className="mx-auto mb-3" size={40} />
                      <p>No songs drafted yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
