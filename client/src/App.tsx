import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Draft from "@/pages/draft";
import Leaderboard from "@/pages/leaderboard";
import Concerts from "@/pages/concerts";
import Leagues from "@/pages/leagues";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import JoinLeague from "@/pages/join-league";
import LeagueSettings from "@/pages/league-settings";
import Profile from "@/pages/profile";
import DraftRoom from "@/pages/draft-room";
import NotFound from "@/pages/not-found";

// Redirects /draft-room → active draft league, or /leagues if none
function DraftRoomRedirect() {
  const { data: leagues } = useQuery<any[]>({ queryKey: ["/api/leagues"] });
  if (!leagues) return null;
  const active = leagues.find((l) => l.draftStatus === "active");
  const target = active ? `/draft-room/${active.id}` : `/draft-room/${leagues[0]?.id ?? ""}`;
  return <Redirect to={leagues.length ? target : "/leagues"} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password/:token" component={ResetPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/join/:inviteCode" component={JoinLeague} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/draft" component={Draft} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/concerts" component={Concerts} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/admin" component={Admin} />
      <Route path="/profile" component={Profile} />
      <Route path="/draft-room" component={DraftRoomRedirect} />
      <Route path="/draft-room/:id" component={DraftRoom} />
      <Route path="/leagues/:id/settings" component={LeagueSettings} />
      <Route path="/leagues/:id">
        {(params: { id: string }) => <Redirect to={`/leaderboard?league=${params.id}`} />}
      </Route>
      <Route path="/join/:inviteCode" component={JoinLeague} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          <Toaster />
          <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App; 
