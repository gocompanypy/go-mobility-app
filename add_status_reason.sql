-- Add status_reason column to drivers table if it doesn't exist
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'drivers' and column_name = 'status_reason') then
        alter table public.drivers add column status_reason text;
    end if;
end $$;
