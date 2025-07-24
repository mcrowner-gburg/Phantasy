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
      return <span className="bg-phish-green text-black text-xs px-2 py-1 rounded-full font-medium">Today</span>;
    }
    
    if (isTomorrow(date)) {
      return <span className="bg-phish-orange text-white text-xs px-2 py-1 rounded-full font-medium">Tomorrow</span>;
    }
    
    if (isThisYear(date)) {
      return <span className="text-phish-text text-xs">{format(date, "MMM d")}</span>;
    }
    
    return <span className="text-phish-text text-xs">{format(date, "MMM d, yyyy")}</span>;
  };

  const formatShowUrl = (date: string, venue: string) => {
    const showDate = new Date(date);
    const year = showDate.getFullYear();
    const month = format(showDate, "MMMM").toLowerCase();
    const day = showDate.getDate();
    
    return `https://phish.net/setlists/${year}/${month}-${day.toString().padStart(2, '0')}-${year}.html`;
  };

  if (!shows || shows.length === 0) {
    return (
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Upcoming Shows</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-phish-text">No upcoming shows scheduled</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Upcoming Shows</h3>
        <button className="text-phish-green hover:text-green-400 text-sm transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {shows.slice(0, 3).map((show) => (
          <a
            key={show.id}
            href={formatShowUrl(show.date, show.venue)}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-40 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getDateBadge(show.date)}
                  <h4 className="font-semibold text-white group-hover:text-phish-green transition-colors">
                    {show.venue}
                  </h4>
                </div>
                <p className="text-phish-text text-sm">
                  {show.city}, {show.state} {show.country !== "USA" && show.country}
                </p>
              </div>
              <div className="text-phish-text group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}