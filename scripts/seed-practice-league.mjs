/**
 * Phantasy Practice League Seed Script
 *
 * Steps:
 *   1.  Login as mcrowner (admin)
 *   2.  Delete all previous practice leagues and users
 *   3.  Register 8 fresh practice users
 *   4.  Create a new league
 *   5.  Generate an invite code
 *   6.  Each user "accepts" the invite and joins the league
 *   7.  Set a randomized draft order
 *   8.  Start the draft
 *   9.  Run the snake draft — always poll currentPlayer from the server
 *  10.  Score every phish.in show from Jun 20 – Sep 21 2025
 *  11.  Print leaderboard + detail
 *
 * Usage:
 *   ADMIN_PASSWORD=yourpw node scripts/seed-practice-league.mjs
 *   BASE_URL=http://localhost:10000 ADMIN_PASSWORD=yourpw node scripts/seed-practice-league.mjs
 */

const BASE_URL = process.env.BASE_URL || "https://phantasy-app-production.up.railway.app";

const FAKE_USERS = [
  { username: "practice_trey",    email: "practice_trey@phantasy.test",    password: "Practice123!" },
  { username: "practice_page",    email: "practice_page@phantasy.test",    password: "Practice123!" },
  { username: "practice_mike",    email: "practice_mike@phantasy.test",    password: "Practice123!" },
  { username: "practice_fish",    email: "practice_fish@phantasy.test",    password: "Practice123!" },
  { username: "practice_wilson",  email: "practice_wilson@phantasy.test",  password: "Practice123!" },
  { username: "practice_lizards", email: "practice_lizards@phantasy.test", password: "Practice123!" },
  { username: "practice_harpua",  email: "practice_harpua@phantasy.test",  password: "Practice123!" },
  { username: "practice_reba",    email: "practice_reba@phantasy.test",    password: "Practice123!" },
];

// ─── helpers ────────────────────────────────────────────────────────────────

async function api(method, path, body, cookie) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return { data, setCookie: res.headers.get("set-cookie") };
}

function extractCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  return setCookieHeader.split(";")[0];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mirrors the server scoring logic
function calculatePoints(track) {
  let pts = 1;
  if (track.isSetOpener) pts += 1;
  if (track.isEncore)    pts += 1;
  const mins = (track.durationSeconds || 0) / 60;
  if (mins >= 20) pts += 1;
  if (mins >= 30) pts += 1;
  if (mins >= 40) pts += 1;
  return pts;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🎸  Phantasy Practice League Seed Script`);
  console.log(`   Target: ${BASE_URL}\n`);

  // ── 1. Login as admin ──────────────────────────────────────────────────────
  console.log("1. Logging in as mcrowner...");
  let adminCookie, adminUserId;
  try {
    const { data, setCookie } = await api("POST", "/api/auth/login", {
      usernameOrEmail: "mcrowner",
      password: process.env.ADMIN_PASSWORD || "admin",
    });
    adminCookie = extractCookie(setCookie);
    adminUserId = data.user?.id;
    console.log(`   ✓ logged in (id=${adminUserId})`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    console.log("   Set ADMIN_PASSWORD env var and retry.");
    process.exit(1);
  }

  // ── 2a. Delete previous practice leagues ──────────────────────────────────
  console.log("\n2a. Cleaning up old practice leagues...");
  try {
    const { data: allLeagues } = await api("GET", "/api/admin/leagues", null, adminCookie);
    const practiceLeagues = allLeagues.filter(l => l.name?.startsWith("Practice League"));
    for (const league of practiceLeagues) {
      try {
        await api("DELETE", `/api/leagues/${league.id}`, null, adminCookie);
        console.log(`   ✓ deleted league "${league.name}" (id=${league.id})`);
      } catch (e) {
        console.warn(`   ⚠ could not delete league ${league.id}: ${e.message}`);
      }
      await sleep(100);
    }
    if (practiceLeagues.length === 0) console.log("   (no practice leagues found)");
  } catch (e) {
    console.warn(`   ⚠ ${e.message}`);
  }

  // ── 2b. Delete previous practice users ────────────────────────────────────
  console.log("\n2b. Cleaning up old practice users...");
  try {
    const { data: allUsers } = await api("GET", "/api/admin/users", null, adminCookie);
    const practiceUsers = allUsers.filter(u => u.username?.startsWith("practice_"));
    for (const u of practiceUsers) {
      try {
        await api("DELETE", `/api/admin/users/${u.id}`, null, adminCookie);
        console.log(`   ✓ deleted user "${u.username}" (id=${u.id})`);
      } catch (e) {
        console.warn(`   ⚠ could not delete user ${u.id}: ${e.message}`);
      }
      await sleep(100);
    }
    if (practiceUsers.length === 0) console.log("   (no practice users found)");
  } catch (e) {
    console.warn(`   ⚠ ${e.message}`);
  }

  // ── 3. Register 8 fresh practice users ────────────────────────────────────
  console.log("\n3. Registering 8 practice users...");
  const userSessions = []; // { id, username, cookie }

  for (const u of FAKE_USERS) {
    try {
      const { data, setCookie } = await api("POST", "/api/auth/register", u);
      userSessions.push({ id: data.user.id, username: u.username, cookie: extractCookie(setCookie) });
      console.log(`   ✓ registered ${u.username} (id=${data.user.id})`);
    } catch (e) {
      if (e.message.includes("already") || e.message.includes("409") || e.message.includes("exists")) {
        try {
          const { data, setCookie } = await api("POST", "/api/auth/login", {
            usernameOrEmail: u.username, password: u.password,
          });
          userSessions.push({ id: data.user.id, username: u.username, cookie: extractCookie(setCookie) });
          console.log(`   ↩ ${u.username} already exists — logged in (id=${data.user.id})`);
        } catch (e2) {
          console.error(`   ✗ ${u.username}: ${e2.message}`);
        }
      } else {
        console.error(`   ✗ ${u.username}: ${e.message}`);
      }
    }
    await sleep(150);
  }

  if (userSessions.length < 2) {
    console.error("Need at least 2 users. Aborting.");
    process.exit(1);
  }

  // ── 4. Create league ───────────────────────────────────────────────────────
  console.log("\n4. Creating practice league (owned by mcrowner)...");
  let league;
  try {
    const { data } = await api("POST", "/api/leagues", {
      name: "Practice League – Summer 2025",
      description: "Auto-generated practice run for scoring demo",
      isPublic: true,
      maxPlayers: 8,
      ownerId: adminUserId,
      seasonStartDate: new Date("2025-06-20").toISOString(),
      seasonEndDate:   new Date("2025-09-21").toISOString(),
      draftRounds: 10,
      pickTimeLimit: 90,
    }, adminCookie);
    league = data;
    console.log(`   ✓ league created: "${league.name}" (id=${league.id})`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  // ── 5. Generate an invite code ─────────────────────────────────────────────
  console.log("\n5. Generating invite code...");
  let inviteCode;
  try {
    const { data } = await api("POST", `/api/leagues/${league.id}/invite`, {
      maxUses: 8,
      createdBy: adminUserId,
    }, adminCookie);
    inviteCode = data.inviteCode;
    console.log(`   ✓ invite code: ${inviteCode}`);
    console.log(`   ✓ join URL:    ${BASE_URL}/join/${inviteCode}`);
  } catch (e) {
    console.warn(`   ⚠ could not create invite (${e.message}) — will use direct join instead`);
  }

  // ── 6. Each user accepts invite and joins the league ──────────────────────
  // The invite URL above is what a real user would click. For the script we
  // use the direct join endpoint (no auth required) so session cookie timing
  // is not a concern.
  console.log("\n6. Players accepting invite and joining league...");
  for (const u of userSessions) {
    try {
      await api("POST", `/api/leagues/${league.id}/join`, { userId: u.id }, u.cookie);
      console.log(`   ✓ ${u.username} joined`);
    } catch (e) {
      if (e.message.includes("already")) {
        console.log(`   ↩ ${u.username} already a member`);
      } else {
        console.warn(`   ⚠ ${u.username}: ${e.message}`);
      }
    }
    await sleep(100);
  }

  // ── 7. Randomize draft order ───────────────────────────────────────────────
  console.log("\n7. Setting randomized draft order...");
  const shuffled = shuffle(userSessions);
  try {
    await api("POST", `/api/leagues/${league.id}/draft-order`, {
      userIds: shuffled.map(u => u.id),
    }, adminCookie);
    console.log("   Snake draft order:");
    shuffled.forEach((u, i) => console.log(`   ${i + 1}. ${u.username}`));
  } catch (e) {
    console.warn(`   ⚠ ${e.message} — draft order may use default`);
  }

  // ── 8. Fetch available songs ───────────────────────────────────────────────
  console.log("\n8. Fetching available songs...");
  let songs = [];
  try {
    const { data } = await api("GET", `/api/songs?leagueId=${league.id}`, null, adminCookie);
    songs = Array.isArray(data) ? data : data.songs || [];
    console.log(`   ✓ ${songs.length} songs available`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  const ROUNDS = 10;
  const N = userSessions.length;
  const totalPicks = ROUNDS * N;

  if (songs.length < totalPicks) {
    console.warn(`   ⚠ Only ${songs.length} songs for ${totalPicks} total picks`);
  }

  // ── 9. Start the draft ─────────────────────────────────────────────────────
  console.log("\n9. Starting draft...");
  try {
    await api("POST", `/api/leagues/${league.id}/start-draft`, {}, adminCookie);
    console.log("   ✓ draft started");
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  // ── 10. Run the snake draft ────────────────────────────────────────────────
  // KEY: always poll currentPlayer from server — never pre-compute order.
  // The server now handles snake direction, so we just follow along.
  console.log(`\n10. Running snake draft (${ROUNDS} rounds × ${N} players = ${totalPicks} picks)...\n`);

  const draftedSongIds = new Set();
  const picks = []; // { pick, round, username, songTitle, songId }
  // Build id→session map for fast lookup
  const sessionById = Object.fromEntries(userSessions.map(u => [u.id, u]));

  for (let pickNum = 1; pickNum <= totalPicks; pickNum++) {
    // Poll server for current player
    let currentLeague;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { data } = await api("GET", `/api/leagues/${league.id}/draft-status`, null, adminCookie);
        currentLeague = data;
        break;
      } catch (e) {
        if (attempt === 4) throw e;
        await sleep(500);
      }
    }

    if (currentLeague.draftStatus === "completed") {
      console.log(`\n   ✓ Draft completed after ${pickNum - 1} picks`);
      break;
    }

    const currentPlayerId = currentLeague.currentPlayer;
    const currentUser = sessionById[currentPlayerId];
    if (!currentUser) {
      console.error(`   ✗ pick ${pickNum}: currentPlayer id=${currentPlayerId} not in our sessions`);
      break;
    }

    const round = currentLeague.currentRound ?? Math.ceil(pickNum / N);
    const direction = round % 2 === 1 ? "→" : "←";

    // Pick the next available song (refresh list if needed)
    let song = songs.find(s => !draftedSongIds.has(s.id));
    if (!song) {
      // Re-fetch available songs
      try {
        const { data } = await api("GET", `/api/songs?leagueId=${league.id}`, null, adminCookie);
        const fresh = Array.isArray(data) ? data : data.songs || [];
        songs = fresh;
        song = songs.find(s => !draftedSongIds.has(s.id));
      } catch {}
    }
    if (!song) {
      console.warn(`   ⚠ No more songs at pick ${pickNum}`);
      break;
    }

    try {
      await api("POST", `/api/leagues/${league.id}/draft-pick`, {
        userId: currentPlayerId,
        songId: song.id,
        timeUsed: Math.floor(Math.random() * 20) + 3,
      }, currentUser.cookie);

      draftedSongIds.add(song.id);
      picks.push({ pick: pickNum, round, username: currentUser.username, songTitle: song.title, songId: song.id });
      console.log(`   R${round}${direction} #${String(pickNum).padStart(2)} ${currentUser.username.padEnd(20)} → ${song.title}`);
    } catch (e) {
      console.error(`   ✗ pick ${pickNum} (${currentUser.username}): ${e.message}`);
      // If it's a "not your turn" error, re-sync and continue
      if (e.message.includes("not your turn") || e.message.includes("turn")) {
        console.log("   ↺ Re-syncing with server...");
        await sleep(500);
        pickNum--; // retry this pick number
      }
    }

    await sleep(150);
  }

  console.log(`\n   ✓ Draft complete — ${picks.length} total picks`);

  // ── 11. Score against actual phish.in shows ────────────────────────────────
  console.log("\n11. Scoring against phish.in shows (Jun 20 – Sep 21, 2025)...");

  let shows = [];
  try {
    const { data } = await api("GET", "/api/admin/concerts", null, adminCookie);
    const start = new Date("2025-06-20");
    const end   = new Date("2025-09-21");
    shows = (Array.isArray(data) ? data : []).filter(s => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
    console.log(`   ✓ ${shows.length} shows in season range`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
  }

  // Build lookup: title.toLowerCase() → [username, ...]
  const pickedByTitle = {};
  for (const p of picks) {
    const key = p.songTitle.toLowerCase();
    if (!pickedByTitle[key]) pickedByTitle[key] = [];
    pickedByTitle[key].push(p.username);
  }

  // Tally per player
  const scores = {};
  for (const u of userSessions) scores[u.username] = { points: 0, hits: [] };

  let showsScored = 0;
  for (const show of shows) {
    const showDate = new Date(show.date).toISOString().split("T")[0];
    let tracks = [];
    try {
      const res = await fetch(`https://phish.in/api/v2/shows/${showDate}`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        const rawTracks = d.tracks || [];

        // First position per set
        const firstPosBySet = {};
        for (const t of rawTracks) {
          const s = t.set_name || "Set 1";
          if (!(s in firstPosBySet) || t.position < firstPosBySet[s]) firstPosBySet[s] = t.position;
        }

        tracks = rawTracks.map(t => {
          const setKey = t.set_name || "Set 1";
          const isEncore = setKey.toLowerCase().includes("encore");
          return {
            title: t.title,
            setName: setKey,
            position: t.position,
            durationSeconds: t.duration ? Math.round(t.duration / 1000) : 0,
            isSetOpener: !isEncore && t.position === firstPosBySet[setKey],
            isEncore,
          };
        });
        showsScored++;
      }
    } catch {}

    for (const track of tracks) {
      const players = pickedByTitle[track.title.toLowerCase()] || [];
      if (players.length === 0) continue;
      const pts = calculatePoints(track);
      for (const username of players) {
        if (scores[username]) {
          scores[username].points += pts;
          scores[username].hits.push({
            song: track.title,
            show: showDate,
            set: track.setName,
            pts,
            mins: Math.round(track.durationSeconds / 60),
            isSetOpener: track.isSetOpener,
            isEncore: track.isEncore,
          });
        }
      }
    }
    await sleep(250);
  }
  console.log(`   ✓ scored ${showsScored}/${shows.length} shows`);

  // ── 12. Results ────────────────────────────────────────────────────────────
  const W = 72;
  console.log("\n" + "═".repeat(W));
  console.log("  PRACTICE LEAGUE RESULTS — Summer 2025");
  console.log(`  "${league.name}" (id=${league.id})`);
  console.log(`  Season: Jun 20 – Sep 21, 2025  |  ${showsScored} shows scored`);
  console.log("═".repeat(W));

  const ranked = Object.entries(scores)
    .sort(([, a], [, b]) => b.points - a.points)
    .map(([username, s], i) => ({ rank: i + 1, username, ...s }));

  // Leaderboard
  console.log("\n  LEADERBOARD");
  console.log("  " + "─".repeat(50));
  for (const r of ranked) {
    console.log(`  ${String(r.rank).padStart(2)}. ${r.username.padEnd(22)} ${String(r.points).padStart(4)} pts  (${r.hits.length} song plays)`);
  }

  // Draft board by player
  console.log("\n  DRAFT BOARD  (✓ = played this season)");
  console.log("  " + "─".repeat(50));

  const picksByPlayer = {};
  for (const p of picks) {
    if (!picksByPlayer[p.username]) picksByPlayer[p.username] = [];
    picksByPlayer[p.username].push(p);
  }

  // Show draft board in snake order so it reads like the actual draft
  const snakeHeader = [];
  for (let r = 1; r <= ROUNDS; r++) {
    const roundOrder = r % 2 === 1 ? shuffled : [...shuffled].reverse();
    for (const u of roundOrder) {
      snakeHeader.push({ round: r, username: u.username });
    }
  }

  for (const r of ranked) {
    const playerPicks = picksByPlayer[r.username] || [];
    const playerHits = r.hits;
    const hitSongs = new Set(playerHits.map(h => h.song.toLowerCase()));

    console.log(`\n  ${r.username} — ${r.points} pts`);
    for (const p of playerPicks) {
      const hitCount = playerHits.filter(h => h.song.toLowerCase() === p.songTitle.toLowerCase()).length;
      const totalPts = playerHits
        .filter(h => h.song.toLowerCase() === p.songTitle.toLowerCase())
        .reduce((sum, h) => sum + h.pts, 0);
      const played = hitSongs.has(p.songTitle.toLowerCase());
      const direction = p.round % 2 === 1 ? "→" : "←";
      const marker = played ? `✓ ${totalPts}pts (${hitCount}x)` : "—";
      console.log(`    R${p.round}${direction} #${String(p.pick).padStart(2)}  ${p.songTitle.padEnd(35)} ${marker}`);
    }
  }

  // Top moments
  console.log("\n  TOP SCORING MOMENTS");
  console.log("  " + "─".repeat(50));
  const allHits = ranked.flatMap(r => r.hits.map(h => ({ ...h, username: r.username })));
  allHits.sort((a, b) => b.pts - a.pts);
  for (const h of allHits.slice(0, 20)) {
    const tags = [
      h.isSetOpener ? "SET OPENER" : null,
      h.isEncore    ? "ENCORE"     : null,
      h.mins >= 20  ? `${h.mins}min` : null,
    ].filter(Boolean).join(", ");
    console.log(`  ${h.username.padEnd(22)} ${h.song.padEnd(30)} ${h.show}  ${h.pts}pts  ${tags}`);
  }

  console.log("\n" + "═".repeat(W));
  console.log(`\n✅  Done!  View league at ${BASE_URL}/leagues/${league.id}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
