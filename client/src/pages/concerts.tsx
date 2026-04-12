import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Music } from "lucide-react";
import { format, isToday, isFuture } from "date-fns";
import UpcomingShows from "@/components/dashboard/upcoming-shows";

// Build structured sets from phish.net setlistData (set field: "1","2","e","e2")
// Falls back to phish.in track data (set_name field) if that's what's stored
function buildSets(setlistData: any[]): { label: string; songs: { title: string; isOpener: boolean; isEncore: boolean; durationSecs: number }[] }[] {
  if (!setlistData || setlistData.length === 0) return [];

  // Detect format: phish.net has `song` field, phish.in has `title`
  const isPhishNet = setlistData[0]?.song !== undefined;

  const groups: Record<string, { title: string; isOpener: boolean; isEncore: boolean; durationSecs: number }[]> = {};

  if (isPhishNet) {
    for (const track of setlistData) {
      const setKey = track.set ?? "1";
      if (!groups[setKey]) groups[setKey] = [];
      const isEncore = setKey.startsWith("e") || track.is_encore === "1";
      const isOpener = !isEncore && parseInt(track.position ?? "99") === 1;
      groups[setKey].push({ title: track.song ?? track.title, isOpener, isEncore, durationSecs: 0 });
    }
  } else {
    // phish.in format
    for (const track of setlistData) {
      const setKey = track.set_name ?? "Set 1";
      if (!groups[setKey]) groups[setKey] = [];
      const isEncore = (track.set_name ?? "").toLowerCase().includes("encore");
      const firstPos = Math.min(...setlistData.filter(t => t.set_name === setKey).map((t: any) => t.position ?? 99));
      const isOpener = !isEncore && (track.position ?? 99) === firstPos;
      groups[setKey].push({ title: track.title ?? track.song, isOpener, isEncore, durationSecs: track.duration ? Math.round(track.duration / 1000) : 0 });
    }
  }

  const setOrder = ["1", "2", "3", "e", "e2", "Set 1", "Set 2", "Set 3", "Encore", "Encore 2"];
  const sorted = Object.keys(groups).sort((a, b) => {
    const ai = setOrder.indexOf(a); const bi = setOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    return a.localeCompare(b);
  });

  return sorted.map(key => {
    const isEncore = key.startsWith("e") || key.toLowerCase().includes("encore");
    const label = isEncore
      ? (key === "e" || key === "Encore" ? "Encore" : `Encore ${key.replace("e", "")}`)
      : `Set ${key.replace("Set ", "")}`;
    return { label, songs: groups[key] };
  });
}

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

