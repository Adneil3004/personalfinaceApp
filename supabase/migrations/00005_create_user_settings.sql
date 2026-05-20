-- Create user_settings table
create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  daily_operating_limit numeric(12,2) default 456.49 not null,
  daily_discretionary_limit numeric(12,2) default 193.33 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policies
create policy "Users can manage their own settings" on public.user_settings for all using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger handle_updated_at_user_settings before update on public.user_settings for each row execute procedure public.handle_updated_at();
