import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trophy, Calendar, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const DEMO_USER_ID = 1;

export default function Leagues() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLeague, setNewLeague] = useState({
    name: "",
    description: "",
    tourId: 1, // Default to active tour
    maxPlayers: 24,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leagues, isLoading } = useQuery({
    queryKey: ["/api/leagues", { userId: DEMO_USER_ID }],
  });

  const { data: tours } = useQuery({
    queryKey: ["/api/tours"],
  });

  const { data: activeTour } = useQuery({
    queryKey: ["/api/tours/active"],
  });

  const createLeagueMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/leagues", {
        ...newLeague,
        ownerId: DEMO_USER_ID,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      setIsCreateOpen(false);
      setNewLeague({ name: "", description: "", tourId: activeTour?.id || 1, maxPlayers: 24 });
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
      
      <div className="flex-1 ml-64 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">My Leagues</h2>
              <p className="phish-text">
                {activeTour ? `Join or create leagues for ${activeTour.name}` : "Join or create fantasy leagues"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : leagues?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league: any) => (
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
                        <span className="text-white font-medium">0/{league.maxPlayers}</span>
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
                      <Button className="flex-1 gradient-button text-sm">
                        View League
                      </Button>
                      <Button variant="outline" className="border-gray-600 p-2">
                        <Settings size={16} />
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
      
      <MobileNavigation />
    </div>
  );
}
