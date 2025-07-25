import { Music, Plus, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState, useMemo } from "react";

interface DraftedSong {
  id: number;
  songId: number;
  points: number;
  status: string;
  draftedAt: string;
  song: {
    id: number;
    title: string;
    category: string | null;
    rarityScore: number | null;
    lastPlayed: string | null;
    totalPlays: number | null;
  };
}

interface DraftedSongsProps {
  draftedSongs: DraftedSong[];
  onDraftClick?: () => void;
}

export default function DraftedSongs({ draftedSongs, onDraftClick }: DraftedSongsProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pointsFilter, setPointsFilter] = useState<string>("all");
  
  // Get unique categories from drafted songs
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(draftedSongs?.map(song => song.song?.category).filter(Boolean))];
    return uniqueCategories;
  }, [draftedSongs]);

  // Filter songs based on selected filters
  const filteredSongs = useMemo(() => {
    if (!draftedSongs) return [];
    
    return draftedSongs.filter(song => {
      // Category filter
      if (categoryFilter !== "all" && song.song?.category !== categoryFilter) {
        return false;
      }
      
      // Points filter
      if (pointsFilter !== "all") {
        const points = song.points || 0;
        switch (pointsFilter) {
          case "0":
            return points === 0;
          case "1-2":
            return points >= 1 && points <= 2;
          case "3-4":
            return points >= 3 && points <= 4;
          case "5+":
            return points >= 5;
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [draftedSongs, categoryFilter, pointsFilter]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setPointsFilter("all");
  };

  const hasActiveFilters = categoryFilter !== "all" || pointsFilter !== "all";

  return (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">My Drafted Songs</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            className="gradient-button px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            onClick={onDraftClick}
          >
            <Plus className="mr-2" size={16} />
            Draft Song
          </Button>
          
          {/* Filter Controls */}
          <div className="flex space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32 border-gray-600 bg-transparent">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category || ""}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={pointsFilter} onValueChange={setPointsFilter}>
              <SelectTrigger className="w-28 border-gray-600 bg-transparent">
                <SelectValue placeholder="Points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Points</SelectItem>
                <SelectItem value="0">0 pts</SelectItem>
                <SelectItem value="1-2">1-2 pts</SelectItem>
                <SelectItem value="3-4">3-4 pts</SelectItem>
                <SelectItem value="5+">5+ pts</SelectItem>
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
                className="border-gray-600 text-xs hover:border-green-500 transition-colors"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">
              Showing {filteredSongs.length} of {draftedSongs?.length || 0} songs
            </span>
            <Button variant="link" onClick={clearFilters} className="text-green-400 text-xs p-0 h-auto">
              Clear all filters
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {filteredSongs?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b phish-border">
                <th className="pb-3 font-medium phish-text">Song</th>
                <th className="pb-3 font-medium phish-text">Plays (24 months)</th>
                <th className="pb-3 font-medium phish-text">Points</th>
                <th className="pb-3 font-medium phish-text">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSongs.map((draft) => (
                <tr key={draft.id} className="hover:bg-black hover:bg-opacity-30 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <Music className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{draft.song?.title}</p>
                        <p className="text-sm phish-text">{draft.song?.category || "Unknown"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 phish-text">
                    {draft.song?.totalPlays || 0}
                  </td>
                  <td className="py-4 font-bold phish-gold">{draft.points || 0}</td>
                  <td className="py-4">
                    <Badge className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                      ACTIVE
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : hasActiveFilters ? (
          <div className="text-center py-12 phish-text">
            <Filter className="mx-auto mb-4" size={48} />
            <p className="text-lg mb-2">No songs match your filters</p>
            <p>Try adjusting your filter criteria or <button onClick={clearFilters} className="text-green-400 underline">clear all filters</button></p>
          </div>
        ) : (
          <div className="text-center py-12 phish-text">
            <Music className="mx-auto mb-4" size={48} />
            <p className="text-lg mb-2">No songs drafted yet</p>
            <p>Start building your lineup by drafting your first song!</p>
          </div>
        )}
      </div>
    </div>
  );
}
