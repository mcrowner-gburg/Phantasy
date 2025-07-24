import { Music, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
  const getRarityColor = (score: number) => {
    if (score >= 100) return "bg-red-500 text-white";
    if (score >= 75) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-black";
  };

  const getRarityLabel = (score: number) => {
    if (score >= 100) return "RARE";
    if (score >= 75) return "HIGH";
    return "MED";
  };

  return (
    <div className="glassmorphism rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">My Drafted Songs</h3>
        <div className="flex space-x-3">
          <Button 
            className="gradient-button px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            onClick={onDraftClick}
          >
            <Plus className="mr-2" size={16} />
            Draft Song
          </Button>
          <Button variant="outline" className="border-gray-600 px-4 py-2 rounded-lg text-sm hover:border-green-500 transition-colors">
            <Filter className="mr-2" size={16} />
            Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {draftedSongs?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b phish-border">
                <th className="pb-3 font-medium phish-text">Song</th>
                <th className="pb-3 font-medium phish-text">Last Played</th>
                <th className="pb-3 font-medium phish-text">Rarity Score</th>
                <th className="pb-3 font-medium phish-text">Points</th>
                <th className="pb-3 font-medium phish-text">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {draftedSongs.map((draft) => (
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
                    {draft.song?.lastPlayed ? format(new Date(draft.song.lastPlayed), "MMM dd, yyyy") : "Never"}
                  </td>
                  <td className="py-4">
                    <Badge className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityColor(draft.song?.rarityScore || 0)}`}>
                      {getRarityLabel(draft.song?.rarityScore || 0)}
                    </Badge>
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
