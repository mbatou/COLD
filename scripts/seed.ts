/**
 * Seed the default board for a Case #0044 room.
 *
 * Usage:
 *   npx tsx scripts/seed.ts <ROOM_ID>
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * The same layout is also inserted automatically at room creation via
 * `seedRowsForRoom` (data/cases/0044/board.ts).
 */
import { createClient } from "@supabase/supabase-js";
import { seedRowsForRoom } from "../data/cases/0044/board";

async function main() {
  const roomId = process.argv[2];
  if (!roomId) {
    console.error("Usage: tsx scripts/seed.ts <ROOM_ID>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const rows = seedRowsForRoom(roomId);

  const { error } = await supabase.from("board_items").insert(rows);
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} board items into room ${roomId}.`);
}

main();
