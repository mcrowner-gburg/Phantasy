import { Link, useLocation } from "wouter";
import { Home, Music, Trophy, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Draft", href: "/draft", icon: Music },
  { name: "Leagues", href: "/leaderboard", icon: Trophy },
  { name: "Shows", href: "/concerts", icon: Calendar },
  { name: "Profile", href: "/leagues", icon: User },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t phish-border lg:hidden">
      <div className="flex justify-around py-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex flex-col items-center py-2 px-4 text-xs",
                isActive ? "text-phish-green" : "text-phish-text"
              )}>
                <item.icon className="h-5 w-5" />
                <span className="mt-1">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
