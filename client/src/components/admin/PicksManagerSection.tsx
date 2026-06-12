import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music, Search, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Per-player draft pick management: add, delete, or review picks for any
// player in the selected league.
export function PicksManagerSection({ selectedLeague }: { selectedLeague: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPicksManager, setShowPicksManager] = useState(false);
  const [addPickDialog, setAddPickDialog] = useState<{ open: boolean; userId: number; username: string }>({ open: false, userId: 0, username: "" });
  const [songSearch, setSongSearch] = useState("");
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [selectedSongTitle, setSelectedSongTitle] = useState("");

  const { data: leagueMembers } = useQuery({
    queryKey: ["/api/admin/leagues", selectedLeague, "members"],
    enabled: !!selectedLeague,
  }) as { data: any[] };

  const { data: leagueDraftPicks, isLoading: isLoadingPicks } = useQuery({
    queryKey: [`/api/leagues/${selectedLeague}/draft-picks`],
    enabled: !!selectedLeague && showPicksManager,
    refetchInterval: false,
    staleTime: 0,
  }) as { data: any[], isLoading: boolean };

  // All songs (for add-pick search — no leagueId filter so admin sees all songs)
  const { data: allSongs } = useQuery({
    queryKey: ["/api/songs"],
    enabled: addPickDialog.open,
    refetchInterval: false,
  }) as { data: any[] };

  const deletePickMutation = useMutation({
    mutationFn: async (pickId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/picks/${pickId}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${selectedLeague}/draft-picks`] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({ title: "Pick deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete pick", description: error.message, variant: "destructive" });
    },
  });

  const addPickMutation = useMutation({
    mutationFn: async ({ userId, songId }: { userId: number; songId: number }) => {
      const res = await apiRequest("POST", `/api/admin/leagues/${selectedLeague}/add-pick`, { userId, songId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${selectedLeague}/draft-picks`] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      setAddPickDialog({ open: false, userId: 0, username: "" });
      setSongSearch("");
      setSelectedSongId(null);
      setSelectedSongTitle("");
      toast({ title: "Pick added", description: `Added: ${data?.songTitle}` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add pick", description: error.message, variant: "destructive" });
    },
  });

  return (
    <>
      <Card className="glassmorphism border-orange-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-white">Draft Picks Management</h4>
              <p className="text-sm text-gray-400">Add, delete, or review picks for any player in this league</p>
            </div>
            <Button
              onClick={() => setShowPicksManager(!showPicksManager)}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
            >
              <Music className="mr-2" size={16} />
              {showPicksManager ? "Hide" : "Manage"} Picks
            </Button>
          </div>

          {showPicksManager && (
            isLoadingPicks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                <span className="ml-2 text-gray-400">Loading picks…</span>
              </div>
            ) : (() => {
              // Group picks by userId
              const picks: any[] = Array.isArray(leagueDraftPicks) ? leagueDraftPicks : [];
              const byUser: Record<number, { username: string; picks: any[] }> = {};
              for (const pick of picks) {
                const uid = pick.userId;
                if (!byUser[uid]) byUser[uid] = { username: pick.user?.username ?? `User ${uid}`, picks: [] };
                byUser[uid].picks.push(pick);
              }
              const members: any[] = Array.isArray(leagueMembers) ? leagueMembers : [];
              // Also include members with 0 picks
              for (const m of members) {
                if (!byUser[m.userId]) byUser[m.userId] = { username: m.username ?? `User ${m.userId}`, picks: [] };
              }

              return (
                <div className="space-y-6">
                  {Object.entries(byUser).map(([uid, { username, picks: userPicks }]) => (
                    <div key={uid} className="bg-black/30 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{username}</span>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            {userPicks.length} picks
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-500/10"
                          onClick={() => {
                            setSongSearch("");
                            setSelectedSongId(null);
                            setSelectedSongTitle("");
                            setAddPickDialog({ open: true, userId: parseInt(uid), username });
                          }}
                        >
                          <Plus className="mr-1" size={14} />
                          Add Pick
                        </Button>
                      </div>

                      {userPicks.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No picks yet</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-gray-400 w-16">#</TableHead>
                              <TableHead className="text-gray-400">Song</TableHead>
                              <TableHead className="text-gray-400 w-20">Round</TableHead>
                              <TableHead className="text-gray-400 w-20">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userPicks.map((pick: any) => (
                              <TableRow key={pick.id} className="border-gray-700">
                                <TableCell className="text-gray-400 text-sm">{pick.pickNumber}</TableCell>
                                <TableCell className="text-white font-medium">{pick.song?.title ?? `Song #${pick.songId}`}</TableCell>
                                <TableCell className="text-gray-400 text-sm">R{pick.round ?? pick.draftRound ?? '?'}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                                    disabled={deletePickMutation.isPending}
                                    onClick={() => {
                                      if (confirm(`Delete pick #${pick.pickNumber}: "${pick.song?.title}"?`)) {
                                        deletePickMutation.mutate(pick.id);
                                      }
                                    }}
                                  >
                                    <X size={14} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  ))}

                  {Object.keys(byUser).length === 0 && (
                    <p className="text-gray-400 text-center py-4">No members or picks yet. Select a league with an active draft.</p>
                  )}
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

      {/* Add Pick Dialog */}
      <Dialog open={addPickDialog.open} onOpenChange={(open) => { if (!open) setAddPickDialog({ open: false, userId: 0, username: "" }); }}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Add Pick for {addPickDialog.username}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search for a song and add it as a manual pick.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-10 bg-black border-gray-600"
                placeholder="Search songs…"
                value={songSearch}
                onChange={(e) => { setSongSearch(e.target.value); setSelectedSongId(null); setSelectedSongTitle(""); }}
                autoFocus
              />
            </div>

            {selectedSongId && (
              <div className="flex items-center gap-2 p-2 bg-green-900/30 border border-green-700 rounded">
                <Music size={14} className="text-green-400" />
                <span className="text-green-300 text-sm font-medium">{selectedSongTitle}</span>
                <button onClick={() => { setSelectedSongId(null); setSelectedSongTitle(""); }} className="ml-auto text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {songSearch && !selectedSongId && (
              <div className="max-h-60 overflow-y-auto border border-gray-700 rounded bg-black/50 divide-y divide-gray-800">
                {(allSongs ?? [])
                  .filter((s: any) => s.title.toLowerCase().includes(songSearch.toLowerCase()))
                  .slice(0, 30)
                  .map((s: any) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-3 py-2 text-white hover:bg-gray-800 text-sm"
                      onClick={() => { setSelectedSongId(s.id); setSelectedSongTitle(s.title); setSongSearch(""); }}
                    >
                      {s.title}
                    </button>
                  ))}
                {(allSongs ?? []).filter((s: any) => s.title.toLowerCase().includes(songSearch.toLowerCase())).length === 0 && (
                  <p className="px-3 py-4 text-gray-500 text-sm text-center">No songs found</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="border-gray-600 text-white" onClick={() => setAddPickDialog({ open: false, userId: 0, username: "" })}>
                Cancel
              </Button>
              <Button
                className="gradient-button"
                disabled={!selectedSongId || addPickMutation.isPending}
                onClick={() => {
                  if (selectedSongId) {
                    addPickMutation.mutate({ userId: addPickDialog.userId, songId: selectedSongId });
                  }
                }}
              >
                {addPickMutation.isPending ? "Adding…" : "Add Pick"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
