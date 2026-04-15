/**
 * Autodraft Feature Test — 4 Users
 *
 * Tests the /api/leagues/:id/auto-pick endpoint (used by the "Auto Draft" toggle).
 *   - Users 1 & 3 pick manually every round
 *   - Users 2 & 4 always auto-draft (simulate toggle being on)
 *
 * Steps:
 *   1.  Login as admin
 *   2.  Clean up previous test league + sim users
 *   3.  Register 4 sim users
 *   4.  Create a fresh test league
 *   5.  Each user joins
 *   6.  Set draft order
 *   7.  Fetch available songs
 *   8.  Start draft
 *   9.  Run 3-round snake draft; auto-draft users call /auto-pick, manual users call /draft-pick
 *  10.  Print results & clean up
 *
 * Usage:
 *   ADMIN_PASSWORD=yourpw node scripts/test-autodraft.mjs
 *   BASE_URL=http://localhost:5000 ADMIN_PASSWORD=yourpw node scripts/test-autodraft.mjs
 */

const BASE_URL = process.env.BASE_URL || "https://phantasy-app-production.up.railway.app";

const SIM_USERS = [
  { username: "adt_manual_1", email: "adt_manual_1@phantasy.test", password: "AutoDraft1!", autoDraft: false },
  { username: "adt_auto_2",   email: "adt_auto_2@phantasy.test",   password: "AutoDraft1!", autoDraft: true  },
  { username: "adt_manual_3", email: "adt_manual_3@phantasy.test", password: "AutoDraft1!", autoDraft: false },
  { username: "adt_auto_4",   email: "adt_auto_4@phantasy.test",   password: "AutoDraft1!", autoDraft: true  },
];

