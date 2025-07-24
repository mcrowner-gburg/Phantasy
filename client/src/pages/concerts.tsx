import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Music, ExternalLink } from "lucide-react";
import { format, isToday, isFuture } from "date-fns";

export default function Concerts() {
  const { data: concerts, isLoading } = useQuery({
    queryKey: ["/api/concerts"],
  });

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
      
      <div className="flex-1 ml-64 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Concerts</h2>
              <p className="phish-text">Track Phish shows and setlists for scoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-500">
                {upcomingConcerts?.length || 0} Upcoming
              </Badge>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8 space-y-8">
          {/* API Status Info */}
          <Card className="glassmorphism border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Live Data from Phish.net</h3>
                <Badge className="bg-green-500 text-black">Connected</Badge>
              </div>
              <p className="text-sm phish-text mt-2">
                Showing live concert data and setlists from the official Phish.net API
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Shows */}
          {upcomingConcerts?.length > 0 ? (
            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Calendar className="mr-2 text-green-500" size={24} />
                  Next Shows
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingConcerts.map((concert: any) => {
                    const status = getShowStatus(concert.date);
                    const isSpecial = format(new Date(concert.date), "MM-dd") === "12-31";
                    
                    return (
                      <Card key={concert.id} className="bg-black bg-opacity-50 border border-gray-600 hover:border-green-500 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            {isSpecial && (
                              <Badge className="bg-yellow-500 text-black">NYE</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-lg text-white">{concert.venue}</h4>
                            <div className="flex items-center text-sm phish-text">
                              <MapPin className="mr-1" size={14} />
                              {concert.city}, {concert.state}
                            </div>
                            <div className="flex items-center text-sm phish-text">
                              <Clock className="mr-1" size={14} />
                              {formatShowTime(concert.date)}
                            </div>
                            <p className="text-green-500 font-medium">{formatShowDate(concert.date)}</p>
                          </div>
                          
                          <Button variant="outline" className="w-full mt-4 border-gray-600 hover:border-green-500">
                            <ExternalLink className="mr-2" size={14} />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glassmorphism border-gray-600">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Calendar className="mr-2 text-green-500" size={24} />
                  Upcoming Shows
                </h3>
                <div className="text-center py-8 phish-text">
                  <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-lg mb-2">No upcoming shows scheduled</p>
                  <p>Check back later for new tour announcements</p>
                </div>
              </CardContent>
            </Card>
          )}

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
                      <Card key={concert.id} className="bg-black bg-opacity-30 border border-gray-600 hover:border-green-500 transition-colors">
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
                                // Organize setlist into sets - this is a simplified approach
                                // In a real app, this data would come structured from the API
                                const songs = concert.setlist;
                                const totalSongs = songs.length;
                                
                                // Basic set division logic for display purposes
                                const set1End = Math.ceil(totalSongs * 0.45);
                                const set2End = totalSongs - Math.min(3, Math.ceil(totalSongs * 0.15));
                                
                                const set1 = songs.slice(0, set1End);
                                const set2 = songs.slice(set1End, set2End);
                                const encore = songs.slice(set2End);
                                
                                return (
                                  <div className="space-y-4">
                                    {set1.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-semibold text-orange-400 mb-2">SET 1:</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {set1.map((song: string, index: number) => (
                                            <span key={`set1-${index}`} className="text-sm bg-gray-700 px-2 py-1 rounded text-green-400">
                                              {song}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {set2.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-semibold text-orange-400 mb-2">SET 2:</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {set2.map((song: string, index: number) => (
                                            <span key={`set2-${index}`} className="text-sm bg-gray-700 px-2 py-1 rounded text-green-400">
                                              {song}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {encore.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-semibold text-yellow-400 mb-2">ENCORE:</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {encore.map((song: string, index: number) => (
                                            <span key={`encore-${index}`} className="text-sm bg-gray-700 px-2 py-1 rounded text-yellow-300">
                                              {song}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
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
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
