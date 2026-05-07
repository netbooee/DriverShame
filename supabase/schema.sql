-- Run this in your Supabase SQL editor after creating the project

-- Enable pg_trgm first (required for partial plate search)
create extension if not exists pg_trgm;

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plate_state text not null,
  plate_number text not null,
  vehicle_make text,
  vehicle_model text,
  vehicle_color text,
  report_type   text check (report_type in ('driving', 'parking')),
  offense_types text[] default '{}',
  notes         text,
  photo_url     text,
  reporter_email text
);

-- ─── Storage bucket for report photos ────────────────────────────────────────
-- Run these AFTER creating the bucket named "report-photos" in the dashboard
-- (Storage → New bucket → name: report-photos → Public: ON)

-- Allow authenticated users to upload their own photos
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read all photos
create policy "Authenticated users can view photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'report-photos');

-- Index for fast partial plate searches
create index if not exists reports_plate_number_idx
  on public.reports using gin (plate_number gin_trgm_ops);

-- RLS: every logged-in user can read all reports
alter table public.reports enable row level security;

create policy "Anyone authenticated can view reports"
  on public.reports for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid() = user_id);
