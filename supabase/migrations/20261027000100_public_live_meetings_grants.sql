-- Grant schema usage and column-level SELECT to public roles.
-- RLS remains enabled and filters cancelled meetings.

grant usage on schema public to anon, authenticated;

grant select (
  id,
  title,
  description,
  scheduled_start_at,
  status,
  room_name,
  started_at,
  ended_at,
  created_at,
  updated_at
) on table public.live_meetings to anon, authenticated;