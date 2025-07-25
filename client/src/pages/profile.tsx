import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Phone, Save, Shield } from "lucide-react";

const profileUpdateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    return /^\+?[\d\s\-\(\)]+$/.test(val);
  }, "Please enter a valid phone number"),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile information",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

  const cancelEdit = () => {
    form.reset({
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <NavigationSidebar />
        <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <div className="p-8">
            <p className="text-center text-gray-400">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar user={user} />
      
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <header className="phish-card border-b phish-border px-4 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="phish-text">Manage your account information and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="text-green-500" size={20} />
              <span className="text-sm phish-text">Account: {user.role === 'admin' ? 'Administrator' : 'Member'}</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6">
          {/* Profile Information */}
          <Card className="glassmorphism border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 text-green-500" size={20} />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Username (Read Only) */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="bg-gray-800 border-gray-600"
                    />
                    <p className="text-xs text-gray-400">Username cannot be changed</p>
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Mail className="mr-2" size={16} />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={!isEditing}
                            className={`${!isEditing ? 'bg-gray-800 border-gray-600' : 'bg-transparent border-gray-600'}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Phone className="mr-2" size={16} />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+1-555-123-4567"
                            disabled={!isEditing}
                            className={`${!isEditing ? 'bg-gray-800 border-gray-600' : 'bg-transparent border-gray-600'}`}
                          />
                        </FormControl>
                        <FormMessage />
                        {!field.value && (
                          <p className="text-xs text-gray-400">
                            Add a phone number to enable SMS login and league invites
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="gradient-button"
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="gradient-button"
                        >
                          <Save className="mr-2" size={16} />
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          className="border-gray-600 hover:border-green-500"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="glassmorphism border-gray-600">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">{user.totalPoints?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-400">Total Points</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-2xl font-bold text-orange-400">--</p>
                  <p className="text-sm text-gray-400">Leagues Joined</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-2xl font-bold text-purple-400">--</p>
                  <p className="text-sm text-gray-400">Songs Drafted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}