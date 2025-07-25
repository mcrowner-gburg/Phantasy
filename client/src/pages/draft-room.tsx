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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get draft status
  const { data: league, isLoading: leagueLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-status`],
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  // Get draft order
  const { data: draftOrder } = useQuery({
    queryKey: [`/api/leagues/${leagueId}/draft-order`],
  });

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

  // Timer effect for pick countdown
  useEffect(() => {
    if (league?.draftStatus === "active" && league?.currentPlayer === user?.id) {
      setTimeRemaining(league?.pickTimeLimit || 90);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-pick logic could go here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [league?.currentPlayer, league?.draftStatus, league?.pickTimeLimit, user?.id]);

  const filteredSongs = songs?.filter((song: any) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isMyTurn = league?.currentPlayer === user?.id;
  const isOwner = league?.ownerId === user?.id;
  const currentPlayer = draftOrder?.find(member => member.userId === league?.currentPlayer);

  if (leagueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <div className="lg:ml-64 p-4">
          <div className="text-center">Loading draft room...</div>
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

              {league?.draftStatus === "scheduled" && isOwner && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={() => startDraftMutation.mutate()}
                    disabled={startDraftMutation.isPending}
                    size="lg"
                  >
                    Start Draft Now
                  </Button>
                </div>
              )}

              {league?.draftStatus === "active" && (
                <div className="mt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {isMyTurn ? "Your Turn!" : `${currentPlayer?.user.username}'s Turn`}
                    </div>
                    {isMyTurn && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Timer className="h-4 w-4" />
                        <span className={`font-mono text-lg ${timeRemaining <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
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
                              {song.category} • {song.totalPlays} plays (24 months)
                            </div>
                          </div>
                          {isMyTurn && league?.draftStatus === "active" && (
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
                    Draft Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {draftOrder?.map((member: any, index: number) => (
                      <div
                        key={member.userId}
                        className={`flex items-center gap-2 p-2 rounded ${
                          member.userId === league?.currentPlayer 
                            ? 'bg-blue-100 dark:bg-blue-900' 
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{member.user.username}</div>
                          {member.userId === user?.id && (
                            <div className="text-xs text-blue-600">You</div>
                          )}
                        </div>
                        {member.userId === league?.currentPlayer && (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Picks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Picks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {draftPicks?.slice(-10).reverse().map((pick: any) => (
                      <div key={pick.id} className="text-sm">
                        <div className="font-medium">{pick.song.title}</div>
                        <div className="text-gray-600">
                          Pick #{pick.pickNumber} - {pick.user.username}
                        </div>
                      </div>
                    ))}
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