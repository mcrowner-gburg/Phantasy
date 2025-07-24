import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trophy, Calendar, Settings, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Leagues() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my-leagues" | "browse">("my-leagues");
  const [newLeague, setNewLeague] = useState({
    name: "",
    description: "",
    tourId: 1, // Default to active tour
    maxPlayers: 24,
    isPublic: true, // Default to public
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: myLeagues = [], isLoading: isLoadingMyLeagues } = useQuery({
    queryKey: ["/api/leagues", "my", user?.id],
    queryFn: () => fetch(`/api/leagues?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  const { data: publicLeagues = [], isLoading: isLoadingPublic } = useQuery({
    queryKey: ["/api/leagues", "public"],
    queryFn: () => fetch(`/api/leagues?public=true`).then(res => res.json()),
    enabled: activeTab === "browse",
  });

  const { data: tours = [] } = useQuery({
    queryKey: ["/api/tours"],
  });

  const { data: activeTour } = useQuery({
    queryKey: ["/api/tours/active"],
  });

  const createLeagueMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/leagues", {
        ...newLeague,
        ownerId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      setIsCreateOpen(false);
      setNewLeague({ name: "", description: "", tourId: (activeTour as any)?.id || 1, maxPlayers: 24, isPublic: true });
      toast({
        title: "League created successfully!",
        description: "Your new fantasy league is ready for players.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create league",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const joinLeagueMutation = useMutation({
    mutationFn: async (leagueId: number) => {
      return apiRequest("POST", `/api/leagues/${leagueId}/join`, {
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      toast({
        title: "Successfully joined league!",
        description: "You can now draft songs and compete.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join league",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCreateLeague = () => {
    if (!newLeague.name.trim()) {
      toast({
        title: "League name required",
        description: "Please enter a name for your league.",
        variant: "destructive",
      });
      return;
    }
    createLeagueMutation.mutate();
  };

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />
      
      <div className="flex-1 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">My Leagues</h2>
              <p className="phish-text">
                {activeTour ? `Join or create leagues for ${(activeTour as any)?.name}` : "Join or create fantasy leagues"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-black/50 rounded-lg p-1 border border-gray-600">
                <Button
                  variant={activeTab === "my-leagues" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("my-leagues")}
                  className={activeTab === "my-leagues" ? "gradient-button" : "text-white hover:bg-gray-700"}
                >
                  My Leagues
                </Button>
                <Button
                  variant={activeTab === "browse" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("browse")}
                  className={activeTab === "browse" ? "gradient-button" : "text-white hover:bg-gray-700"}
                >
                  Browse
                </Button>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-button px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
                    <Plus className="mr-2" size={16} />
                    Create League
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New League</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">League Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter league name..."
                        className="bg-black border-gray-600 text-white"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Describe your league..."
                        className="bg-black border-gray-600 text-white"
                        value={newLeague.description}
                        onChange={(e) => setNewLeague({ ...newLeague, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPlayers" className="text-white">Max Players</Label>
                      <Input
                        id="maxPlayers"
                        type="number"
                        min="2"
                        max="50"
                        className="bg-black border-gray-600 text-white"
                        value={newLeague.maxPlayers}
                        onChange={(e) => setNewLeague({ ...newLeague, maxPlayers: parseInt(e.target.value) || 24 })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={newLeague.isPublic}
                        onChange={(e) => setNewLeague({ ...newLeague, isPublic: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="isPublic" className="text-white text-sm">
                        Make league public (others can find and join)
                      </Label>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        className="flex-1 gradient-button"
                        onClick={handleCreateLeague}
                        disabled={createLeagueMutation.isPending}
                      >
                        {createLeagueMutation.isPending ? "Creating..." : "Create League"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-600"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8">
          {isLoadingMyLeagues ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : activeTab === "my-leagues" && myLeagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLeagues.map((league: any) => (
                <Card key={league.id} className="glassmorphism border-gray-600 hover:border-green-500 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Trophy className="text-white" size={24} />
                      </div>
                      <Badge className={`${league.draftStatus === "active" ? "bg-green-500 text-black" : "bg-gray-500 text-white"}`}>
                        {league.draftStatus?.toUpperCase() || "ACTIVE"}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                    {league.description && (
                      <p className="phish-text text-sm mb-4">{league.description}</p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center phish-text">
                          <Users className="mr-2" size={16} />
                          Players
                        </div>
                        <span className="text-white font-medium">1/{league.maxPlayers}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center phish-text">
                          <Calendar className="mr-2" size={16} />
                          Created
                        </div>
                        <span className="text-white font-medium">
                          {league.createdAt ? new Date(league.createdAt).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <Button 
                        className="flex-1 gradient-button text-sm"
                        onClick={() => setLocation(`/leaderboard?league=${league.id}`)}
                      >
                        View League
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-gray-600 p-2"
                        onClick={() => {
                          // For now, show a message that settings are coming soon
                          // In the future, this would open a league settings dialog
                          alert("League settings coming soon!");
                        }}
                      >
                        <Settings size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeTab === "browse" ? (
            // Browse Public Leagues Tab
            isLoadingPublic ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-700 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : publicLeagues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicLeagues.map((league: any) => (
                  <Card key={league.id} className="glassmorphism border-gray-600 hover:border-blue-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Trophy className="text-white" size={24} />
                        </div>
                        <Badge className="bg-blue-500 text-white">
                          PUBLIC
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                      {league.description && (
                        <p className="phish-text text-sm mb-4">{league.description}</p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center phish-text">
                            <Users className="mr-2" size={16} />
                            Players
                          </div>
                          <span className="text-white font-medium">{league.memberCount || 0}/{league.maxPlayers}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center phish-text">
                            <Calendar className="mr-2" size={16} />
                            Created
                          </div>
                          <span className="text-white font-medium">
                            {league.createdAt ? new Date(league.createdAt).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-6">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => joinLeagueMutation.mutate(league.id)}
                          disabled={joinLeagueMutation.isPending || (league.memberCount >= league.maxPlayers)}
                        >
                          {joinLeagueMutation.isPending ? "Joining..." : 
                           league.memberCount >= league.maxPlayers ? "Full" : "Join League"}
                        </Button>
                        <Button variant="outline" className="border-gray-600 p-2">
                          <Eye size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Card className="glassmorphism border-gray-600 max-w-md mx-auto">
                  <CardContent className="p-8">
                    <Trophy className="mx-auto mb-4 phish-text" size={64} />
                    <h3 className="text-xl font-bold text-white mb-2">No Public Leagues</h3>
                    <p className="phish-text mb-6">
                      No public leagues are available right now. Create one to get started!
                    </p>
                    <Button
                      className="gradient-button w-full"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="mr-2" size={16} />
                      Create First League
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Card className="glassmorphism border-gray-600 max-w-md mx-auto">
                <CardContent className="p-8">
                  <Users className="mx-auto mb-4 phish-text" size={64} />
                  <h3 className="text-xl font-bold text-white mb-2">No Leagues Yet</h3>
                  <p className="phish-text mb-6">
                    Create your first fantasy Phish league or join one with friends to get started!
                  </p>
                  <Button
                    className="gradient-button w-full"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus className="mr-2" size={16} />
                    Create Your First League
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
