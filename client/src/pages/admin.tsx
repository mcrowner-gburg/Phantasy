import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Edit, Calendar, Music, Users, TrendingUp, AlertCircle, Link as LinkIcon } from "lucide-react";
import { LeagueInviteGenerator } from "@/components/admin/league-invite-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConcert, setSelectedConcert] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    songId: 0,
    userId: 0,
    originalPoints: 0,
    adjustedPoints: 0,
    reason: ""
  });

  // Check if user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["/api/auth/user"],
    select: (data: any) => data?.user?.role === "admin",
    enabled: !!user,
  });

  // Get all concerts for admin
  const { data: concerts } = useQuery({
    queryKey: ["/api/admin/concerts"],
    enabled: isAdmin,
  });

  // Get all leagues for admin
  const { data: leagues } = useQuery({
    queryKey: ["/api/admin/leagues"],
    enabled: isAdmin,
  });

  // Get show data when concert and league are selected
  const { data: showData, isLoading: isLoadingShow } = useQuery({
    queryKey: ["/api/admin/shows", selectedConcert, "league", selectedLeague],
    enabled: !!(selectedConcert && selectedLeague && isAdmin),
  });

  // Get point adjustments for selected league/concert
  const { data: adjustments } = useQuery({
    queryKey: ["/api/admin/adjustments/league", selectedLeague],
    queryFn: () => 
      selectedConcert 
        ? fetch(`/api/admin/adjustments/league/${selectedLeague}?concertId=${selectedConcert}`)
        : fetch(`/api/admin/adjustments/league/${selectedLeague}`),
    enabled: !!(selectedLeague && isAdmin),
  });

  // Get league members when league is selected
  const { data: leagueMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["/api/admin/leagues", selectedLeague, "members"],
    enabled: !!(selectedLeague && isAdmin),
  });

  const adjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/adjustments", {
        ...data,
        leagueId: selectedLeague,
        concertId: selectedConcert,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments"] });
      setIsAdjustmentDialogOpen(false);
      setAdjustmentForm({ songId: 0, userId: 0, originalPoints: 0, adjustedPoints: 0, reason: "" });
      toast({
        title: "Point adjustment created",
        description: "Points have been successfully adjusted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to adjust points",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({ userId, leagueId }: { userId: number; leagueId: number }) => {
      return apiRequest("POST", `/api/admin/leagues/${leagueId}/promote/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User promoted to league admin successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/leagues", selectedLeague, "members"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    },
  });

  const calculateOriginalPoints = (performance: any) => {
    let points = 1; // Base point for being played
    if (performance.isOpener) points += 1;
    if (performance.isEncore) points += 1;
    return points;
  };

  const openAdjustmentDialog = (performance: any, drafter: any) => {
    const originalPoints = calculateOriginalPoints(performance);
    setAdjustmentForm({
      songId: performance.songId,
      userId: drafter.userId,
      originalPoints,
      adjustedPoints: originalPoints,
      reason: ""
    });
    setIsAdjustmentDialogOpen(true);
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex min-h-screen">
        <NavigationSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Checking permissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen">
        <NavigationSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <Card className="glassmorphism border-red-600 max-w-md">
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400">You need administrator privileges to access this page.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />
      
      <div className="flex-1 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Admin Panel</h2>
              <p className="phish-text">Manage point adjustments and league administration</p>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-500">
              <Settings className="mr-2" size={16} />
              Administrator
            </Badge>
          </div>
        </header>

        <main className="p-8 space-y-8">
          {/* Show/League Selection */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Select Show & League for Point Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="concert" className="text-white mb-2 block">Concert</Label>
                  <Select onValueChange={(value) => setSelectedConcert(parseInt(value))}>
                    <SelectTrigger className="bg-black border-gray-600 text-white">
                      <SelectValue placeholder="Select a concert..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      {concerts?.map((concert: any) => (
                        <SelectItem key={concert.id} value={concert.id.toString()}>
                          {concert.venue} - {format(new Date(concert.date), "MMM dd, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="league" className="text-white mb-2 block">League</Label>
                  <Select onValueChange={(value) => setSelectedLeague(parseInt(value))}>
                    <SelectTrigger className="bg-black border-gray-600 text-white">
                      <SelectValue placeholder="Select a league..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      {leagues?.map((league: any) => (
                        <SelectItem key={league.id} value={league.id.toString()}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedLeague && (
                <div className="flex gap-4 mb-6">
                  <Button
                    onClick={() => setShowMembers(!showMembers)}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                  >
                    <Users className="mr-2" size={16} />
                    {showMembers ? 'Hide' : 'Show'} League Members
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                        <LinkIcon className="mr-2" size={16} />
                        Invite Generator
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>League Invite Generator</DialogTitle>
                        <DialogDescription>
                          Create shareable invite links for your league
                        </DialogDescription>
                      </DialogHeader>
                      <LeagueInviteGenerator 
                        leagueId={selectedLeague!} 
                        leagueName={leagues?.find(l => l.id === selectedLeague)?.name || "Unknown League"} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* League Members Management */}
          {selectedLeague && showMembers && (
            <Card className="glassmorphism border-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">League Members</h4>
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    {leagueMembers?.length || 0} Members
                  </Badge>
                </div>
                
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-400">Loading members...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-600">
                        <TableHead className="text-gray-300">Username</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300">Total Points</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leagueMembers?.map((member: any) => (
                        <TableRow key={member.id} className="border-gray-600">
                          <TableCell className="text-white font-medium">{member.username}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={member.role === 'admin' ? 'default' : 'outline'}
                              className={member.role === 'admin' ? 'bg-green-600 text-white' : 'border-gray-500 text-gray-300'}
                            >
                              {member.role === 'admin' ? 'League Admin' : 'Member'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {member.joinedAt ? format(new Date(member.joinedAt), "MMM dd, yyyy") : 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-300">{member.totalPoints || 0}</TableCell>
                          <TableCell>
                            {member.role !== 'admin' && (
                              <Button
                                onClick={() => promoteMutation.mutate({ userId: member.id, leagueId: selectedLeague! })}
                                disabled={promoteMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-500 hover:bg-green-500/10"
                              >
                                <TrendingUp className="mr-1" size={14} />
                                Promote
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show Points Grid */}
          {selectedConcert && selectedLeague && (
            <>
              {isLoadingShow ? (
                <Card className="glassmorphism border-gray-600">
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading show data...</p>
                  </CardContent>
                </Card>
              ) : showData?.songPerformances?.length > 0 ? (
                <Card className="glassmorphism border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">
                        {showData.concert.venue} - {format(new Date(showData.concert.date), "MMMM dd, yyyy")}
                      </h3>
                      <Badge className="bg-blue-500 text-white">
                        {showData.songPerformances.length} songs
                      </Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-600">
                            <TableHead className="text-white">Song</TableHead>
                            <TableHead className="text-white">Set</TableHead>
                            <TableHead className="text-white">Position</TableHead>
                            <TableHead className="text-white">Points</TableHead>
                            <TableHead className="text-white">Drafted By</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {showData.songPerformances.map((performance: any) => (
                            <TableRow key={performance.id} className="border-gray-600">
                              <TableCell className="font-medium text-white">
                                {performance.song.title}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                Set {performance.setNumber}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex gap-2">
                                  {performance.isOpener && (
                                    <Badge className="bg-orange-500 text-white text-xs">Opener</Badge>
                                  )}
                                  {performance.isEncore && (
                                    <Badge className="bg-purple-500 text-white text-xs">Encore</Badge>
                                  )}
                                  {!performance.isOpener && !performance.isEncore && (
                                    <span className="text-gray-400">#{performance.position}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-green-400 font-bold">
                                {calculateOriginalPoints(performance)}
                              </TableCell>
                              <TableCell>
                                {performance.draftedBy?.length > 0 ? (
                                  <div className="space-y-1">
                                    {performance.draftedBy.map((drafter: any) => (
                                      <div key={drafter.userId} className="flex items-center space-x-2">
                                        <span className="text-white">{drafter.username}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs"
                                          onClick={() => openAdjustmentDialog(performance, drafter)}
                                        >
                                          <Edit className="mr-1" size={12} />
                                          Adjust
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Not drafted</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                  <TrendingUp className="mr-1" size={12} />
                                  No adjustments
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glassmorphism border-gray-600">
                  <CardContent className="p-12 text-center">
                    <Music className="mx-auto mb-4 text-gray-400" size={64} />
                    <h3 className="text-xl font-bold text-white mb-2">No Setlist Data</h3>
                    <p className="text-gray-400">
                      No song performance data available for this show yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Recent Adjustments */}
          {selectedLeague && adjustments?.length > 0 && (
            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Recent Point Adjustments</h3>
                <div className="space-y-4">
                  {adjustments.map((adjustment: any) => (
                    <div key={adjustment.id} className="bg-black bg-opacity-30 p-4 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{adjustment.song.title}</h4>
                          <p className="text-gray-300">
                            User: {adjustment.user?.username || "Unknown"} | 
                            Points: {adjustment.originalPoints} → {adjustment.adjustedPoints}
                          </p>
                          {adjustment.reason && (
                            <p className="text-gray-400 text-sm mt-1">Reason: {adjustment.reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-500 text-black">
                            {adjustment.adjustedPoints > adjustment.originalPoints ? "+" : ""}
                            {adjustment.adjustedPoints - adjustment.originalPoints}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(adjustment.createdAt), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Point Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Adjust Points</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manually adjust the points awarded for this song performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Original Points</Label>
                <Input
                  type="number"
                  value={adjustmentForm.originalPoints}
                  disabled
                  className="bg-gray-800 border-gray-600 text-gray-400"
                />
              </div>
              <div>
                <Label className="text-white">Adjusted Points</Label>
                <Input
                  type="number"
                  value={adjustmentForm.adjustedPoints}
                  onChange={(e) => setAdjustmentForm({
                    ...adjustmentForm,
                    adjustedPoints: parseInt(e.target.value) || 0
                  })}
                  className="bg-black border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Reason for Adjustment</Label>
              <Textarea
                placeholder="Explain why this adjustment is being made..."
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({
                  ...adjustmentForm,
                  reason: e.target.value
                })}
                className="bg-black border-gray-600 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAdjustmentDialogOpen(false)}
                className="border-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => adjustmentMutation.mutate(adjustmentForm)}
                disabled={adjustmentMutation.isPending}
                className="gradient-button"
              >
                {adjustmentMutation.isPending ? "Saving..." : "Save Adjustment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}