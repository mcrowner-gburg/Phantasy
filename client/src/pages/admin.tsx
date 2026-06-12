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
import { Settings, Edit, Music, Users, TrendingUp, AlertCircle, Link as LinkIcon } from "lucide-react";
import { LeagueInviteGenerator } from "@/components/admin/league-invite-generator";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { LeagueMembersSection } from "@/components/admin/LeagueMembersSection";
import { PicksManagerSection } from "@/components/admin/PicksManagerSection";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";

export default function Admin() {
  const { user: currentUser } = useAuth();
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

  // Check if user is admin (admin or superadmin)
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["/api/auth/user"],
    select: (data: any) => data?.user?.role === "admin" || data?.user?.role === "superadmin",
    enabled: !!currentUser,
  });

  // Check if user is super admin (can manage all users)
  const { data: isSuperAdmin } = useQuery({
    queryKey: ["/api/auth/user"],
    select: (data: any) => data?.user?.role === "superadmin",
    enabled: !!currentUser,
  });

  // Get all concerts for admin
  const { data: concerts } = useQuery({
    queryKey: ["/api/admin/concerts"],
    enabled: isAdmin,
  }) as { data: any[] };

  // Leagues where current user can manage points (owner, league admin, or global admin)
  const { data: leagues } = useQuery({
    queryKey: ["/api/admin/my-leagues"],
    enabled: !!currentUser,
  }) as { data: any[] };

  // Get show data when concert and league are selected
  const { data: showData, isLoading: isLoadingShow } = useQuery({
    queryKey: ["/api/admin/shows", selectedConcert, "league", selectedLeague],
    enabled: !!(selectedConcert && selectedLeague && isAdmin),
  }) as { data: any; isLoading: boolean };

  // Get point adjustments for selected league/concert
  const { data: adjustments } = useQuery({
    queryKey: ["/api/admin/adjustments/league", selectedLeague, selectedConcert],
    queryFn: async () => {
      const url = selectedConcert
        ? `/api/admin/adjustments/league/${selectedLeague}?concertId=${selectedConcert}`
        : `/api/admin/adjustments/league/${selectedLeague}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch adjustments');
      const data = await response.json();
      const adjustmentsArray = Array.isArray(data) ? data : [];

      // One record per (songId, userId, concertId) — keep highest id if somehow duplicated
      const adjDedupeMap = new Map<string, any>();
      for (const a of adjustmentsArray) {
        const key = `${a.songId}-${a.userId}-${a.concertId}`;
        if (!adjDedupeMap.has(key) || a.id > adjDedupeMap.get(key).id) adjDedupeMap.set(key, a);
      }
      const uniqueAdjustments = Array.from(adjDedupeMap.values());

      return uniqueAdjustments;
    },
    enabled: !!(selectedLeague && isAdmin),
  }) as { data: any[] };

  const adjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/adjustments", {
        ...data,
        leagueId: selectedLeague,
        concertId: selectedConcert,
      });
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments/league", selectedLeague] });
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${selectedLeague}/standings`] });

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

  const scoreLeagueMutation = useMutation({
    mutationFn: async (leagueId: number) => {
      const res = await apiRequest("POST", `/api/leagues/${leagueId}/score`, undefined);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${selectedLeague}/standings`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments/league", selectedLeague] });
      const unmapped = data.unmappedSongIds?.length ? ` ⚠️ ${data.unmappedSongIds.length} unmapped.` : "";
      const adjs = data.adjustmentsApplied?.length
        ? ` Overrides applied: ${data.adjustmentsApplied.map((a: any) => `${a.username}/${a.song} ${a.base}→${a.override}`).join(", ")}`
        : " No overrides applied.";
      const diag = data.adjDiag?.length ? ` [adj diag: ${data.adjDiag.join(" | ")}]` : " [no adj records]";
      toast({ title: "Scores recalculated", description: `${data.shows} shows, ${data.points} pts.${unmapped}${adjs}${diag}` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to recalculate scores", description: error.message, variant: "destructive" });
    },
  });

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const calculateOriginalPoints = (performance: any) => {
    let points = 1; // Base point for being played
    if (performance.isSetOpener) points += 1; // First song of any set
    if (performance.isEncore) points += 1;    // Encore song
    const mins = (performance.durationSeconds || 0) / 60;
    if (mins >= 20) points += 1; // 20+ min bonus
    if (mins >= 30) points += 1; // 30+ min bonus
    if (mins >= 40) points += 1; // 40+ min bonus
    return points;
  }

  // Find the total-override adjustment for a song/user (one record covers all playings)
  const getAdjustmentInfo = (performance: any, userId: number) => {
    if (!adjustments || !Array.isArray(adjustments)) return null;
    return adjustments.find((adj: any) =>
      Number(adj.songId) === Number(performance.song.id) &&
      Number(adj.userId) === Number(userId) &&
      Number(adj.concertId) === Number(selectedConcert)
    ) ?? null;
  };

  // For display: show adjusted total on first occurrence row, 0 on subsequent rows
  const calculateAdjustedPoints = (performance: any, userId: number) => {
    const adj = getAdjustmentInfo(performance, userId);
    if (!adj) return calculateOriginalPoints(performance);
    // Total override applies once (first occurrence); additional occurrences show 0
    return (performance.occurrence ?? 1) === 1 ? adj.adjustedPoints : 0;
  };

  const openAdjustmentDialog = (performance: any, drafter: any) => {
    // originalPoints = sum of base pts across all occurrences of this song at the show
    // For simplicity show the per-occurrence base; admin sets the total they want
    const originalPoints = calculateOriginalPoints(performance);
    setAdjustmentForm({
      songId: performance.song?.id || performance.songId,
      userId: drafter.userId,
      originalPoints,
      adjustedPoints: getAdjustmentInfo(performance, drafter.userId)?.adjustedPoints ?? originalPoints,
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

  // Allow access if global admin OR if they have at least one manageable league
  const hasLeagueAccess = leagues && (leagues as any[]).length > 0;
  if (!isAdmin && !hasLeagueAccess) {
    return (
      <div className="flex min-h-screen">
        <NavigationSidebar />
        <div className="flex-1 lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <Card className="glassmorphism border-red-600 max-w-md">
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-gray-400">You need administrator privileges or league ownership to access this page.</p>
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

        <main className="p-8 pb-20 lg:pb-8 space-y-8">
          {/* User Management Section - Super Admin Only */}
          {isSuperAdmin && <UserManagementSection currentUser={currentUser} />}

          {/* Show/League Selection - Available to all admins */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Select Show & League for Point Management</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:border-blue-500 text-xs"
                  onClick={async () => {
                    try {
                      await apiRequest("POST", "/api/admin/refresh-shows");
                      queryClient.invalidateQueries({ queryKey: ["/api/admin/concerts"] });
                      toast({ title: "Shows cache refreshed", description: "Show list updated from Phish.net." });
                    } catch {
                      toast({ title: "Refresh failed", variant: "destructive" });
                    }
                  }}
                >
                  Refresh Shows
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                <div>
                  <Label htmlFor="concert" className="text-white mb-2 block">Concert</Label>
                  <Select onValueChange={(value) => setSelectedConcert(parseInt(value))}>
                    <SelectTrigger className="bg-black border-gray-600 text-white">
                      <SelectValue placeholder="Select a concert..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      {concerts?.map((concert: any) => (
                        <SelectItem key={concert.id} value={concert.id.toString()}>
                          {concert.venue} - {format(parseISO(String(concert.date).substring(0, 10)), "MMM dd, yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedLeague && (
                <div className="flex gap-4 mb-6 flex-wrap">
                  <Button
                    onClick={() => setShowMembers(!showMembers)}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                  >
                    <Users className="mr-2" size={16} />
                    {showMembers ? 'Hide' : 'Show'} League Members
                  </Button>

                  <Button
                    onClick={() => scoreLeagueMutation.mutate(selectedLeague)}
                    disabled={scoreLeagueMutation.isPending}
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <TrendingUp className="mr-2" size={16} />
                    {scoreLeagueMutation.isPending ? "Calculating..." : "Recalculate Scores"}
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
            <LeagueMembersSection selectedLeague={selectedLeague} />
          )}

          {/* Draft Picks Management */}
          {selectedLeague && (
            <PicksManagerSection selectedLeague={selectedLeague} />
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
                        {showData.concert.venue} - {format(parseISO(String(showData.concert.date).substring(0, 10)), "MMMM dd, yyyy")}
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
                                {performance.occurrence > 1 && (
                                  <span className="ml-1 text-xs text-yellow-400 font-normal">
                                    ({ordinal(performance.occurrence)} playing)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                Set {performance.setNumber}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                  {performance.isSetOpener && (
                                    <Badge className="bg-orange-500 text-white text-xs">Set Opener</Badge>
                                  )}
                                  {performance.isEncore && (
                                    <Badge className="bg-purple-500 text-white text-xs">Encore</Badge>
                                  )}
                                  {performance.durationSeconds >= 1200 && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      {Math.floor(performance.durationSeconds / 60)}m
                                    </Badge>
                                  )}
                                  {!performance.isSetOpener && !performance.isEncore && (
                                    <span className="text-gray-400">#{performance.position}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {performance.draftedBy?.map((drafter: any) => {
                                  const originalPoints = calculateOriginalPoints(performance);
                                  const adjustedPoints = calculateAdjustedPoints(performance, drafter.userId);
                                  const hasAdjustment = originalPoints !== adjustedPoints;

                                  return (
                                    <div key={drafter.userId} className="flex items-center gap-2 mb-1">
                                      <span className="text-white text-sm">{drafter.username}:</span>
                                      {hasAdjustment ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-gray-400 line-through text-sm">{originalPoints}</span>
                                          <span className="text-green-400 font-bold">{adjustedPoints}</span>
                                        </div>
                                      ) : (
                                        <span className="text-green-400 font-bold">{originalPoints}</span>
                                      )}
                                    </div>
                                  );
                                })}
                                {!performance.draftedBy?.length && (
                                  <span className="text-gray-500">-</span>
                                )}
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
                                {performance.draftedBy?.map((drafter: any) => {
                                  const adjustmentInfo = getAdjustmentInfo(performance, drafter.userId);

                                  return (
                                    <div key={drafter.userId} className="mb-1">
                                      {adjustmentInfo ? (
                                        <div className="space-y-1">
                                          <Badge className="bg-blue-500 text-white text-xs">
                                            <TrendingUp className="mr-1" size={10} />
                                            Adjusted by {adjustmentInfo.adjustedByUser?.username || 'Admin'}
                                          </Badge>
                                          {adjustmentInfo.reason && (
                                            <div className="text-xs text-gray-400 max-w-32 truncate" title={adjustmentInfo.reason}>
                                              {adjustmentInfo.reason}
                                            </div>
                                          )}
                                          <div className="text-xs text-gray-400">
                                            {adjustmentInfo.originalPoints} → {adjustmentInfo.adjustedPoints} pts
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 px-1 text-red-400 hover:text-red-300 text-xs"
                                            onClick={async () => {
                                              await fetch("/api/admin/adjustments/by-song", {
                                                method: "DELETE",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  leagueId: selectedLeague,
                                                  concertId: selectedConcert,
                                                  songId: adjustmentInfo.songId,
                                                  userId: drafter.userId,
                                                }),
                                              });
                                              queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments/league", selectedLeague] });
                                              toast({ title: "Adjustment deleted", description: "Re-score to apply base scoring." });
                                            }}
                                          >
                                            Delete override
                                          </Button>
                                        </div>
                                      ) : (
                                        <Badge variant="outline" className="border-gray-500 text-gray-400 text-xs">
                                          Original
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                                {!performance.draftedBy?.length && (
                                  <span className="text-gray-500">-</span>
                                )}
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
                          <h4 className="font-bold text-white">{adjustment.song?.title ?? `Song #${adjustment.songId}`}</h4>
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
              Set total points for all playings of this song at this show.
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adjustmentMutation.mutate(adjustmentForm);
                    }
                  }}
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
