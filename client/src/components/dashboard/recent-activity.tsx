import { Music, Star, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

interface Activity {
  id: number;
  type: string;
  description: string;
  points: number;
  createdAt: string;
  metadata?: any;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const [, setLocation] = useLocation();
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "draft":
        return Music;
      case "score":
        return Star;
      case "league_join":
        return Users;
      default:
        return Music;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "draft":
        return "bg-phish-green";
      case "score":
        return "bg-phish-orange";
      case "league_join":
        return "bg-purple-600";
      default:
        return "bg-phish-green";
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-phish-text mx-auto mb-4" />
          <p className="text-phish-text">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        <button 
          className="text-phish-green hover:text-green-400 text-sm transition-colors"
          onClick={() => setLocation("/draft")}
        >
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-black bg-opacity-30 rounded-lg">
              <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{activity.description}</p>
                <p className="text-sm text-phish-text">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  {activity.points > 0 && ` • +${activity.points} points expected`}
                </p>
              </div>
              {activity.points > 0 && (
                <div className="phish-gold font-bold">+{activity.points}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
