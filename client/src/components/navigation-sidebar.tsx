import { Link, useLocation } from "wouter";
import { Music, Home, Trophy, Calendar, Users, User, Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    { path: "/draft", icon: Music, label: "Song Draft" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/concerts", icon: Calendar, label: "Concerts" },
    { path: "/leagues", icon: Users, label: "My Leagues" },
  ];

  // Add admin link if user is admin
  const navItems = authUser?.role === "admin" 
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
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-black border-gray-700 text-white hover:bg-gray-800">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-black text-white p-0 border-gray-700">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-black h-screen fixed left-0 top-0 z-40 overflow-y-auto">
        <SidebarContent />
      </div>
    </>
  );
}
