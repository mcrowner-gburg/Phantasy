import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, ArrowUp, Star, Trophy, Music, Calendar, Crown, Users, User } from "lucide-react";
import { format } from "date-fns";

// Mock user ID for demo - in real app this would come from auth
const DEMO_USER_ID = 1;

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", { userId: DEMO_USER_ID }],
  });

  if (isLoading) {
    return (
      <div className="flex">
        <NavigationSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  const { user, tour, league, draftedSongs, recentActivities, recentConcerts, upcomingConcerts, leagueStandings } = dashboardData || {};

  const userRank = leagueStandings?.find((standing: any) => standing.id === user?.id)?.rank || 0;
  const todayPoints = leagueStandings?.find((standing: any) => standing.id === user?.id)?.todayPoints || 0;

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 lg:ml-64">
        {/* Top Header */}
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="phish-text">Welcome back to {tour?.name || "your fantasy Phish league"}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="phish-text hover:text-white cursor-pointer" size={20} />
                <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 p-0 flex items-center justify-center">
                  3
                </Badge>
              </div>
              <Button className="gradient-button px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
                <Plus className="mr-2" size={16} />
                Join League
              </Button>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 pb-20 lg:pb-8">
          {/* Scoring System Info */}
          <Card className="glassmorphism border-gray-600 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Scoring System</h3>
                <Star className="text-orange-500" size={20} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div className="text-center">
                  <div className="font-bold phish-gold text-lg">+1</div>
                  <div className="phish-text">Song Played</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-400 text-lg">+1</div>
                  <div className="phish-text">Set Opener</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-400 text-lg">+1</div>
                  <div className="phish-text">Encore</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="phish-text text-sm font-medium">Total Points</p>
                    <p className="text-2xl font-bold phish-gold">{user?.totalPoints?.toLocaleString() || 0}</p>
                  </div>
                  <div className="w-12 h-12 score-gradient rounded-lg flex items-center justify-center">
                    <Star className="text-white" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUp className="text-green-500 mr-1" size={16} />
                  <span className="text-green-500">+{((todayPoints / (user?.totalPoints || 1)) * 100).toFixed(1)}%</span>
                  <span className="phish-text ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="phish-text text-sm font-medium">League Rank</p>
                    <p className="text-2xl font-bold text-white">#{userRank || "--"}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Trophy className="text-white" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="phish-text">of {leagueStandings?.length || 0} players</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="phish-text text-sm font-medium">Songs Drafted</p>
                    <p className="text-2xl font-bold text-white">{draftedSongs?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Music className="text-white" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="phish-text">{Math.max(0, 20 - (draftedSongs?.length || 0))} slots remaining</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="phish-text text-sm font-medium">Next Show</p>
                    <p className="text-xl font-bold text-white">
                      {upcomingConcerts?.[0] ? format(new Date(upcomingConcerts[0].date), "MMM dd") : "TBA"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="text-white" size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="phish-text">{upcomingConcerts?.[0]?.venue || "No shows scheduled"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="glassmorphism border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recent Shows</h3>
                    <Button variant="link" className="text-green-500 hover:text-green-400 text-sm p-0">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentConcerts?.length > 0 ? (
                      recentConcerts.map((concert: any, index: number) => (
                        <div key={concert.id || index} className="border phish-border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-green-500">{format(new Date(concert.date), "MMM dd, yyyy")}</p>
                              <p className="text-sm phish-text">{format(new Date(concert.date), "h:mm a zzz")}</p>
                            </div>
                            <Badge className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              COMPLETED
                            </Badge>
                          </div>
                          <p className="font-medium">{concert.venue}</p>
                          <p className="text-sm phish-text">{concert.city}, {concert.state}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 phish-text">
                        <Calendar className="mx-auto mb-4" size={48} />
                        <p>No recent shows available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Shows */}
            <div>
              <Card className="glassmorphism border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Upcoming Shows</h3>
                    <Button variant="link" className="text-green-500 hover:text-green-400 text-sm p-0">
                      View Schedule
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {upcomingConcerts?.length > 0 ? (
                      upcomingConcerts.map((concert: any, index: number) => {
                        const isTonight = format(new Date(concert.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                        const isNYE = format(new Date(concert.date), "MM-dd") === "12-31";
                        
                        return (
                          <div key={concert.id || index} className="border phish-border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-green-500">{format(new Date(concert.date), "MMM dd, yyyy")}</p>
                                <p className="text-sm phish-text">{format(new Date(concert.date), "h:mm a zzz")}</p>
                              </div>
                              {isTonight && (
                                <Badge className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                                  TONIGHT
                                </Badge>
                              )}
                              {isNYE && (
                                <Badge className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                                  NYE
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium">{concert.venue}</p>
                            <p className="text-sm phish-text">{concert.city}, {concert.state}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 phish-text">
                        <Calendar className="mx-auto mb-4" size={48} />
                        <p>No upcoming shows scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* My Drafted Songs */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">My Drafted Songs</h3>
                <div className="flex space-x-3">
                  <Button className="gradient-button px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus className="mr-2" size={16} />
                    Draft Song
                  </Button>
                  <Button variant="outline" className="border-gray-600 px-4 py-2 rounded-lg text-sm hover:border-green-500 transition-colors">
                    Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {draftedSongs?.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b phish-border">
                        <th className="pb-3 font-medium phish-text">Song</th>
                        <th className="pb-3 font-medium phish-text">Performance Stats</th>
                        <th className="pb-3 font-medium phish-text">Rarity</th>
                        <th className="pb-3 font-medium phish-text">Points</th>
                        <th className="pb-3 font-medium phish-text">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {draftedSongs.map((draft: any) => (
                        <tr key={draft.id} className="hover:bg-black hover:bg-opacity-30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <Music className="text-white" size={16} />
                              </div>
                              <div>
                                <p className="font-medium">{draft.song?.title}</p>
                                <p className="text-sm phish-text">{draft.song?.category || "Unknown"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 phish-text">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="font-medium text-white">{draft.playedCount || 0}</span>
                                <span>played</span>
                              </div>
                              <div className="flex space-x-4 text-xs">
                                <span className="text-green-400">{draft.openerCount || 0} openers</span>
                                <span className="text-orange-400">{draft.encoreCount || 0} encores</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={`text-xs px-2 py-1 rounded-full font-medium ${
                              (draft.song?.rarityScore || 0) >= 100 ? "bg-red-500 text-white" :
                              (draft.song?.rarityScore || 0) >= 75 ? "bg-orange-500 text-white" :
                              "bg-yellow-500 text-black"
                            }`}>
                              {(draft.song?.rarityScore || 0) >= 100 ? "RARE" :
                               (draft.song?.rarityScore || 0) >= 75 ? "HIGH" : "MED"}
                            </Badge>
                          </td>
                          <td className="py-4 font-bold phish-gold">{draft.points || 0}</td>
                          <td className="py-4">
                            <Badge className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                              ACTIVE
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 phish-text">
                    <Music className="mx-auto mb-4" size={48} />
                    <p className="text-lg mb-2">No songs drafted yet</p>
                    <p>Start building your lineup by drafting your first song!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* League Standings */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">League Standings</h3>
                <div className="flex items-center space-x-2 text-sm phish-text">
                  <Users className="" size={16} />
                  <span>"{league?.name || "No League"}" - {tour?.name || "No Tour"}</span>
                </div>
              </div>

              <div className="space-y-3">
                {leagueStandings?.length > 0 ? (
                  leagueStandings.map((player: any, index: number) => (
                    <div key={player.id} className={`flex items-center justify-between p-4 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors ${
                      player.id === user?.id ? "bg-green-500 bg-opacity-20 border border-green-500" : ""
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-black ${
                          index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-600" : "bg-gray-600"
                        }`}>
                          {player.rank}
                        </div>
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          {index === 0 ? <Crown className="text-yellow-400" size={20} /> : <User className="text-black" size={20} />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.username} {player.id === user?.id && <span className="text-green-500">(You)</span>}
                          </p>
                          <p className="text-sm phish-text">{player.songCount || 0} songs drafted</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold phish-gold text-lg">{player.totalPoints?.toLocaleString() || 0}</p>
                        <p className="text-sm text-green-500">+{player.todayPoints || 0} today</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 phish-text">
                    <Trophy className="mx-auto mb-4" size={48} />
                    <p>No league standings available</p>
                  </div>
                )}
              </div>

              {leagueStandings?.length > 3 && (
                <div className="mt-6 text-center">
                  <Button variant="link" className="text-green-500 hover:text-green-400 text-sm font-medium p-0">
                    View Full Standings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
