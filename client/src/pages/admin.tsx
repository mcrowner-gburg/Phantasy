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
import { Settings, Edit, Calendar, Music, Users, TrendingUp, AlertCircle, Link as LinkIcon, Search, UserPlus, Trash2, Shield } from "lucide-react";
import { LeagueInviteGenerator } from "@/components/admin/league-invite-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConcert, setSelectedConcert] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
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

  // Get all leagues for admin
  const { data: leagues } = useQuery({
    queryKey: ["/api/admin/leagues"],
    enabled: isAdmin,
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
    enabled: isSuperAdmin && showUserManagement,
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adjustments/league", selectedLeague] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shows", selectedConcert, "league", selectedLeague] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      
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

  const calculateOriginalPoints = (performance: any) => {
    let points = 1; // Base point for being played
    if (performance.isOpener) points += 1;
    if (performance.isEncore) points += 1;
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
                                  variant={user.role === 'admin' ? 'default' : 'outline'}
                                  className={user.role === 'admin' ? 'bg-purple-600 text-white' : 'border-gray-500 text-gray-300'}
                                >
                                  {user.role === 'admin' ? 'Admin' : 'User'}
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