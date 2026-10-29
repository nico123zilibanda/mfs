-- Allow anonymous (logged-out) citizens to read public meeting information.
-- Only the columns needed by the public interface are exposed via a view? 
-- Here we grant SELECT on the table but RLS restricts to non-cancelled meetings.

alter table public.live_meetings enable row level security;

create policy "Public can view non-cancelled meetings"
  on public.live_meetings
  for select
  to anon, authenticated
  using (status <> 'cancelled');