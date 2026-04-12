import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Music, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { format, isToday, isFuture } from "date-fns";
import UpcomingShows from "@/components/dashboard/upcoming-shows";

function pointsForSong(s: { isOpener: boolean; isEncore: boolean; durationSecs: number }) {
  let pts = 1;
  if (s.isOpener) pts++;
  if (s.isEncore) pts++;
  const mins = s.durationSecs / 60;
  if (mins >= 20) pts++;
  if (mins >= 30) pts++;
  if (mins >= 40) pts++;
  return pts;
}

function formatMins(secs: number) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Expanded setlist for one show — fetches from phish.in via our proxy
function ShowSetlist({ dateStr }: { dateStr: string }) {
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/shows/${dateStr}/setlist`],
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 phish-text text-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading setlist from phish.in…
      </div>
    );
  }

  if (isError || !data?.sets?.length) {
    return <p className="text-sm phish-text py-2">Setlist not available yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.sets.map((set: any) => (
        <div key={set.setName}>
          <h6 className={`text-sm font-semibold mb-2 ${set.isEncore ? "text-yellow-400" : "text-orange-400"}`}>
            {set.setName.toUpperCase()}:
          </h6>
          <div className="flex flex-wrap gap-1">
            {set.songs.map((song: any, i: number) => {
              const pts = pointsForSong(song);
              const dur = formatMins(song.durationSecs);
              const tags = [
                song.isOpener && "opener",
                song.isEncore && "encore",
                dur && song.durationSecs >= 20 * 60 && dur,
              ].filter(Boolean).join(" · ");

              return (
                <span
                  key={i}
                  title={tags || undefined}
                  className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${
                    set.isEncore
                      ? "bg-yellow-900 bg-opacity-60 text-yellow-300 border border-yellow-700"
                      : song.isOpener
                      ? "bg-green-900 bg-opacity-60 text-green-300 border border-green-700"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {song.title}
                  {dur && song.durationSecs >= 20 * 60 && (
                    <span className="text-xs text-gray-400">{dur}</span>
                  )}
                  <span className={`text-xs font-bold ml-0.5 ${pts > 1 ? "text-green-400" : "text-gray-500"}`}>
                    +{pts}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Concerts() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: concerts, isLoading } = useQuery({
    queryKey: ["/api/concerts"],
  });

  const { data: upcomingConcerts } = useQuery({
    queryKey: ["/api/concerts/upcoming"],
  });

  const sortedConcerts = concerts?.filter((concert: any) =>
    new Date(concert.date) < new Date()
  ).sort((a: any, b: any) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ) || [];

  const getShowStatus = (date: string) => {
    const showDate = new Date(date);
    if (isToday(showDate)) return { label: "TONIGHT", color: "bg-green-500 text-black" };
    if (isFuture(showDate)) return { label: "UPCOMING", color: "bg-blue-500 text-white" };
    return { label: "COMPLETED", color: "bg-gray-500 text-white" };
  };

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />

      <div className="flex-1 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Concerts</h2>
              <p className="phish-text">Track Phish shows and setlists for scoring</p>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8 space-y-8">
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Live Data from Phish.in</h3>
                <Badge className="bg-green-500 text-black">Connected</Badge>
              </div>
              <p className="text-sm phish-text mt-2">
                Setlists and song durations sourced from phish.in · Set openers highlighted green · Encores highlighted yellow · +N = phantasy points
              </p>
            </CardContent>
          </Card>

          <UpcomingShows shows={upcomingConcerts || []} />

          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Music className="mr-2 text-green-500" size={24} />
                  Completed Shows
                </h3>
                <p className="phish-text text-sm">{sortedConcerts.length} completed shows</p>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : sortedConcerts.length > 0 ? (
                <div className="space-y-3">
                  {sortedConcerts.map((concert: any) => {
                    const status = getShowStatus(concert.date);
                    const isNYE = format(new Date(concert.date), "MM-dd") === "12-31";
                    const dateStr = format(new Date(concert.date), "yyyy-MM-dd");
                    const isExpanded = expandedId === concert.id;

                    return (
                      <Card
                        key={concert.id}
                        className="bg-black bg-opacity-30 border border-gray-600 hover:border-green-500 transition-colors"
                      >
                        <CardContent className="p-4">
                          {/* Show header — click to expand */}
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? null : concert.id)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="text-white" size={22} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-bold text-white">{concert.venue}</h4>
                                  <Badge className={status.color}>{status.label}</Badge>
                                  {isNYE && <Badge className="bg-yellow-500 text-black">NYE</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-sm phish-text">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={13} />
                                    {concert.city}{concert.state ? `, ${concert.state}` : ""}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={13} />
                                    {format(new Date(concert.date), "MMMM d, yyyy")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <a
                                href={`https://phish.in/${dateStr}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-green-400 hover:text-green-300 underline"
                              >
                                phish.in
                              </a>
                              {isExpanded
                                ? <ChevronUp size={18} className="text-gray-400" />
                                : <ChevronDown size={18} className="text-gray-400" />
                              }
                            </div>
                          </div>

                          {/* Expanded setlist */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <ShowSetlist dateStr={dateStr} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 phish-text">
                  <Calendar className="mx-auto mb-4" size={48} />
                  <p className="text-lg mb-2">No completed shows yet</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-gray-600 hover:border-green-500"
                    onClick={() => window.open("https://phish.net/tour", "_blank")}
                  >
                    View Tour Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
