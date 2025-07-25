import { Crown, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LeagueStanding {
  id: number;
  username: string;
  totalPoints: number;
  rank: number;
  todayPoints: number;
  songCount: number;
}

interface LeagueStandingsProps {
  standings: LeagueStanding[];
  currentUserId?: number;
  leagueName?: string;
  onViewFullStandings?: () => void;
}

export default function LeagueStandings({ 
  standings, 
  currentUserId, 
  leagueName,
  onViewFullStandings 
}: LeagueStandingsProps) {
  const [, setLocation] = useLocation();
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Crown className="text-yellow-400" size={20} />;
    }
    return <User className="text-black" size={20} />;
  };

  return (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">League Standings</h3>
        <div className="flex items-center space-x-2 text-sm phish-text">
          <Users size={16} />
          <span>"{leagueName || "No League"}" League</span>
        </div>
      </div>

      <div className="space-y-3">
        {standings?.length > 0 ? (
          standings.slice(0, 5).map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors ${
                player.id === currentUserId ? "bg-green-500 bg-opacity-20 border border-green-500" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${getRankBadgeColor(player.rank)} rounded-full flex items-center justify-center font-bold text-black`}>
                  {player.rank}
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  {getRankIcon(player.rank)}
                </div>
                <div>
                  <p className="font-medium">
                    {player.username} {player.id === currentUserId && <span className="text-green-500">(You)</span>}
                  </p>
                  <p className="text-sm phish-text">{player.songCount || 0} songs drafted</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold phish-gold text-lg">{player.totalPoints?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-500">+{player.todayPoints || 0} today</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 phish-text">
            <Users className="mx-auto mb-4" size={48} />
            <p>No league standings available</p>
          </div>
        )}
      </div>

      {standings?.length > 5 && (
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            className="text-green-500 hover:text-green-400 text-sm font-medium p-0"
            onClick={onViewFullStandings || (() => setLocation("/leaderboard"))}
          >
            View Full Standings
          </Button>
        </div>
      )}
    </div>
  );
}
