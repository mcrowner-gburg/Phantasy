import { Link, useLocation } from "wouter";
import { Music, Home, Trophy, Calendar, Users, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import UserMenu from "@/components/user-menu";
import { useAuth } from "@/hooks/useAuth";

interface NavigationSidebarProps {
  user?: {
    id: number;
    username: string;
    totalPoints: number;
  };
}

export function NavigationSidebar({ user }: NavigationSidebarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user: authUser } = useAuth();

  const baseNavItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/draft", icon: Music, label: "Draft Research" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/concerts", icon: Calendar, label: "Concerts" },
    { path: "/leagues", icon: Users, label: "My Leagues" },
  ];

  // Add admin link if user is admin or superadmin
  const navItems = (authUser?.role === "admin" || authUser?.role === "superadmin")
    ? [...baseNavItems, { path: "/admin", icon: Settings, label: "Admin Panel" }]
    : baseNavItems;

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Music className="text-green-500 text-2xl mr-3" size={24} />
          <h1 className="text-xl font-bold">PhishDraft</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "text-green-500 bg-gray-800" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setIsOpen(false)} // Close mobile menu on navigation
              >
                <item.icon className="mr-3" size={20} />
                <span className="font-medium">{item.label}</span>
                {item.path === "/admin" && (
                  <Badge className="ml-auto bg-orange-500 text-black text-xs">ADMIN</Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {user && (
        <div className="mt-auto p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <User className="text-black" size={20} />
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-400">{user.totalPoints?.toLocaleString() || 0} points</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? "text-green-500" : "text-gray-500"
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-black h-screen fixed left-0 top-0 z-40 overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  );
}
