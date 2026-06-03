-- COLD — Case Room schema
-- Tables, RLS policies, and Realtime configuration.

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  case_id     text not null,
  host_id     uuid references auth.users,
  status      text not null default 'waiting',
  phase       int not null default 1,
  started_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.room_players (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms on delete cascade,
  user_id       uuid references auth.users,
  display_name  text not null,
  role          text not null default 'investigator',
  private_clue  jsonb,
  joined_at     timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.board_items (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid references public.rooms on delete cascade,
  type        text not null,
  content     jsonb not null,
  pos_x       float not null,
  pos_y       float not null,
  rotation    float not null default 0,
  created_by  uuid references auth.users,
  created_at  timestamptz not null default now()
);

create table if not exists public.board_strings (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms on delete cascade,
  from_item_id  uuid references public.board_items on delete cascade,
  to_item_id    uuid references public.board_items on delete cascade,
  color         text not null default 'red',
  created_by    uuid references auth.users
);

create table if not exists public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms on delete cascade,
  user_id       uuid references auth.users,
  display_name  text not null,
  content       text not null,
  is_private    boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.interview_messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid references public.rooms on delete cascade,
  suspect_id  text not null,
  role        text not null,
  content     text not null,
  asked_by    uuid references auth.users,
  created_at  timestamptz not null default now()
);

create table if not exists public.theories (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms on delete cascade,
  user_id       uuid references auth.users,
  display_name  text not null,
  suspect_id    text not null,
  reasoning     text not null default '',
  is_correct    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_room_players_room on public.room_players(room_id);
create index if not exists idx_board_items_room on public.board_items(room_id);
create index if not exists idx_board_strings_room on public.board_strings(room_id);
create index if not exists idx_chat_messages_room on public.chat_messages(room_id);
create index if not exists idx_interview_messages_room on public.interview_messages(room_id);
create index if not exists idx_theories_room on public.theories(room_id);

-- =========================================================================
-- Membership helper (SECURITY DEFINER avoids recursive RLS on room_players)
-- =========================================================================

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.room_players
    where room_id = p_room_id and user_id = auth.uid()
  );
$$;

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.rooms              enable row level security;
alter table public.room_players        enable row level security;
alter table public.board_items         enable row level security;
alter table public.board_strings       enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.interview_messages  enable row level security;
alter table public.theories            enable row level security;

-- rooms ------------------------------------------------------------------
-- Anyone authenticated may look up a room by code (needed to join).
drop policy if exists rooms_select on public.rooms;
create policy rooms_select on public.rooms
  for select to authenticated using (true);

drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms
  for insert to authenticated with check (host_id = auth.uid());

-- Only the host (a member) may mutate room state.
drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms
  for update to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

-- room_players -----------------------------------------------------------
drop policy if exists room_players_select on public.room_players;
create policy room_players_select on public.room_players
  for select to authenticated
  using (public.is_room_member(room_id) or user_id = auth.uid());

drop policy if exists room_players_insert on public.room_players;
create policy room_players_insert on public.room_players
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists room_players_update on public.room_players;
create policy room_players_update on public.room_players
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Generic member-scoped policy applied to the collaborative tables.
-- board_items ------------------------------------------------------------
drop policy if exists board_items_all on public.board_items;
create policy board_items_all on public.board_items
  for all to authenticated
  using (public.is_room_member(room_id))
  with check (public.is_room_member(room_id));

-- board_strings ----------------------------------------------------------
drop policy if exists board_strings_all on public.board_strings;
create policy board_strings_all on public.board_strings
  for all to authenticated
  using (public.is_room_member(room_id))
  with check (public.is_room_member(room_id));

-- chat_messages ----------------------------------------------------------
drop policy if exists chat_messages_select on public.chat_messages;
create policy chat_messages_select on public.chat_messages
  for select to authenticated
  using (
    public.is_room_member(room_id)
    and (is_private = false or user_id = auth.uid())
  );

drop policy if exists chat_messages_insert on public.chat_messages;
create policy chat_messages_insert on public.chat_messages
  for insert to authenticated
  with check (public.is_room_member(room_id) and user_id = auth.uid());

-- interview_messages -----------------------------------------------------
drop policy if exists interview_messages_select on public.interview_messages;
create policy interview_messages_select on public.interview_messages
  for select to authenticated
  using (public.is_room_member(room_id));

drop policy if exists interview_messages_insert on public.interview_messages;
create policy interview_messages_insert on public.interview_messages
  for insert to authenticated
  with check (public.is_room_member(room_id));

-- theories ---------------------------------------------------------------
drop policy if exists theories_select on public.theories;
create policy theories_select on public.theories
  for select to authenticated using (public.is_room_member(room_id));

drop policy if exists theories_insert on public.theories;
create policy theories_insert on public.theories
  for insert to authenticated
  with check (public.is_room_member(room_id) and user_id = auth.uid());

-- =========================================================================
-- Realtime
-- =========================================================================

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.board_items;
alter publication supabase_realtime add table public.board_strings;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.interview_messages;
alter publication supabase_realtime add table public.theories;
