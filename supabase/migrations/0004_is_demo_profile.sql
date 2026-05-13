-- Add is_demo flag to profiles so demo accounts can be identified and cleaned up.
alter table public.profiles add column if not exists is_demo boolean default false;
