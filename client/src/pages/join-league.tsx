import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Trophy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function JoinLeague() {
  const { inviteCode } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');

  // Join league mutation
  const joinLeagueMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/leagues/join/${inviteCode}`, 'POST');
    },
    onSuccess: () => {
      setJoinStatus('success');
      toast({
        title: "Success!",
        description: "You've successfully joined the league!",
      });
      setTimeout(() => {
        navigate('/leagues');
      }, 2000);
    },
    onError: (error: Error) => {
      setJoinStatus('error');
      toast({
        title: "Unable to Join",
        description: error.message || "This invite may be expired or you're already a member.",
        variant: "destructive",
      });
    },
  });

  const handleJoinLeague = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setJoinStatus('joining');
    joinLeagueMutation.mutate();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to join a league.",
      });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!inviteCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Invalid Invite</h2>
              <p className="text-muted-foreground">
                This invite link appears to be broken or incomplete.
              </p>
              <Button onClick={() => navigate('/leagues')}>
                Browse Leagues
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-900/50">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Join Phish League</CardTitle>
          <p className="text-gray-400">
            You've been invited to join a phantasy Phish league!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Invite Code</p>
              <code className="text-lg font-mono bg-gray-950 text-white px-3 py-1 rounded border border-gray-700">
                {inviteCode}
              </code>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Phantasy Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Live Scoring</span>
              </div>
            </div>
          </div>

          {joinStatus === 'success' ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <div>
                <h3 className="font-semibold text-green-400">
                  Welcome to the League!
                </h3>
                <p className="text-sm text-gray-400">
                  Redirecting to your leagues...
                </p>
              </div>
            </div>
          ) : joinStatus === 'error' ? (
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-red-400 mx-auto" />
              <div>
                <h3 className="font-semibold text-red-400">Unable to Join</h3>
                <p className="text-sm text-gray-400">
                  This invite may be expired or you're already a member.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => navigate('/leagues')}
              >
                Browse Other Leagues
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {user && (
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Joining as <Badge className="bg-gray-700 text-white">{user.username}</Badge>
                  </p>
                </div>
              )}

              <Button
                onClick={handleJoinLeague}
                disabled={joinStatus === 'joining'}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                size="lg"
              >
                {joinStatus === 'joining' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining League...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Join League
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-300"
                  onClick={() => navigate('/leagues')}
                >
                  Browse other leagues instead
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}