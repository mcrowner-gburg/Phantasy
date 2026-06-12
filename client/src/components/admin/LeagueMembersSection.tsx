import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Search, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// League member list with promote/remove and an add-member search dialog.
export function LeagueMembersSection({ selectedLeague }: { selectedLeague: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  const { data: leagueMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["/api/admin/leagues", selectedLeague, "members"],
    enabled: !!selectedLeague,
  }) as { data: any[]; isLoading: boolean };

  // User search for the add-member dialog
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users", ""],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: addMemberDialogOpen,
  }) as { data: any[] };

  const removeMemberMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/leagues/${selectedLeague}/members/${targetUserId}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leagues", selectedLeague, "members"] });
      toast({ title: "Member removed from league" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      const res = await apiRequest("POST", `/api/admin/leagues/${selectedLeague}/members`, { userId: targetUserId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leagues", selectedLeague, "members"] });
      setAddMemberDialogOpen(false);
      setAddMemberSearch("");
      toast({ title: "Member added", description: `${data?.username} added to league` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add member", description: error.message, variant: "destructive" });
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

  return (
    <>
      <Card className="glassmorphism border-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-bold text-white">League Members</h4>
              <Badge variant="outline" className="border-blue-500 text-blue-500">
                {leagueMembers?.length || 0} Members
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-500/10"
              onClick={() => { setAddMemberSearch(""); setAddMemberDialogOpen(true); }}
            >
              <UserPlus className="mr-1" size={14} />
              Add Member
            </Button>
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
                      <div className="flex gap-2">
                        {member.role !== 'admin' && (
                          <Button
                            onClick={() => promoteMutation.mutate({ userId: member.userId, leagueId: selectedLeague })}
                            disabled={promoteMutation.isPending}
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-500 hover:bg-green-500/10"
                          >
                            <TrendingUp className="mr-1" size={14} />
                            Promote
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            if (confirm(`Remove ${member.username} from this league?`)) {
                              removeMemberMutation.mutate(member.userId);
                            }
                          }}
                          disabled={removeMemberMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={(open) => { if (!open) { setAddMemberDialogOpen(false); setAddMemberSearch(""); } }}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Add Member to League</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search for a user by username or email and add them to this league.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-10 bg-black border-gray-600"
                placeholder="Search by username or email…"
                value={addMemberSearch}
                onChange={(e) => setAddMemberSearch(e.target.value)}
                autoFocus
              />
            </div>

            {addMemberSearch.length >= 2 && (
              <div className="max-h-60 overflow-y-auto border border-gray-700 rounded bg-black/50 divide-y divide-gray-800">
                {(users ?? [])
                  .filter((u: any) =>
                    u.username?.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(addMemberSearch.toLowerCase())
                  )
                  .slice(0, 20)
                  .map((u: any) => {
                    const alreadyMember = (leagueMembers ?? []).some((m: any) => m.userId === u.id);
                    return (
                      <div key={u.id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <span className="text-white text-sm font-medium">{u.username}</span>
                          <span className="text-gray-400 text-xs ml-2">{u.email}</span>
                        </div>
                        {alreadyMember ? (
                          <Badge variant="outline" className="border-gray-500 text-gray-500 text-xs">Already member</Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="gradient-button text-xs"
                            disabled={addMemberMutation.isPending}
                            onClick={() => addMemberMutation.mutate(u.id)}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                {(users ?? []).filter((u: any) =>
                  u.username?.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
                  u.email?.toLowerCase().includes(addMemberSearch.toLowerCase())
                ).length === 0 && (
                  <p className="px-3 py-4 text-gray-500 text-sm text-center">No users found</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" className="border-gray-600 text-white" onClick={() => { setAddMemberDialogOpen(false); setAddMemberSearch(""); }}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
