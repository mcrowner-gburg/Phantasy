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
import { Settings, Edit, Calendar, Music, Users, TrendingUp, AlertCircle, Link as LinkIcon, Search, UserPlus, Trash2, Shield, Plus, X } from "lucide-react";
import { LeagueInviteGenerator } from "@/components/admin/league-invite-generator";
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
  const [showPicksManager, setShowPicksManager] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [addPickDialog, setAddPickDialog] = useState<{ open: boolean; userId: number; username: string }>({ open: false, userId: 0, username: "" });
  const [songSearch, setSongSearch] = useState("");
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [selectedSongTitle, setSelectedSongTitle] = useState("");
  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    songId: 0,
    userId: 0,
    originalPoints: 0,
    adjustedPoints: 0,
    reason: ""
  });
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user"
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
  });

  // Leagues where current user can manage points (owner, league admin, or global admin)
  const { data: leagues } = useQuery({
    queryKey: ["/api/admin/my-leagues"],
    enabled: !!currentUser,
  });

  // Get all users for super admin only
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
        : "/api/admin/users";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: isAdmin && (showUserManagement || addMemberDialogOpen),
  });

  // Get show data when concert and league are selected
  const { data: showData, isLoading: isLoadingShow } = useQuery({
    queryKey: ["/api/admin/shows", selectedConcert, "league", selectedLeague],
    enabled: !!(selectedConcert && selectedLeague && isAdmin),
  });

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
      
      // Remove duplicates based on unique combination of songId, userId, concertId
      const uniqueAdjustments = adjustmentsArray.filter((adjustment, index, self) => 
        index === self.findIndex(a => 
          a.songId === adjustment.songId && 
          a.userId === adjustment.userId && 
          a.concertId === adjustment.concertId
        )
      );
      
      return uniqueAdjustments;
    },
    enabled: !!(selectedLeague && isAdmin),
  });

  // Get league members when league is selected
  const { data: leagueMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["/api/admin/leagues", selectedLeague, "members"],
    enabled: !!(selectedLeague && isAdmin),
  });

  // Get all draft picks for selected league (for picks manager)
  const { data: leagueDraftPicks, isLoading: isLoadingPicks } = useQuery({
    queryKey: [`/api/leagues/${selectedLeague}/draft-picks`],
    enabled: !!(selectedLeague && isAdmin && showPicksManager),
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

  // User management mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateUserDialogOpen(false);
      setUserForm({ username: "", email: "", phoneNumber: "", password: "", role: "user" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: any }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
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
      const unmapped = data.unmappedSongIds?.length ? ` ⚠️ ${data.unmappedSongIds.length} unmapped song IDs.` : "";
      const perUser = data.perUser ? ` Players: ${Object.entries(data.perUser).map(([u, p]) => `${u}=${p}`).join(", ")}` : "";
      toast({ title: "Scores recalculated", description: `${data.shows} shows scored, ${data.points} total points.${unmapped}${perUser}` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to recalculate scores", description: error.message, variant: "destructive" });
    },
  });

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

  // Calculate adjusted points for a specific user and song performance
  const calculateAdjustedPoints = (performance: any, userId: number) => {
    if (!adjustments || !Array.isArray(adjustments)) return calculateOriginalPoints(performance);
    
    const adjustment = adjustments.find((adj: any) => 
      Number(adj.songId) === Number(performance.song.id) && 
      Number(adj.userId) === Number(userId) &&
      Number(adj.concertId) === Number(selectedConcert)
    );
    
    return adjustment ? adjustment.adjustedPoints : calculateOriginalPoints(performance);
  }

  // Get adjustment info for a specific user and song performance
  const getAdjustmentInfo = (performance: any, userId: number) => {
    if (!adjustments || !Array.isArray(adjustments)) return null;
    
    return adjustments.find((adj: any) => 
      Number(adj.songId) === Number(performance.song.id) && 
      Number(adj.userId) === Number(userId) &&
      Number(adj.concertId) === Number(selectedConcert)
    );
  };

  const openAdjustmentDialog = (performance: any, drafter: any) => {
    const originalPoints = calculateOriginalPoints(performance);
    setAdjustmentForm({
      songId: performance.song?.id || performance.songId,
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

        <main className="p-8 space-y-8">
          {/* User Management Section - Super Admin Only */}
          {isSuperAdmin && (
          <Card className="glassmorphism border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">User Management</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowUserManagement(!showUserManagement)}
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
                  >
                    <Users className="mr-2" size={16} />
                    {showUserManagement ? 'Hide' : 'Manage'} Users
                  </Button>
                  
                  {showUserManagement && (
                    <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                          <UserPlus className="mr-2" size={16} />
                          Create User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-600">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create New User</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Add a new user to the system with basic information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Username</Label>
                            <Input
                              value={userForm.username}
                              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                              className="bg-black border-gray-600 text-white"
                              placeholder="Enter username"
                              data-testid="input-username"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Email</Label>
                            <Input
                              type="email"
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              className="bg-black border-gray-600 text-white"
                              placeholder="Enter email"
                              data-testid="input-email"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Phone Number</Label>
                            <Input
                              value={userForm.phoneNumber}
                              onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                              className="bg-black border-gray-600 text-white"
                              placeholder="Enter phone number"
                              data-testid="input-phone"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Password</Label>
                            <Input
                              type="password"
                              value={userForm.password}
                              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                              className="bg-black border-gray-600 text-white"
                              placeholder="Enter password"
                              data-testid="input-password"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Role</Label>
                            <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                              <SelectTrigger className="bg-black border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-600">
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateUserDialogOpen(false)}
                              className="border-gray-600 text-white"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => createUserMutation.mutate(userForm)}
                              disabled={createUserMutation.isPending}
                              className="gradient-button"
                              data-testid="button-create-user"
                            >
                              {createUserMutation.isPending ? "Creating..." : "Create User"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {showUserManagement && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        placeholder="Search users by username or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black border-gray-600 text-white"
                        data-testid="input-search-users"
                      />
                    </div>
                  </div>

                  {/* Users Table */}
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      <span className="ml-2 text-gray-400">Loading users...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-600">
                            <TableHead className="text-gray-300">Username</TableHead>
                            <TableHead className="text-gray-300">Email</TableHead>
                            <TableHead className="text-gray-300">Phone</TableHead>
                            <TableHead className="text-gray-300">Role</TableHead>
                            <TableHead className="text-gray-300">Points</TableHead>
                            <TableHead className="text-gray-300">Joined</TableHead>
                            <TableHead className="text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.map((user: any) => (
                            <TableRow key={user.id} className="border-gray-600">
                              <TableCell className="text-white font-medium" data-testid={`text-username-${user.id}`}>
                                {user.username}
                                {user.isPhoneVerified && (
                                  <Badge variant="outline" className="ml-2 border-green-500 text-green-500 text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-300">{user.email || 'N/A'}</TableCell>
                              <TableCell className="text-gray-300">{user.phoneNumber || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.role === 'user' ? 'outline' : 'default'}
                                  className={
                                    user.role === 'superadmin' ? 'bg-red-600 text-white' : 
                                    user.role === 'admin' ? 'bg-purple-600 text-white' : 
                                    'border-gray-500 text-gray-300'
                                  }
                                >
                                  {user.role === 'superadmin' ? 'Super Admin' : 
                                   user.role === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">{user.totalPoints || 0}</TableCell>
                              <TableCell className="text-gray-300">
                                {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setUserForm({
                                        username: user.username,
                                        email: user.email || "",
                                        phoneNumber: user.phoneNumber || "",
                                        password: "",
                                        role: user.role
                                      });
                                      setIsEditUserDialogOpen(true);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                    data-testid={`button-edit-${user.id}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  
                                  {user.role !== 'admin' && user.id !== currentUser?.id && (
                                    <Button
                                      onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: 'admin' })}
                                      disabled={updateUserRoleMutation.isPending}
                                      size="sm"
                                      variant="outline"
                                      className="border-green-500 text-green-500 hover:bg-green-500/10"
                                      data-testid={`button-promote-${user.id}`}
                                    >
                                      <Shield className="h-3 w-3" />
                                    </Button>
                                  )}
                                  
                                  {user.role === 'admin' && user.id !== currentUser?.id && (
                                    <Button
                                      onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: 'user' })}
                                      disabled={updateUserRoleMutation.isPending}
                                      size="sm"
                                      variant="outline"
                                      className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                                      data-testid={`button-demote-${user.id}`}
                                    >
                                      <TrendingUp className="h-3 w-3 rotate-180" />
                                    </Button>
                                  )}
                                  
                                  {user.id !== currentUser?.id && (
                                    <Button
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                                          deleteUserMutation.mutate(user.id);
                                        }
                                      }}
                                      disabled={deleteUserMutation.isPending}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                                      data-testid={`button-delete-${user.id}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {users?.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Edit User Dialog - Super Admin Only */}
          {isSuperAdmin && (
          <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-600">
              <DialogHeader>
                <DialogTitle className="text-white">Edit User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update user information. Leave password blank to keep current password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Username</Label>
                  <Input
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="bg-black border-gray-600 text-white"
                    data-testid="input-edit-username"
                  />
                </div>
                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="bg-black border-gray-600 text-white"
                    data-testid="input-edit-email"
                  />
                </div>
                <div>
                  <Label className="text-white">Phone Number</Label>
                  <Input
                    value={userForm.phoneNumber}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    className="bg-black border-gray-600 text-white"
                    data-testid="input-edit-phone"
                  />
                </div>
                <div>
                  <Label className="text-white">New Password (optional)</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="bg-black border-gray-600 text-white"
                    placeholder="Leave blank to keep current password"
                    data-testid="input-edit-password"
                  />
                </div>
                <div>
                  <Label className="text-white">Role</Label>
                  <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                    <SelectTrigger className="bg-black border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditUserDialogOpen(false);
                      setSelectedUser(null);
                    }}
                    className="border-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const updates = { ...userForm };
                      if (!updates.password) {
                        delete updates.password;
                      }
                      updateUserMutation.mutate({ userId: selectedUser.id, updates });
                    }}
                    disabled={updateUserMutation.isPending}
                    className="gradient-button"
                    data-testid="button-save-user"
                  >
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}

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
                                  onClick={() => promoteMutation.mutate({ userId: member.userId, leagueId: selectedLeague! })}
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
          )}

          {/* Draft Picks Management */}
          {selectedLeague && (
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
          )}

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