-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other')),
  height_cm numeric(5,2),
  sport_type text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced', 'professional')),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create BMI records table for tracking body metrics
create table if not exists public.bmi_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  weight_kg numeric(5,2) not null,
  height_cm numeric(5,2) not null,
  bmi numeric(4,2) generated always as (weight_kg / ((height_cm / 100) * (height_cm / 100))) stored,
  body_fat_percentage numeric(4,2),
  muscle_mass_kg numeric(5,2),
  recorded_at timestamp with time zone default now(),
  notes text
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.bmi_records enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- BMI records policies
create policy "bmi_records_select_own"
  on public.bmi_records for select
  using (auth.uid() = user_id);

create policy "bmi_records_insert_own"
  on public.bmi_records for insert
  with check (auth.uid() = user_id);

create policy "bmi_records_update_own"
  on public.bmi_records for update
  using (auth.uid() = user_id);

create policy "bmi_records_delete_own"
  on public.bmi_records for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists bmi_records_user_id_idx on public.bmi_records(user_id);
create index if not exists bmi_records_recorded_at_idx on public.bmi_records(recorded_at desc);
