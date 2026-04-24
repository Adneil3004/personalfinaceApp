-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.categories(id) on delete cascade,
  type text check (type in ('income', 'expense')) default 'expense',
  icon text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicates with the same parent for the same user
  -- Coalesce parent_id to a zero uuid for nulls to make unique constraint work correctly for root categories
  unique(user_id, name, parent_id)
);

-- Create a partial unique index for root categories (where parent_id is null)
create unique index categories_root_unique_idx on public.categories (user_id, name) where parent_id is null;

-- 2. Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text check (type in ('checking', 'savings', 'cash', 'credit')) not null,
  initial_balance numeric(12,2) default 0.00 not null,
  currency text default 'DOP' not null,
  color text,
  icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete restrict not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  amount numeric(12,2) check (amount > 0) not null,
  type text check (type in ('income', 'expense')) not null,
  date date not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount_limit numeric(12,2) check (amount_limit > 0) not null,
  month smallint check (month >= 1 and month <= 12) not null,
  year integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One budget per category per month
  unique(user_id, category_id, month, year)
);

-- 5. Recurring Transactions
create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete restrict not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  amount numeric(12,2) check (amount > 0) not null,
  type text check (type in ('income', 'expense')) not null,
  frequency text check (frequency in ('monthly', 'yearly', 'weekly')) not null,
  next_execution_date date not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Enable
alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_transactions enable row level security;

-- Policies
create policy "Users can manage their own categories" on public.categories for all using (auth.uid() = user_id);
create policy "Users can manage their own accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "Users can manage their own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users can manage their own budgets" on public.budgets for all using (auth.uid() = user_id);
create policy "Users can manage their own recurring transactions" on public.recurring_transactions for all using (auth.uid() = user_id);

-- Updated_at Trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at_categories before update on public.categories for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_accounts before update on public.accounts for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_transactions before update on public.transactions for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_budgets before update on public.budgets for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_recurring before update on public.recurring_transactions for each row execute procedure public.handle_updated_at();
