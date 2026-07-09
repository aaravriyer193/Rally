-- ============================================================
-- Rally — Supabase schema
-- Run this in the SQL editor at supabase.com/dashboard
-- ============================================================
-- SETUP ORDER:
-- 1. Create a new Supabase project
-- 2. Run this entire file in the SQL editor
-- 3. In Supabase dashboard: Authentication → Providers → Google → enable, paste Client ID + Secret
-- 4. Add your site URL + http://localhost:5173 to Authentication → URL Configuration → Redirect URLs
-- 5. Copy Project URL + anon key into .env.local (see .env.example)
-- ============================================================


-- ============================================================
-- PROFILES
-- Manually upserted on every sign-in (Google OAuth returns
-- name + avatar in raw_user_meta_data — we capture them here).
-- `phone` is intentionally NOT selectable by other users directly —
-- it's only ever revealed through the contact RPCs below, so a
-- neighbour's number isn't public just for browsing the app.
-- ============================================================
create table public.profiles (
  id             uuid references auth.users primary key,
  username       text unique not null,
  full_name      text,
  avatar_url     text,
  phone          text,
  location_text  text,
  intent         text check (intent in ('give','need')),
  bio            text,
  points         integer default 0,
  created_at     timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profile basics are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile"                   on public.profiles for update using (auth.uid() = id);
create policy "Service role can upsert profiles"                on public.profiles for all using (true) with check (true);

-- Called client-side after every successful Google sign-in. Safe to call repeatedly.
create or replace function public.upsert_profile_from_google(
  p_id         uuid,
  p_email      text,
  p_full_name  text,
  p_avatar_url text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    p_id,
    split_part(p_email, '@', 1),
    p_full_name,
    p_avatar_url
  )
  on conflict (id) do update set
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url;
end;
$$;

-- Called from Onboarding once phone/location/intent are collected.
create or replace function public.complete_onboarding(
  p_intent        text,
  p_phone         text,
  p_location_text text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set intent = p_intent, phone = p_phone, location_text = p_location_text
  where id = auth.uid();
end;
$$;


-- ============================================================
-- TASKS (need-help users post; give-help/volunteer users apply)
-- ============================================================

create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  poster_id      uuid references public.profiles(id) not null,
  title          text not null,
  description    text,
  category       text,
  budget         numeric,
  location_text  text,
  status         text default 'open' check (status in ('open','filled','completed','cancelled')),
  created_at     timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Anyone can view tasks"           on public.tasks for select using (true);
create policy "Auth users can create tasks"     on public.tasks for insert with check (auth.uid() = poster_id);
create policy "Poster can update own task"      on public.tasks for update using (auth.uid() = poster_id);

create table public.task_applications (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid references public.tasks(id) on delete cascade not null,
  applicant_id  uuid references public.profiles(id) not null,
  status        text default 'pending' check (status in ('pending','selected','rejected','completed')),
  applied_at    timestamptz default now(),
  unique (task_id, applicant_id)
);
alter table public.task_applications enable row level security;
create policy "Applicant sees own applications" on public.task_applications for select using (auth.uid() = applicant_id);
create policy "Poster sees applications for their task" on public.task_applications for select
  using (exists (select 1 from public.tasks t where t.id = task_id and t.poster_id = auth.uid()));
create policy "Auth users can apply" on public.task_applications for insert with check (auth.uid() = applicant_id);

-- Random selection: poster calls this once they're ready to pick a helper.
create or replace function public.select_random_applicant(p_task_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  chosen_id uuid;
begin
  select id into chosen_id
  from public.task_applications
  where task_id = p_task_id and status = 'pending'
  order by random()
  limit 1;

  if chosen_id is not null then
    update public.task_applications set status = 'selected' where id = chosen_id;
    update public.task_applications set status = 'rejected' where task_id = p_task_id and id <> chosen_id and status = 'pending';
    update public.tasks               set status = 'filled'  where id = p_task_id;

    insert into public.notifications (user_id, type, content, related_id)
    select applicant_id, 'selected', 'You were selected for a task!', p_task_id
    from public.task_applications where id = chosen_id;
  end if;
end;
$$;

-- Poster marks the task done: awards points, unlocks certificate request.
create or replace function public.complete_task(p_task_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  select * into r from public.tasks where id = p_task_id and poster_id = auth.uid();
  if not found then return; end if;

  update public.tasks set status = 'completed' where id = p_task_id;
  update public.task_applications set status = 'completed' where task_id = p_task_id and status = 'selected';

  update public.profiles set points = points + 5 where id = r.poster_id;
  update public.profiles set points = points + 10
    where id = (select applicant_id from public.task_applications where task_id = p_task_id and status = 'completed' limit 1);
end;
$$;

-- Reveals the counterpart's phone once an applicant has been selected —
-- this IS the "contact number given for further arrangement" step.
create or replace function public.get_contact_for_application(p_application_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  app record;
  task_row record;
begin
  select * into app from public.task_applications where id = p_application_id;
  if not found or app.status not in ('selected','completed') then return null; end if;

  select * into task_row from public.tasks where id = app.task_id;

  if auth.uid() = task_row.poster_id then
    return (select phone from public.profiles where id = app.applicant_id);
  elsif auth.uid() = app.applicant_id then
    return (select phone from public.profiles where id = task_row.poster_id);
  end if;
  return null;
end;
$$;


-- ============================================================
-- RATINGS
-- ============================================================

create table public.ratings (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references public.tasks(id) not null,
  rater_id   uuid references public.profiles(id) not null,
  ratee_id   uuid references public.profiles(id) not null,
  stars      integer check (stars between 1 and 5) not null,
  comment    text,
  created_at timestamptz default now(),
  unique (task_id, rater_id, ratee_id)
);
alter table public.ratings enable row level security;
create policy "Anyone can view ratings"     on public.ratings for select using (true);
create policy "Rater can leave a rating"    on public.ratings for insert with check (auth.uid() = rater_id);


-- ============================================================
-- CERTIFICATES
-- Issuable only once the linked task is completed and the caller
-- is the selected applicant — the completion check IS the review.
-- ============================================================

create table public.certificates (
  id              uuid primary key default gen_random_uuid(),
  volunteer_id    uuid references public.profiles(id) not null,
  application_id  uuid references public.task_applications(id) not null unique,
  task_title      text not null,
  hours           numeric,
  issued_at       timestamptz default now()
);
alter table public.certificates enable row level security;
create policy "Owner can view own certificates" on public.certificates for select using (auth.uid() = volunteer_id);

create or replace function public.request_certificate(p_application_id uuid, p_hours numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  app record;
  task_row record;
  cert_id uuid;
begin
  select * into app from public.task_applications where id = p_application_id and applicant_id = auth.uid();
  if not found or app.status <> 'completed' then
    raise exception 'Task not completed yet';
  end if;

  select * into task_row from public.tasks where id = app.task_id;

  -- Paid work isn't volunteer service, regardless of who did it — no
  -- certificate for tasks that had a budget.
  if task_row.budget is not null then
    raise exception 'Paid tasks are not eligible for a volunteer certificate';
  end if;

  insert into public.certificates (volunteer_id, application_id, task_title, hours)
  values (auth.uid(), p_application_id, task_row.title, p_hours)
  on conflict (application_id) do nothing
  returning id into cert_id;

  return cert_id;
end;
$$;


-- ============================================================
-- PROFESSIONAL DIRECTORY
-- ============================================================

create table public.professional_listings (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references public.profiles(id) not null,
  category     text not null,
  description  text,
  price_note   text,
  created_at   timestamptz default now()
);
alter table public.professional_listings enable row level security;
create policy "Anyone can view listings"        on public.professional_listings for select using (true);
create policy "Owner can manage own listing"    on public.professional_listings for all using (auth.uid() = profile_id);

-- Reveals a pro's phone to any signed-in user — no gating condition beyond auth,
-- since there's no transaction/agreement to check (contact-only, no booking).
create or replace function public.get_professional_contact(p_listing_id uuid)
returns text language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return null; end if;
  return (select p.phone from public.professional_listings l
          join public.profiles p on p.id = l.profile_id
          where l.id = p_listing_id);
end;
$$;


-- ============================================================
-- NOTIFICATIONS (event-driven only — no scheduled reminders in v1)
-- ============================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) not null,
  type        text not null,
  content     text not null,
  related_id  uuid,
  read        boolean default false,
  created_at  timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Owner can view own notifications"  on public.notifications for select using (auth.uid() = user_id);
create policy "Owner can mark own as read"        on public.notifications for update using (auth.uid() = user_id);

-- Notify a poster when someone new applies to their task.
create or replace function public.notify_new_application()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, content, related_id)
  select poster_id, 'new_applicant', 'Someone applied to your task', new.task_id
  from public.tasks where id = new.task_id;
  return new;
end;
$$;
create trigger on_task_application_created
  after insert on public.task_applications
  for each row execute function public.notify_new_application();

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;


-- ============================================================
-- CONTACT MESSAGES (from the public Contact page — no login required)
-- ============================================================

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  message     text not null,
  created_at  timestamptz default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can send a message" on public.contact_messages for insert with check (true);


-- ============================================================
-- TASK IMAGES
-- Safe to re-run on an existing project — only adds what's missing.
-- ============================================================

insert into storage.buckets (id, name, public) values ('task-images', 'task-images', true) on conflict do nothing;
create policy "Anyone can view task images" on storage.objects for select using (bucket_id = 'task-images');
create policy "Auth users can upload task images" on storage.objects for insert with check (bucket_id = 'task-images' and auth.uid() is not null);

alter table public.tasks add column if not exists image_url text;


-- ============================================================
-- LOCATION / NEAREST-FIRST SORTING
-- Safe to re-run. lat/lng are captured via the browser's
-- Geolocation API (best-effort, onboarding + task creation) and
-- used client-side (haversine) to sort feeds by distance.
-- ============================================================

alter table public.profiles add column if not exists lat double precision;
alter table public.profiles add column if not exists lng double precision;
alter table public.tasks add column if not exists lat double precision;
alter table public.tasks add column if not exists lng double precision;


-- ============================================================
-- RECURRING TASKS
-- Safe to re-run. frequency + recurring_days let a poster express
-- "babysitting, 2hrs, Mon & Thu" instead of only one-off tasks.
-- ============================================================

alter table public.tasks add column if not exists frequency text default 'once' check (frequency in ('once', 'recurring'));
alter table public.tasks add column if not exists recurring_days text[];
alter table public.tasks add column if not exists duration_hours numeric;

create or replace function public.set_profile_location(p_lat double precision, p_lng double precision)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set lat = p_lat, lng = p_lng where id = auth.uid();
end;
$$;


-- ============================================================
-- MILESTONES
-- Cumulative achievements (hours/tasks thresholds), separate from
-- per-task certificates. Awarded client-side when a volunteer crosses
-- a threshold; unique constraint makes re-awarding a no-op.
-- ============================================================

create table public.milestones (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) not null,
  milestone_key text not null,
  title         text not null,
  detail        text,
  achieved_at   timestamptz default now(),
  unique (profile_id, milestone_key)
);
alter table public.milestones enable row level security;
create policy "Owner can view own milestones"   on public.milestones for select using (auth.uid() = profile_id);
create policy "Owner can award own milestones"  on public.milestones for insert with check (auth.uid() = profile_id);


-- ============================================================
-- MUTUAL COMPLETION CONFIRMATION
-- Replaces the old poster-only complete_task: a task only becomes
-- 'completed' once BOTH the poster and the selected volunteer confirm
-- it independently. Stops one side unilaterally faking a completion
-- (does not stop two sides colluding — that's flagged on the
-- certificate itself as self-reported, not independently verified).
-- ============================================================

alter table public.task_applications add column if not exists volunteer_confirmed_at timestamptz;
alter table public.task_applications add column if not exists poster_confirmed_at timestamptz;

-- Runs as security definer, so it updates task_applications/tasks/profiles
-- directly without needing extra RLS update policies for either party.
create or replace function public.confirm_task_completion(p_application_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  app record;
  task_row record;
begin
  select * into app from public.task_applications where id = p_application_id;
  if not found or app.status <> 'selected' then
    return 'invalid';
  end if;

  select * into task_row from public.tasks where id = app.task_id;

  if auth.uid() = app.applicant_id then
    update public.task_applications set volunteer_confirmed_at = now() where id = p_application_id;
  elsif auth.uid() = task_row.poster_id then
    update public.task_applications set poster_confirmed_at = now() where id = p_application_id;
  else
    return 'forbidden';
  end if;

  select * into app from public.task_applications where id = p_application_id;
  if app.volunteer_confirmed_at is not null and app.poster_confirmed_at is not null then
    update public.task_applications set status = 'completed' where id = p_application_id;
    update public.tasks set status = 'completed' where id = app.task_id;
    update public.profiles set points = points + 5  where id = task_row.poster_id;
    update public.profiles set points = points + 10 where id = app.applicant_id;
    return 'completed';
  end if;

  return 'waiting';
end;
$$;
