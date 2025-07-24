import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Music, Search, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Draft() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use the first league as default for now
  const { data: leagues } = useQuery({
    queryKey: ["/api/leagues"],
  });
  
  const currentLeague = leagues?.[0];

  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ["/api/songs"],
  });

  const { data: draftedSongs } = useQuery({
    queryKey: ["/api/drafted-songs", { userId: user?.id, leagueId: currentLeague?.id }],
    enabled: !!user?.id && !!currentLeague?.id,
  });

  const draftMutation = useMutation({
    mutationFn: async (songId: number) => {
      return apiRequest("POST", "/api/draft", {
        userId: user?.id,
        leagueId: currentLeague?.id,
        songId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafted-songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Song drafted successfully!",
        description: "The song has been added to your lineup.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to draft song",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const filteredSongs = songs?.filter((song: any) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const draftedSongIds = new Set(draftedSongs?.map((draft: any) => draft.songId) || []);

  // Simplified draft interface - no rarity calculations needed

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />
      
      <div className="flex-1 ml-64 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Song Draft</h2>
              <p className="phish-text">Build your fantasy setlist by drafting songs</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-500">
                {draftedSongs?.length || 0}/10 Songs Drafted
              </Badge>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8">
          {/* Search Bar */}
          <Card className="glassmorphism border-gray-600 mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 phish-text" size={20} />
                <Input
                  placeholder="Search for songs to draft..."
                  className="pl-10 bg-black border-gray-600 text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Songs Grid */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Available Songs</h3>
                <p className="phish-text text-sm">{filteredSongs.length} songs available</p>
              </div>

              {songsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="text-center py-12 phish-text">
                  <Music className="mx-auto mb-4" size={48} />
                  <p className="text-lg mb-2">No songs found</p>
                  <p>Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSongs.map((song: any) => {
                    const isDrafted = draftedSongIds.has(song.id);
                    const canDraft = !isDrafted && (draftedSongs?.length || 0) < 10;

                    return (
                      <Card
                        key={song.id}
                        className={`bg-black bg-opacity-50 border transition-all hover:border-green-500 ${
                          isDrafted ? "border-green-500 bg-green-500 bg-opacity-20" : "border-gray-600"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <Music className="text-white" size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{song.title}</h4>
                                <p className="text-sm phish-text">{song.category || "Unknown"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="phish-text">Plays (24 months):</span>
                              <span className="text-white font-semibold">{song.totalPlays || 0}</span>
                            </div>
                          </div>

                          <Button
                            className={`w-full ${
                              isDrafted
                                ? "bg-green-500 text-black hover:bg-green-600"
                                : canDraft
                                ? "gradient-button hover:opacity-90"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                            }`}
                            onClick={() => canDraft && draftMutation.mutate(song.id)}
                            disabled={!canDraft || draftMutation.isPending}
                          >
                            {isDrafted ? (
                              <>
                                <Check className="mr-2" size={16} />
                                Drafted
                              </>
                            ) : canDraft ? (
                              <>
                                <Plus className="mr-2" size={16} />
                                Draft Song
                              </>
                            ) : (
                              "Roster Full"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
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
