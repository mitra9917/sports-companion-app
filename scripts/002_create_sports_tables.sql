-- Create workout sessions table
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_name text not null,
  sport_type text not null,
  duration_minutes integer not null,
  intensity text check (intensity in ('low', 'moderate', 'high', 'extreme')),
  calories_burned integer,
  distance_km numeric(6,2),
  notes text,
  session_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create goals table
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_type text check (goal_type in ('weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'other')),
  title text not null,
  description text,
  target_value numeric(10,2),
  current_value numeric(10,2),
  unit text,
  target_date date,
  status text check (status in ('active', 'completed', 'paused', 'cancelled')) default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_type text not null,
  title text not null,
  description text,
  icon text,
  earned_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.workout_sessions enable row level security;
alter table public.goals enable row level security;
alter table public.achievements enable row level security;

-- Workout sessions policies
create policy "workout_sessions_select_own"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions for update
  using (auth.uid() = user_id);

create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);

-- Goals policies
create policy "goals_select_own"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "goals_insert_own"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "goals_update_own"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "goals_delete_own"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Achievements policies
create policy "achievements_select_own"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "achievements_insert_own"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index if not exists workout_sessions_user_id_idx on public.workout_sessions(user_id);
create index if not exists workout_sessions_date_idx on public.workout_sessions(session_date desc);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists achievements_user_id_idx on public.achievements(user_id);