export default function Concerts() {
  const { data: concerts, isLoading } = useQuery({
    queryKey: ["/api/concerts"],
  });

  // Use the same upcoming concerts endpoint but ensure it matches dashboard data
  const { data: upcomingConcerts } = useQuery({
    queryKey: ["/api/concerts/upcoming"],
  });

  const sortedConcerts = concerts?.filter((concert: any) => 
    new Date(concert.date) < new Date() // Only show completed shows
  ).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ) || [];

  const getShowStatus = (date: string) => {
    const showDate = new Date(date);
    if (isToday(showDate)) return { label: "TONIGHT", color: "bg-green-500 text-black" };
    if (isFuture(showDate)) return { label: "UPCOMING", color: "bg-blue-500 text-white" };
    return { label: "COMPLETED", color: "bg-gray-500 text-white" };
  };

  const formatShowDate = (date: string) => {
    return format(new Date(date), "EEEE, MMMM do, yyyy");
  };

  const formatShowTime = (date: string) => {
    return format(new Date(date), "h:mm a zzz");
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
          {/* API Status Info */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Live Data from Phish.in</h3>
                <Badge className="bg-green-500 text-black">Connected</Badge>
              </div>
              <p className="text-sm phish-text mt-2">
                Showing live concert data and setlists from the official Phish.in API
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Shows - Use same component as dashboard */}
          <UpcomingShows shows={upcomingConcerts || []} />

          {/* All Shows */}
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
                      <div className="h-24 bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : sortedConcerts.length > 0 ? (
                <div className="space-y-4">
                  {sortedConcerts.map((concert: any) => {
                    const status = getShowStatus(concert.date);
                    const isSpecial = format(new Date(concert.date), "MM-dd") === "12-31";
                    const hasSetlist = concert.setlist && concert.setlist.length > 0;
                    
                    return (
                      <Card 
                        key={concert.id} 
                        className="bg-black bg-opacity-30 border border-gray-600 hover:border-green-500 transition-colors cursor-pointer"
                        onClick={() => window.open(`https://phish.in/${format(new Date(concert.date), "yyyy-MM-dd")}`, '_blank')}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <Calendar className="text-white" size={24} />
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-bold text-lg text-white">{concert.venue}</h4>
                                  <Badge className={status.color}>
                                    {status.label}
                                  </Badge>
                                  {isSpecial && (
                                    <Badge className="bg-yellow-500 text-black">NYE</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm phish-text">
                                  <div className="flex items-center">
                                    <MapPin className="mr-1" size={14} />
                                    {concert.city}, {concert.state}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="mr-1" size={14} />
                                    {formatShowTime(concert.date)}
                                  </div>
                                </div>
                                
                                <p className="text-green-500 font-medium">{formatShowDate(concert.date)}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {hasSetlist ? (
                                <div>
                                  <Badge className="bg-green-500 text-black mb-2">
                                    <Music className="mr-1" size={12} />
                                    Setlist Available
                                  </Badge>
                                  <p className="text-sm phish-text">{concert.setlist.length} songs</p>
                                </div>
                              ) : status.label === "COMPLETED" ? (
                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                  No Setlist
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-blue-500 text-blue-400">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {hasSetlist && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <h5 className="font-medium mb-3 text-white">Complete Setlist:</h5>
                              {(() => {
                                const sets = buildSets(concert.setlistData || []);
                                // Fall back to flat list if no structured data
                                if (sets.length === 0) {
                                  return (
                                    <div className="flex flex-wrap gap-1">
                                      {concert.setlist.map((song: string, i: number) => (
                                        <span key={i} className="text-sm bg-gray-700 px-2 py-1 rounded text-green-400">{song}</span>
                                      ))}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="space-y-4">
                                    {sets.map((set) => {
                                      const isEncore = set.label.toLowerCase().includes("encore");
                                      return (
                                        <div key={set.label}>
                                          <h6 className={`text-sm font-semibold mb-2 ${isEncore ? "text-yellow-400" : "text-orange-400"}`}>
                                            {set.label.toUpperCase()}:
                                          </h6>
                                          <div className="flex flex-wrap gap-1">
                                            {set.songs.map((song, i) => {
                                              const pts = pointsForSong(song);
                                              const tags = [
                                                song.isOpener && "opener",
                                                song.isEncore && "encore",
                                                song.durationSecs >= 40 * 60 && "40min+",
                                                song.durationSecs >= 30 * 60 && song.durationSecs < 40 * 60 && "30min+",
                                                song.durationSecs >= 20 * 60 && song.durationSecs < 30 * 60 && "20min+",
                                              ].filter(Boolean);
                                              return (
                                                <span
                                                  key={i}
                                                  title={tags.length ? `${tags.join(", ")} · ${pts} pts` : `${pts} pt`}
                                                  className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${
                                                    isEncore
                                                      ? "bg-yellow-900 bg-opacity-60 text-yellow-300 border border-yellow-700"
                                                      : song.isOpener
                                                      ? "bg-green-900 bg-opacity-60 text-green-300 border border-green-700"
                                                      : "bg-gray-700 text-gray-200"
                                                  }`}
                                                >
                                                  {song.title}
                                                  {pts > 1 && (
                                                    <span className="text-xs font-bold text-green-400 ml-0.5">+{pts}</span>
                                                  )}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
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
                  <p className="text-lg mb-2">No concerts scheduled</p>
                  <p>Check back later for upcoming Phish shows!</p>
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
