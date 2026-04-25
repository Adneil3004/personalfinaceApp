-- Add is_active column to recurring_transactions for soft delete support
alter table public.recurring_transactions
add column if not exists is_active boolean default true not null;

-- Create index for querying active recurrences
create index if not exists idx_recurring_transactions_active 
on public.recurring_transactions (user_id, is_active) 
where is_active = true;