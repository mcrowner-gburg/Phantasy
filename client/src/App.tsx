import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Draft from "@/pages/draft";
import Leaderboard from "@/pages/leaderboard";
import Concerts from "@/pages/concerts";
import Leagues from "@/pages/leagues";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/draft" component={Draft} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/concerts" component={Concerts} />
      <Route path="/leagues" component={Leagues} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
