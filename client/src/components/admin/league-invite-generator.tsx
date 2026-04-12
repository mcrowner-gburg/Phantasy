import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Link2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LeagueInviteGeneratorProps {
  leagueId: number;
  leagueName: string;
}

export function LeagueInviteGenerator({ leagueId, leagueName }: LeagueInviteGeneratorProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/leagues/${leagueId}/invite`, {});
      return res.json();
    },
    onSuccess: (data: { inviteCode: string }) => {
      const url = `${window.location.origin}/join/${data.inviteCode}`;
      setInviteUrl(url);
      toast({
        title: "Invite Created",
        description: "League invite link generated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invite link.",
        variant: "destructive",
      });
    },
  });

  const copyInviteUrl = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Generator for {leagueName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a shareable link — anyone who clicks it can join this league.
          </p>
          <Button
            onClick={() => createInviteMutation.mutate()}
            disabled={createInviteMutation.isPending}
          >
            <Link2 className="h-4 w-4 mr-2" />
            {createInviteMutation.isPending ? "Generating..." : "Generate Invite Link"}
          </Button>

          {inviteUrl && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm truncate">{inviteUrl}</code>
              <Button size="sm" variant="outline" onClick={copyInviteUrl}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
