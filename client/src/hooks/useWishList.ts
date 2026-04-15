import { useState, useEffect, useCallback } from "react";

// Wish list stored in localStorage: { [leagueId]: songId[] } (ordered by priority)
export function useWishList(leagueId: number | undefined) {
  const key = leagueId ? `wishlist-${leagueId}` : null;

  const [list, setList] = useState<number[]>(() => {
    if (!key) return [];
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      return [];
    }
  });

  // Re-load when leagueId changes
  useEffect(() => {
    if (!key) { setList([]); return; }
    try {
      setList(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      setList([]);
    }
  }, [key]);

  const save = useCallback(
    (next: number[]) => {
      setList(next);
      if (key) localStorage.setItem(key, JSON.stringify(next));
    },
    [key]
  );

  const toggle = useCallback(
    (id: number) =>
      save(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]),
    [list, save]
  );

  const move = useCallback(
    (id: number, dir: -1 | 1) => {
      const idx = list.indexOf(id);
      if (idx < 0) return;
      const next = [...list];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      save(next);
    },
    [list, save]
  );

  const remove = useCallback(
    (id: number) => save(list.filter((x) => x !== id)),
    [list, save]
  );

  return { list, toggle, move, remove };
}
