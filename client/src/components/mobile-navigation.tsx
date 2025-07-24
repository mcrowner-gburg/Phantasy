import { Link, useLocation } from "wouter";
import { Home, Music, Trophy, Calendar, User } from "lucide-react";

export function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/draft", icon: Music, label: "Draft" },
    { path: "/leaderboard", icon: Trophy, label: "Leagues" },
    { path: "/concerts", icon: Calendar, label: "Shows" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 lg:hidden z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path} className={`flex flex-col items-center py-2 px-4 ${
              isActive ? "text-green-500" : "text-gray-400"
            }`}>
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
