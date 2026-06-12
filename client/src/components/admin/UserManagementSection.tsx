import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Users, TrendingUp, Search, UserPlus, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Super-admin-only user table with create/edit/delete and role promotion.
export function UserManagementSection({ currentUser }: { currentUser: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user"
  });

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
    enabled: showUserManagement,
  });

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

  return (
    <>
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

      {/* Edit User Dialog */}
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
                  const updates: any = { ...userForm };
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
    </>
  );
}
