import { Star, Trophy, Music, Calendar, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface StatsOverviewProps {
  stats: {
    totalPoints: number;
    rank: number;
    songsDrafted: number;
    todayPoints: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const [, setLocation] = useLocation();
  const statCards = [
    {
      title: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      icon: Star,
      color: "score-gradient",
      change: "+12.5%",
      changeText: "from last week",
      onClick: () => setLocation("/leaderboard"),
    },
    {
      title: "League Rank",
      value: `#${stats.rank}`,
      icon: Trophy,
      color: "bg-phish-green",
      changeText: "of 24 players",
      onClick: () => setLocation("/leaderboard"),
    },
    {
      title: "Songs Drafted",
      value: stats.songsDrafted.toString(),
      icon: Music,
      color: "bg-phish-orange",
      changeText: "2 slots remaining",
      onClick: () => setLocation("/draft"),
    },
    {
      title: "Next Show",
      value: "Dec 28",
      icon: Calendar,
      color: "bg-purple-600",
      changeText: "Madison Square Garden",
      onClick: () => setLocation("/concerts"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="glassmorphism rounded-xl p-6 cursor-pointer hover:border-green-500 transition-colors"
          onClick={stat.onClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-phish-text text-sm font-medium">{stat.title}</p>
              <p className={`text-2xl font-bold ${
                stat.title === 'Total Points' ? 'phish-gold' : 'text-white'
              }`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stat.change && (
              <>
                <TrendingUp className="h-4 w-4 text-phish-green mr-1" />
                <span className="text-phish-green">{stat.change}</span>
              </>
            )}
            <span className={`text-phish-text ${stat.change ? 'ml-1' : ''}`}>
              {stat.changeText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
