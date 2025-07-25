import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, User, Medal, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";



export default function Leaderboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Get user's first league as default
  const { data: leagues } = useQuery({
    queryKey: ["/api/leagues"],
    enabled: !!user?.id,
  });
  
  // Check if there's a league parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const leagueIdFromUrl = urlParams.get('league');
  const leagueId = leagueIdFromUrl ? parseInt(leagueIdFromUrl) : leagues?.[0]?.id;

  const { data: standings, isLoading } = useQuery({
    queryKey: ["/api/leagues", leagueId, "standings"],
    enabled: !!leagueId,
  });

  const { data: leagueInfo } = useQuery({
    queryKey: ["/api/leagues", leagueId],
    enabled: !!leagueId,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-600" size={24} />;
      default:
        return <User className="text-gray-500" size={24} />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black";
      case 2:
        return "bg-gray-400 text-black";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
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
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-500">
                {leagueInfo?.name || "Summer Tour Champions"}
              </Badge>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8">
          {/* Top 3 Podium */}
          <Card className="glassmorphism border-gray-600 mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-center mb-8">Top Performers</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-end space-x-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center animate-pulse">
                      <div className="w-24 h-24 bg-gray-700 rounded-full mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : standings?.length >= 3 ? (
                <div className="flex justify-center items-end space-x-8">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Medal className="text-white" size={32} />
                    </div>
                    <p className="font-bold text-lg">{standings[1]?.username}</p>
                    <p className="phish-gold text-xl font-bold">{standings[1]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-gray-400 text-black mt-2">2nd Place</Badge>
                  </div>

                  {/* 1st Place */}
                  <div className="text-center -mt-4">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Crown className="text-white" size={36} />
                    </div>
                    <p className="font-bold text-xl">{standings[0]?.username}</p>
                    <p className="phish-gold text-2xl font-bold">{standings[0]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-yellow-500 text-black mt-2">Champion</Badge>
                  </div>

                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Medal className="text-white" size={32} />
                    </div>
                    <p className="font-bold text-lg">{standings[2]?.username}</p>
                    <p className="phish-gold text-xl font-bold">{standings[2]?.totalPoints?.toLocaleString()}</p>
                    <Badge className="bg-orange-600 text-white mt-2">3rd Place</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 phish-text">
                  <Trophy className="mx-auto mb-4" size={48} />
                  <p>Not enough players for podium display</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                      <div className="h-16 bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : standings?.length > 0 ? (
                <div className="space-y-3">
                  {standings.map((player: any, index: number) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-black hover:bg-opacity-50 cursor-pointer ${
                        index < 3 ? "bg-black bg-opacity-30" : "bg-black bg-opacity-20"
                      }`}
                      onClick={() => setLocation("/profile")}
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
                              <span>+{player.todayPoints || 0} today</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold phish-gold text-xl">{player.totalPoints?.toLocaleString() || 0}</p>
                        <p className="text-sm phish-text">Total Points</p>
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
                    </button> to see standings here!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