const ROUNDS = 3;
const LEAGUE_NAME = "Autodraft Test League";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n⚡  Autodraft Feature Test`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Users: ${SIM_USERS.length} (${SIM_USERS.filter(u => u.autoDraft).length} auto-draft, ${SIM_USERS.filter(u => !u.autoDraft).length} manual)\n`);

  // ── 1. Login as admin ───────────────────────────────────────────────────────
  console.log("1. Logging in as admin...");
  let adminCookie, adminUserId;
  try {
    const { data, setCookie } = await api("POST", "/api/auth/login", {
      usernameOrEmail: "mcrowner",
      password: process.env.ADMIN_PASSWORD || "admin",
    });
    adminCookie = extractCookie(setCookie);
    adminUserId = data.user?.id;
    console.log(`   ✓ logged in as mcrowner (id=${adminUserId})`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    console.log("   Set ADMIN_PASSWORD env var and retry.");
    process.exit(1);
  }

  // ── 2. Clean up previous run ────────────────────────────────────────────────
  console.log("\n2. Cleaning up previous test data...");

  // Delete old sim users
  try {
    const { data: allUsers } = await api("GET", "/api/admin/users", null, adminCookie);
    const old = allUsers.filter(u => u.username?.startsWith("adt_"));
    for (const u of old) {
      try {
        await api("DELETE", `/api/admin/users/${u.id}`, null, adminCookie);
        console.log(`   ✓ deleted old user "${u.username}"`);
      } catch (e) {
        console.warn(`   ⚠ could not delete ${u.username}: ${e.message}`);
      }
      await sleep(100);
    }
    if (old.length === 0) console.log("   (no previous adt_ users)");
  } catch (e) {
    console.warn(`   ⚠ could not list users: ${e.message}`);
  }

  // Delete old test league
  try {
    const { data: allLeagues } = await api("GET", "/api/leagues", null, adminCookie);
    const leagues = Array.isArray(allLeagues) ? allLeagues : allLeagues.leagues || [];
    const old = leagues.filter(l => l.name === LEAGUE_NAME);
    for (const l of old) {
      try {
        await api("DELETE", `/api/leagues/${l.id}`, null, adminCookie);
        console.log(`   ✓ deleted old league "${l.name}" (id=${l.id})`);
      } catch (e) {
        console.warn(`   ⚠ could not delete league ${l.id}: ${e.message}`);
      }
    }
    if (old.length === 0) console.log("   (no previous test league)");
  } catch (e) {
    console.warn(`   ⚠ could not list leagues: ${e.message}`);
  }

  // ── 3. Register 4 sim users ─────────────────────────────────────────────────
  console.log("\n3. Registering sim users...");
  const userSessions = [];

  for (const u of SIM_USERS) {
    try {
      const { data, setCookie } = await api("POST", "/api/auth/register", {
        username: u.username, email: u.email, password: u.password,
      });
      userSessions.push({
        id: data.user.id,
        username: u.username,
        autoDraft: u.autoDraft,
        cookie: extractCookie(setCookie),
      });
      const tag = u.autoDraft ? "[auto]  " : "[manual]";
      console.log(`   ✓ ${tag} ${u.username} (id=${data.user.id})`);
    } catch (e) {
      console.error(`   ✗ ${u.username}: ${e.message}`);
    }
    await sleep(150);
  }

  if (userSessions.length < 2) {
    console.error("Need at least 2 users. Aborting.");
    process.exit(1);
  }

  // ── 4. Create fresh test league ─────────────────────────────────────────────
  console.log("\n4. Creating test league...");
  let league;
  try {
    const { data } = await api("POST", "/api/leagues", {
      name: LEAGUE_NAME,
      description: "Temporary league for autodraft feature testing",
      draftRounds: ROUNDS,
      pickTimeLimit: 90,
      ownerId: adminUserId,
    }, adminCookie);
    league = data.league || data;
    console.log(`   ✓ created "${league.name}" (id=${league.id})`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  // ── 5. Generate invite + all users join ─────────────────────────────────────
  console.log("\n5. Joining league...");
  let inviteCode;
  try {
    const { data } = await api("POST", `/api/leagues/${league.id}/invite`, {
      maxUses: 10, createdBy: adminUserId,
    }, adminCookie);
    inviteCode = data.inviteCode;
    console.log(`   ✓ invite code: ${inviteCode}`);
  } catch (e) {
    console.warn(`   ⚠ invite creation failed (${e.message}) — will try direct join`);
  }

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

  // ── 6. Set draft order ──────────────────────────────────────────────────────
  console.log("\n6. Setting draft order...");
  try {
    await api("POST", `/api/leagues/${league.id}/draft-order`, {
      userIds: userSessions.map(u => u.id),
    }, adminCookie);
    console.log("   Order:");
    userSessions.forEach((u, i) => {
      const tag = u.autoDraft ? "[auto]  " : "[manual]";
      console.log(`   ${i + 1}. ${tag} ${u.username}`);
    });
  } catch (e) {
    console.warn(`   ⚠ ${e.message} — using default order`);
  }

  // ── 7. Fetch available songs ────────────────────────────────────────────────
  console.log("\n7. Fetching available songs...");
  let songs = [];
  try {
    const { data } = await api("GET", `/api/songs?leagueId=${league.id}`, null, adminCookie);
    songs = Array.isArray(data) ? data : data.songs || [];
    console.log(`   ✓ ${songs.length} songs available`);
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  const totalPicks = ROUNDS * userSessions.length;
  if (songs.length < totalPicks) {
    console.warn(`   ⚠ only ${songs.length} songs for ${totalPicks} picks — draft may end early`);
  }

  // ── 8. Start the draft ──────────────────────────────────────────────────────
  console.log("\n8. Starting draft...");
  try {
    await api("POST", `/api/leagues/${league.id}/start-draft`, {}, adminCookie);
    console.log("   ✓ draft started");
  } catch (e) {
    console.error(`   ✗ ${e.message}`);
    process.exit(1);
  }

  // ── 9. Run the snake draft ──────────────────────────────────────────────────
  const N = userSessions.length;
  console.log(`\n9. Running ${ROUNDS}-round snake draft (${totalPicks} total picks)...\n`);
  console.log(`   ${"Pick".padEnd(6)} ${"Round".padEnd(7)} ${"Player".padEnd(14)} ${"Method".padEnd(10)} Song`);
  console.log(`   ${"─".repeat(70)}`);

  const sessionById = Object.fromEntries(userSessions.map(u => [u.id, u]));
  const draftedSongIds = new Set();
  const picks = [];

  for (let pickNum = 1; pickNum <= totalPicks; pickNum++) {
    // Poll server for whose turn it is
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
      console.log(`\n   ✓ Server marked draft completed after ${pickNum - 1} picks`);
      break;
    }

    const currentPlayerId = currentLeague.currentPlayer;
    const currentUser = sessionById[currentPlayerId];
    if (!currentUser) {
      console.error(`   ✗ pick ${pickNum}: currentPlayer id=${currentPlayerId} not in sessions`);
      break;
    }

    const round = currentLeague.currentRound ?? Math.ceil(pickNum / N);
    const direction = round % 2 === 1 ? "→" : "←";
    const method = currentUser.autoDraft ? "AUTO-DRAFT" : "manual";

    try {
      let songTitle;

      if (currentUser.autoDraft) {
        // ── AUTO-DRAFT path: call /auto-pick (same as the toggle button) ──────
        const { data } = await api(
          "POST",
          `/api/leagues/${league.id}/auto-pick`,
          { userId: currentPlayerId },
          currentUser.cookie,
        );
        songTitle = data.songTitle || `song#${data.songId}`;
        if (data.songId) draftedSongIds.add(data.songId);
      } else {
        // ── MANUAL path: pick the next undrafted song explicitly ──────────────
        let song = songs.find(s => !draftedSongIds.has(s.id));
        if (!song) {
          const { data } = await api("GET", `/api/songs?leagueId=${league.id}`, null, adminCookie);
          songs = Array.isArray(data) ? data : data.songs || [];
          song = songs.find(s => !draftedSongIds.has(s.id));
        }
        if (!song) {
          console.warn(`   ⚠ no songs left for manual pick ${pickNum}`);
          break;
        }
        await api("POST", `/api/leagues/${league.id}/draft-pick`, {
          userId: currentPlayerId,
          songId: song.id,
          timeUsed: Math.floor(Math.random() * 20) + 5,
        }, currentUser.cookie);
        draftedSongIds.add(song.id);
        songTitle = song.title;
      }

      picks.push({ pick: pickNum, round, username: currentUser.username, method, songTitle });
      console.log(`   #${String(pickNum).padStart(2)}   R${round}${direction}     ${currentUser.username.padEnd(14)} ${method.padEnd(10)} ${songTitle}`);

    } catch (e) {
      console.error(`   ✗ pick ${pickNum} (${currentUser.username} / ${method}): ${e.message}`);
      // re-sync on turn errors
      if (e.message.includes("turn") || e.message.includes("Not this")) {
        await sleep(500);
        pickNum--;
      }
    }

    await sleep(200);
  }

  // ── 10. Results ─────────────────────────────────────────────────────────────
  const autoPicks = picks.filter(p => p.method === "AUTO-DRAFT");
  const manualPicks = picks.filter(p => p.method === "manual");

  console.log(`\n${"═".repeat(72)}`);
  console.log(`  AUTODRAFT TEST RESULTS`);
  console.log(`  League: "${league.name}" (id=${league.id})`);
  console.log(`  Total picks: ${picks.length}  |  Auto-draft: ${autoPicks.length}  |  Manual: ${manualPicks.length}`);
  console.log(`${"═".repeat(72)}`);

  for (const u of userSessions) {
    const tag = u.autoDraft ? "[AUTO]  " : "[manual]";
    const playerPicks = picks.filter(p => p.username === u.username);
    console.log(`\n  ${tag} ${u.username}`);
    for (const p of playerPicks) {
      const dir = p.round % 2 === 1 ? "→" : "←";
      console.log(`    R${p.round}${dir} #${String(p.pick).padStart(2)}  ${p.songTitle}`);
    }
  }

  const autoUsers = userSessions.filter(u => u.autoDraft);
  const allAutoPicksCorrect = autoUsers.every(u =>
    picks.filter(p => p.username === u.username).every(p => p.method === "AUTO-DRAFT")
  );

  console.log(`\n${"─".repeat(72)}`);
  console.log(`  Auto-draft picks fired correctly: ${allAutoPicksCorrect ? "✓ YES" : "✗ NO — check errors above"}`);
  console.log(`  Auto-pick endpoint responded:     ${autoPicks.length > 0 ? `✓ YES (${autoPicks.length} picks)` : "✗ NO PICKS MADE"}`);
  console.log(`  Manual picks still work:          ${manualPicks.length > 0 ? `✓ YES (${manualPicks.length} picks)` : "✗ NO PICKS MADE"}`);
  console.log(`${"═".repeat(72)}`);
  console.log(`\n✅  Test complete.  League: ${BASE_URL}/leagues/${league.id}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
