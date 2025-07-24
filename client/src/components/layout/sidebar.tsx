import { Link, useLocation } from "wouter";
import { Home, Music, Trophy, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Song Draft", href: "/draft", icon: Music },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Concerts", href: "/concerts", icon: Calendar },
  { name: "My Leagues", href: "/leagues", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Music className="h-8 w-8 text-phish-green" />
          <h1 className="ml-3 text-xl font-bold text-white">PhishDraft</h1>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div className={cn(
                      "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors",
                      isActive
                        ? "bg-phish-card text-phish-green"
                        : "text-phish-text hover:text-white hover:bg-phish-card"
                    )}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-phish-border pt-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-phish-green">
              <span className="text-sm font-medium text-black">JP</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Jake_Phan42</p>
              <p className="text-xs text-phish-text">1,247 points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
