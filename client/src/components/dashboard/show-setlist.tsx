import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import { format } from "date-fns";

interface ShowSetlistProps {
  recentConcerts: { date: string; venue: string; city: string; state?: string }[];
  leagueId: number;
}

export default function ShowSetlist({ recentConcerts, leagueId }: ShowSetlistProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    recentConcerts?.[0]?.date ?? null
  );

  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/leagues/${leagueId}/setlist?date=${selectedDate}`],
    enabled: !!leagueId && !!selectedDate,
  });

  if (!recentConcerts?.length) return null;

  const selectedConcert = recentConcerts.find((c) => c.date === selectedDate);

  return (
    <Card className="glassmorphism border-gray-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Show Setlist</h3>
          <div className="flex gap-2 flex-wrap justify-end">
            {recentConcerts.map((c) => (
              <button
                key={c.date}
                onClick={() => setSelectedDate(c.date)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  selectedDate === c.date
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400"
                }`}
              >
                {format(new Date(c.date + "T12:00:00"), "MMM d")}
              </button>
            ))}
          </div>
        </div>

        {selectedConcert && (
          <p className="phish-text text-sm mb-4">
            {selectedConcert.venue} · {selectedConcert.city}{selectedConcert.state ? `, ${selectedConcert.state}` : ""}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-700 rounded" />
            ))}
          </div>
        ) : data?.songPerformances?.length > 0 ? (
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {data.songPerformances.map((perf: any) => (
              <div
                key={perf.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                  perf.draftedBy?.length > 0
                    ? "bg-green-950 bg-opacity-60"
                    : "bg-black bg-opacity-20"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs text-gray-500 w-6 flex-shrink-0">{perf.position}</span>
                  <span className={`text-sm truncate ${perf.draftedBy?.length > 0 ? "text-white font-medium" : "text-gray-400"}`}>
                    {perf.song.title}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {perf.isSetOpener && (
                      <Badge className="bg-orange-600 text-white text-xs px-1 py-0">Opener</Badge>
                    )}
                    {perf.isEncore && (
                      <Badge className="bg-purple-600 text-white text-xs px-1 py-0">Encore</Badge>
                    )}
                    {perf.durationSeconds >= 1200 && (
                      <Badge className="bg-blue-600 text-white text-xs px-1 py-0">
                        {Math.floor(perf.durationSeconds / 60)}m
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {perf.draftedBy?.length > 0 && (
                    <div className="flex gap-1">
                      {perf.draftedBy.map((d: any) => (
                        <span key={d.userId} className="text-xs text-green-400">{d.username}</span>
                      ))}
                    </div>
                  )}
                  {perf.draftedBy?.length > 0 ? (
                    <Badge className="bg-green-600 text-white text-xs">{perf.points} pts</Badge>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 phish-text">
            <Music className="mx-auto mb-3" size={40} />
            <p>No setlist data available yet for this show.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
