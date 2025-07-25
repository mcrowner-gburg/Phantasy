import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Calendar, Users, Lock, Shield } from "lucide-react";

export default function LeagueSettings() {
  const { id: leagueId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get league details
  const { data: league, isLoading: leagueLoading } = useQuery({
    queryKey: [`/api/leagues/${leagueId}`],
    enabled: !!leagueId,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    maxPlayers: 24,
    seasonStartDate: "",
    seasonEndDate: "",
  });

  // Initialize form when league loads
  React.useEffect(() => {
    if (league) {
      setFormData({
        name: league.name || "",
        description: league.description || "",
        isPublic: league.isPublic ?? true,
        maxPlayers: league.maxPlayers || 24,
        seasonStartDate: league.seasonStartDate ? new Date(league.seasonStartDate).toISOString().split('T')[0] : "",
        seasonEndDate: league.seasonEndDate ? new Date(league.seasonEndDate).toISOString().split('T')[0] : "",
      });
    }
  }, [league]);

  // Update league mutation
  const updateLeagueMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PATCH", `/api/leagues/${leagueId}`, {
        ...data,
        seasonStartDate: data.seasonStartDate ? new Date(data.seasonStartDate).toISOString() : null,
        seasonEndDate: data.seasonEndDate ? new Date(data.seasonEndDate).toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leagues/${leagueId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      toast({
        title: "League updated",
        description: "League settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update league settings.",
        variant: "destructive",
      });
    },
  });

  // Delete league mutation
  const deleteLeagueMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/leagues/${leagueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leagues"] });
      toast({
        title: "League deleted",
        description: "The league has been permanently deleted.",
      });
      setLocation("/leagues");
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete league.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date range
    if (formData.seasonStartDate && formData.seasonEndDate) {
      const startDate = new Date(formData.seasonStartDate);
      const endDate = new Date(formData.seasonEndDate);
      
      if (endDate <= startDate) {
        toast({
          title: "Invalid date range",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        return;
      }
    }
    
    updateLeagueMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this league? This action cannot be undone.")) {
      deleteLeagueMutation.mutate();
    }
  };

  // Loading state
  if (leagueLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <div className="lg:ml-64 p-4">
          <div className="text-center">Loading league settings...</div>
        </div>
      </div>
    );
  }

  // Permission check
  const isOwner = league?.ownerId === user?.id;
  const isAdmin = user?.role === "admin";
  
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <div className="lg:ml-64 p-4">
          <div className="text-center text-red-600">You don't have permission to edit this league.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationSidebar />
      <div className="lg:ml-64 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                League Settings
              </CardTitle>
            </CardHeader>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">League Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter league name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your league (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="maxPlayers">Maximum Players</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min="2"
                    max="100"
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic" className="flex items-center gap-2">
                    {formData.isPublic ? <Users className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {formData.isPublic ? "Public League" : "Private League"}
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.isPublic 
                    ? "Anyone can discover and join this league" 
                    : "Only users with an invite link can join"}
                </p>
              </CardContent>
            </Card>

            {/* Season Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scoring Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Set the date range for this fantasy league. Only songs from concerts played within this period will count toward points.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seasonStartDate">Season Start Date</Label>
                    <Input
                      id="seasonStartDate"
                      type="date"
                      value={formData.seasonStartDate}
                      onChange={(e) => setFormData({ ...formData, seasonStartDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seasonEndDate">Season End Date</Label>
                    <Input
                      id="seasonEndDate"
                      type="date"
                      value={formData.seasonEndDate}
                      onChange={(e) => setFormData({ ...formData, seasonEndDate: e.target.value })}
                    />
                  </div>
                </div>

                {formData.seasonStartDate && formData.seasonEndDate && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Scoring Period:</strong> {new Date(formData.seasonStartDate).toLocaleDateString()} - {new Date(formData.seasonEndDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Only concerts within this date range will contribute to player points.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button
                      type="submit"
                      disabled={updateLeagueMutation.isPending}
                    >
                      {updateLeagueMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/leagues/${leagueId}`)}
                    >
                      Cancel
                    </Button>
                  </div>

                  {isOwner && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteLeagueMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {deleteLeagueMutation.isPending ? "Deleting..." : "Delete League"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}