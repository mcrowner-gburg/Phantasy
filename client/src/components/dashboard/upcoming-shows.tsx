import { format, isToday, isTomorrow, isThisYear } from "date-fns";

interface Concert {
  id: number;
  date: string;
  venue: string;
  city: string;
  state: string;
  country: string;
}

interface UpcomingShowsProps {
  shows: Concert[];
}

export default function UpcomingShows({ shows }: UpcomingShowsProps) {
  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return <span className="bg-phish-green text-black text-xs px-2 py-1 rounde# thoughts

Looking at the design reference, I need to build a fantasy sports app for Phish concerts where users can draft songs and score points based on actual performances. The design shows a comprehensive dashboard with a sidebar navigation, stats overview, recent activity, upcoming shows, drafted songs table, and league standings.

Key features I need to implement:
1. User authentication and session management
2. Phish.net API integration for concert data and setlists
3. Song drafting system with rarity-based scoring
4. League management and leaderboards
5. Real-time updates for concerts and scoring
6. Responsive design with mobile navigation

The design uses a dark theme with Phish-specific colors (green, orange, gold) and a glassmorphism effect. I'll need to create the data schema first, then build the API routes, and finally implement the React frontend that matches the design exactly.

# useful_guidelines_from_blueprints

From the fullstack_js guidelines:
- Put as much functionality in the frontend as possible, backend only for data persistence and API calls
- Generate data model first in shared/schema.ts for consistency
- Use in-memory storage (MemStorage) unless database is specifically requested
- Use wouter for routing, @tanstack/react-query for data fetching
- Use shadcn components with proper form validation using react-hook-form and zod
- Define custom properties in index.css using HSL format
- Follow the existing Vite setup and don't modify core configuration files

# directory_structure

```json
[
    {"path": "shared/schema.ts", "status": "overwritten"},
    {"path": "server/storage.ts", "status": "overwritten"},
    {"path": "server/routes.ts", "status": "overwritten"},
    {"path": "client/src/index.css", "status": "overwritten"},
    {"path": "client/src/App.tsx", "status": "overwritten"},
    {"path": "client/src/pages/dashboard.tsx", "status": "new"},
    {"path": "client/src/pages/draft.tsx", "status": "new"},
    {"path": "client/src/pages/leaderboard.tsx", "status": "new"},
    {"path": "client/src/pages/concerts.tsx", "status": "new"},
    {"path": "client/src/pages/leagues.tsx", "status": "new"},
    {"path": "client/src/components/navigation-sidebar.tsx", "status": "new"},
    {"path": "client/src/components/mobile-navigation.tsx", "status": "new"},
    {"path": "client/src/lib/phish-api.ts", "status": "new"}
]
