import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Music,
  Search,
  Star,
  StarOff,
  Zap,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowRight,
  Clock,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishList } from "@/hooks/useWishList";
import { useLocation } from "wouter";

export default function Draft() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | undefined>();
  const [sortOrder, setSortOrder] = useState<"alpha" | "common" | "rare">("alpha");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: leagues } = useQuery<any[]>({
    queryKey: ["/api/leagues"],
    enabled: !!user?.id,
  });

  // Auto-select the active/scheduled league, then fall back to first
  useEffect(() => {
    if (leagues && leagues.length > 0 && !selectedLeagueId) {
      const active = leagues.find((l) => l.draftStatus === "active" || l.draftStatus === "scheduled");
      setSelectedLeagueId((active ?? leagues[0]).id);
    }
  }, [leagues, selectedLeagueId]);

  const selectedLeague = leagues?.find((l) => l.id === selectedLeagueId);
  const activeDraft = leagues?.find((l) => l.draftStatus === "active");

  const isDraftActive = activeDraft?.id === selectedLeagueId;

  const { data: songs, isLoading: songsLoading } = useQuery<any[]>({
    queryKey: ["/api/songs", selectedLeagueId],
    queryFn: () =>
      fetch(selectedLeagueId ? `/api/songs?leagueId=${selectedLeagueId}` : "/api/songs").then(
        (r) => r.json()
      ),
    enabled: !!selectedLeagueId,
    // Poll every 5s during an active draft so picked songs disappear in real time
    refetchInterval: isDraftActive ? 5000 : false,
  });

  const { list: wishList, toggle, move, remove } = useWishList(selectedLeagueId);

  // Auto-remove wish-listed songs that got drafted by someone else
  useEffect(() => {
    if (!songs || !isDraftActive) return;
    const availableIds = new Set(songs.map((s: any) => s.id));
    wishList.forEach((id) => {
      if (!availableIds.has(id)) remove(id);
    });
  }, [songs]);

  const filteredSongs =
    songs?.filter((s: any) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  // Songs sorted so wish-listed ones float to top, then by selected sort order
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    const aW = wishList.indexOf(a.id);
    const bW = wishList.indexOf(b.id);
    if (aW !== -1 && bW !== -1) return aW - bW;
    if (aW !== -1) return -1;
    if (bW !== -1) return 1;
    if (sortOrder === "common") return (b.totalPlays ?? 0) - (a.totalPlays ?? 0);
    if (sortOrder === "rare") return (a.totalPlays ?? 0) - (b.totalPlays ?? 0);
    return a.title.localeCompare(b.title);
  });

  const wishListSongs = wishList
    .map((id) => songs?.find((s: any) => s.id === id))
    .filter(Boolean);

  const getRarityLabel = (plays: number) => {
    if (plays >= 40) return { label: "Common", color: "bg-gray-600 text-gray-300" };
    if (plays >= 20) return { label: "Frequent", color: "bg-blue-700 text-blue-200" };
    if (plays >= 10) return { label: "Occasional", color: "bg-yellow-700 text-yellow-200" };
    if (plays >= 5) return { label: "Rare", color: "bg-orange-700 text-orange-200" };
    return { label: "Ultra Rare", color: "bg-purple-700 text-purple-200" };
  };

  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />

      <div className="flex-1 lg:ml-64">
        <header className="phish-card border-b phish-border px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Draft Research</h2>
              <p className="phish-text">Scout songs and build your wish list before your pick</p>
            </div>
            <div className="flex items-center gap-3">
              {leagues && leagues.length > 1 && (
                <Select
                  value={selectedLeagueId?.toString()}
                  onValueChange={(v) => setSelectedLeagueId(parseInt(v))}
                >
                  <SelectTrigger className="w-48 bg-black border-gray-600 text-white">
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    {leagues.map((l: any) => (
                      <SelectItem key={l.id} value={l.id.toString()} className="text-white">
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedLeague && (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  {selectedLeague.name}
                </Badge>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 pb-20 lg:pb-8 space-y-6">
          {/* Active Draft Alert */}
          {activeDraft && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-900 bg-opacity-40 border border-green-500 animate-pulse-slow">
              <div className="flex items-center gap-3">
                <Zap className="text-green-400 flex-shrink-0" size={22} />
                <div>
                  <p className="font-bold text-green-300">Draft in progress: {activeDraft.name}</p>
                  <p className="text-sm text-green-400">
                    {activeDraft.currentPlayer === user?.id
                      ? "It's YOUR turn to pick!"
                      : "Draft is live — jump in to watch or pick when it's your turn"}
                  </p>
                </div>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-500 text-white flex-shrink-0"
                onClick={() => setLocation(`/draft-room/${activeDraft.id}`)}
              >
                Go to Draft Room <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Song Browser — takes 2/3 width */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search + Sort */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 phish-text"
                    size={18}
                  />
                  <Input
                    placeholder="Search songs…"
                    className="pl-10 bg-black border-gray-600 text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                  <SelectTrigger className="w-40 bg-black border-gray-600 text-white flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="alpha" className="text-white">A – Z</SelectItem>
                    <SelectItem value="rare" className="text-white">Rare first</SelectItem>
                    <SelectItem value="common" className="text-white">Common first</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { label: "Ultra Rare", color: "bg-purple-700 text-purple-200" },
                  { label: "Rare", color: "bg-orange-700 text-orange-200" },
                  { label: "Occasional", color: "bg-yellow-700 text-yellow-200" },
                  { label: "Frequent", color: "bg-blue-700 text-blue-200" },
                  { label: "Common", color: "bg-gray-600 text-gray-300" },
                ].map((r) => (
                  <span key={r.label} className={`px-2 py-0.5 rounded-full ${r.color}`}>
                    {r.label}
                  </span>
                ))}
                <span className="text-gray-500 self-center ml-1">← by plays in last 24 months</span>
              </div>

              {/* Song list */}
              <Card className="glassmorphism border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">
                      Available Songs
                    </h3>
                    <p className="phish-text text-sm">{filteredSongs.length} songs</p>
                  </div>

                  {songsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="animate-pulse h-14 bg-gray-700 rounded-lg" />
                      ))}
                    </div>
                  ) : sortedSongs.length === 0 ? (
                    <div className="text-center py-10 phish-text">
                      <Music className="mx-auto mb-3" size={40} />
                      <p>No songs found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-gray-600"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                      {sortedSongs.map((song: any) => {
                        const starred = wishList.includes(song.id);
                        const wishPos = wishList.indexOf(song.id);
                        const rarity = getRarityLabel(song.totalPlays ?? 0);

                        return (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                              starred
                                ? "bg-yellow-900 bg-opacity-30 border border-yellow-700"
                                : "bg-black bg-opacity-30 border border-transparent hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Wish list star */}
                              <button
                                onClick={() => toggle(song.id)}
                                className={`flex-shrink-0 transition-colors ${
                                  starred
                                    ? "text-yellow-400 hover:text-yellow-300"
                                    : "text-gray-600 hover:text-yellow-400"
                                }`}
                                title={starred ? "Remove from wish list" : "Add to wish list"}
                              >
                                {starred ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                              </button>

                              {/* Priority badge when starred */}
                              {starred && (
                                <span className="flex-shrink-0 text-xs font-bold text-yellow-500 w-5 text-right">
                                  #{wishPos + 1}
                                </span>
                              )}

                              <span className={`text-sm truncate ${starred ? "text-white font-medium" : "text-gray-300"}`}>
                                {song.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <BarChart2 size={12} />
                                <span>{song.totalPlays ?? 0}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${rarity.color}`}>
                                {rarity.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wish List Panel — 1/3 width */}
            <div className="space-y-4">
              <Card className="glassmorphism border-yellow-700 border-opacity-60 sticky top-4">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Star size={18} fill="currentColor" />
                    Wish List
                  </CardTitle>
                  <p className="text-xs phish-text">
                    Star songs to build your priority queue.{" "}
                    {wishListSongs.length > 0
                      ? `${wishListSongs.length} song${wishListSongs.length !== 1 ? "s" : ""} queued.`
                      : "Click ★ next to any song to add it."}
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  {wishListSongs.length === 0 ? (
                    <div className="text-center py-8 phish-text text-sm">
                      <StarOff className="mx-auto mb-3 text-gray-600" size={36} />
                      <p>Your wish list is empty.</p>
                      <p className="mt-1 text-xs">
                        Star songs in the browser to track your top targets.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                      {wishListSongs.map((song: any, idx: number) => {
                        const rarity = getRarityLabel(song.totalPlays ?? 0);
                        return (
                          <div
                            key={song.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-900 bg-opacity-20 border border-yellow-800 border-opacity-40"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-yellow-500 w-5 flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{song.title}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-xs px-1.5 py-0 rounded-full ${rarity.color}`}>
                                    {rarity.label}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                    <BarChart2 size={10} />
                                    {song.totalPlays ?? 0} plays
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                              <button
                                onClick={() => move(song.id, -1)}
                                disabled={idx === 0}
                                className="text-gray-500 hover:text-white disabled:opacity-20 p-0.5"
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => move(song.id, 1)}
                                disabled={idx === wishListSongs.length - 1}
                                className="text-gray-500 hover:text-white disabled:opacity-20 p-0.5"
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button
                                onClick={() => remove(song.id)}
                                className="text-gray-600 hover:text-red-400 p-0.5"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {wishListSongs.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-700 space-y-2">
                      <p className="text-xs text-gray-500 text-center">
                        Wish lists are saved locally in your browser
                      </p>
                      {activeDraft && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-500 text-white text-sm"
                          onClick={() => setLocation(`/draft-room/${activeDraft.id}`)}
                        >
                          <Zap className="mr-2" size={14} />
                          Open Draft Room
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* How scoring works */}
              <Card className="glassmorphism border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={14} />
                    Scoring Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-xs text-gray-400 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Song played</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Set opener</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encore slot</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>≥ 20 min version</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>≥ 30 min version</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>≥ 40 min version</span>
                    <span className="text-green-400 font-bold">+1 pt</span>
                  </div>
                  <p className="text-gray-600 pt-1 border-t border-gray-700">
                    Max 6 pts per song per show. Rare songs score just as well — but are harder to draft!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
