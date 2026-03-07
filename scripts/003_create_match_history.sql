-- Create match_predictions table
create table if not exists public.match_predictions_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  p1_height numeric(5,2),
  p1_weight numeric(5,2),
  p1_age integer,
  p1_experience integer,
  p2_height numeric(5,2),
  p2_weight numeric(5,2),
  p2_age integer,
  p2_experience integer,
  predicted_winner text,
  confidence_percentage numeric(5,2),
  ai_mode text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.match_predictions_history enable row level security;

-- Policies
create policy "match_predictions_history_select_own"
  on public.match_predictions_history for select
  using (auth.uid() = user_id);

create policy "match_predictions_history_insert_own"
  on public.match_predictions_history for insert
  with check (auth.uid() = user_id);

-- Index
create index if not exists match_predictions_user_id_idx on public.match_predictions_history(user_id);
