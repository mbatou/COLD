-- COLD — timer pause/resume support
-- Adds columns the host uses to pause the countdown for everyone.

alter table public.rooms
  add column if not exists paused boolean not null default false,
  add column if not exists paused_at timestamptz,
  add column if not exists pause_total_ms bigint not null default 0;

-- Allow members (not just the host) to leave: deleting your own membership row.
drop policy if exists room_players_delete on public.room_players;
create policy room_players_delete on public.room_players
  for delete to authenticated
  using (user_id = auth.uid());
