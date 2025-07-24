import { Link, useLocation } from "wouter";
import { Music, Home, Trophy, Calendar, Users, User, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavigationSidebarProps {
  user?: {
    id: number;
    username: string;
    totalPoints: number;
  };
}

export function NavigationSidebar({ user }: NavigationSidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/draft", icon: Music, label: "Song Draft" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/concerts", icon: Calendar, label: "Concerts" },
    { path: "/leagues", icon: Users, label: "My Leagues" },
  ];

  return (
    <div className="w-64 bg-black h-screen fixed left-0 top-0 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Music className="text-green-500 text-2xl mr-3" size={24} />
          <h1 className="text-xl font-bold">PhishDraft</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "text-green-500 bg-gray-800" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}>
                <item.icon className="mr-3" size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <User className="text-black" size={20} />
            </div>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-400">{user.totalPoints?.toLocaleString() || 0} points</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
