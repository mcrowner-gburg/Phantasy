import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Plus, Users } from "lucide-react";
import SMSInviteDialog from "./sms-invite-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LeagueInvite } from "@shared/schema";

interface LeagueInviteGeneratorProps {
  leagueId: number;
  leagueName: string;
}

export function LeagueInviteGenerator({ leagueId, leagueName }: LeagueInviteGeneratorProps) {
  const [maxUses, setMaxUses] = useState<string>("");
  const [expirationDays, setExpirationDays] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing invites
  const { data: invites = [], isLoading } = useQuery<LeagueInvite[]>({
    queryKey: ['/api/admin/leagues', leagueId, 'invites'],
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (data: { maxUses?: number; expiresAt?: Date }) => {
      return apiRequest(`/api/admin/leagues/${leagueId}/invites`, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Invite Created",
        description: "League invite link generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leagues', leagueId, 'invites'] });
      setMaxUses("");
      setExpirationDays("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invite link.",
        variant: "destructive",
      });
    },
  });

  // Deactivate invite mutation
  const deactivateInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return apiRequest(`/api/admin/leagues/${leagueId}/invites/${inviteId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Invite Deactivated",
        description: "Invite link has been deactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leagues', leagueId, 'invites'] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to deactivate invite.",
        variant: "destructive",
      });
    },
  });

  const handleCreateInvite = () => {
    const data: { maxUses?: number; expiresAt?: Date } = {};
    
    if (maxUses && parseInt(maxUses) > 0) {
      data.maxUses = parseInt(maxUses);
    }
    
    if (expirationDays && parseInt(expirationDays) > 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));
      data.expiresAt = expiresAt;
    }

    createInviteMutation.mutate(data);
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const isExpired = (expiresAt: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Generator for {leagueName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="expirationDays">Expires in Days (optional)</Label>
              <Input
                id="expirationDays"
                type="number"
                placeholder="Never expires"
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateInvite} 
            disabled={createInviteMutation.isPending}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createInviteMutation.isPending ? "Creating..." : "Generate Invite Link"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Invite Links</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading invites...</p>
          ) : invites.length === 0 ? (
            <p className="text-muted-foreground">No active invites. Create one above to get started!</p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className={`p-4 border rounded-lg space-y-2 ${
                    isExpired(invite.expiresAt) ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {window.location.origin}/join/{invite.inviteCode}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteLink(invite.inviteCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <SMSInviteDialog 
                        leagueName={leagueName} 
                        inviteCode={invite.inviteCode} 
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateInviteMutation.mutate(invite.id)}
                        disabled={deactivateInviteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      Uses: {invite.currentUses}/{invite.maxUses || "∞"}
                    </Badge>
                    <Badge variant={isExpired(invite.expiresAt) ? "destructive" : "secondary"}>
                      Expires: {formatDate(invite.expiresAt)}
                    </Badge>
                    <Badge variant="secondary">
                      Created: {formatDate(invite.createdAt)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}