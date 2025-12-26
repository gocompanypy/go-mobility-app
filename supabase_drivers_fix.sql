-- 1. ASEGURAR ESTRUCTURA DE LA TABLA DRIVERS (Agrega columnas faltantes)
alter table public.drivers add column if not exists first_name text;
alter table public.drivers add column if not exists last_name text;
alter table public.drivers add column if not exists vehicle_type text;
alter table public.drivers add column if not exists vehicle_make text;
alter table public.drivers add column if not exists vehicle_model text;
alter table public.drivers add column if not exists vehicle_year text;
alter table public.drivers add column if not exists vehicle_color text;
alter table public.drivers add column if not exists vehicle_plate text;
alter table public.drivers add column if not exists license_number text;
alter table public.drivers add column if not exists license_expiry text;
alter table public.drivers add column if not exists wallet_balance numeric default 0;
alter table public.drivers add column if not exists rating numeric default 5.0;
alter table public.drivers add column if not exists total_trips int default 0;
alter table public.drivers add column if not exists is_online boolean default false;
alter table public.drivers add column if not exists is_available boolean default true;
alter table public.drivers add column if not exists status text default 'pending';

-- 2. ASEGURAR TABLA PASSENGERS
create table if not exists public.passengers (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  full_name text,
  rating numeric default 5.0,
  total_trips int default 0,
  created_at timestamptz default now()
);

-- Políticas de seguridad para Passengers (con DROP previo para evitar errores)
alter table public.passengers enable row level security;

drop policy if exists "Public passengers view" on public.passengers;
create policy "Public passengers view" on public.passengers for select using (true);

drop policy if exists "User update own passenger profile" on public.passengers;
create policy "User update own passenger profile" on public.passengers for update using (auth.uid() = id);

-- 3. ACTUALIZAR EL TRIGGER (Para que detecte bien el teléfono y los datos)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  metadata jsonb;
begin
  metadata := new.raw_user_meta_data;
  
  -- Lógica para CONDUCTORES (Drivers)
  if (metadata->>'role' = 'driver') then
    insert into public.drivers (
      id,
      email,
      phone,
      first_name,
      last_name,
      vehicle_type,
      vehicle_make,
      vehicle_model,
      vehicle_year,
      vehicle_color,
      vehicle_plate,
      license_number,
      license_expiry,
      status, 
      is_online,
      wallet_balance,
      rating,
      total_trips,
      created_at
    )
    values (
      new.id,
      new.email,
      coalesce(new.phone, metadata->>'phone'),
      coalesce(metadata->>'first_name', ''),
      coalesce(metadata->>'last_name', ''),
      coalesce(metadata->>'vehicle_type', 'economy'),
      coalesce(metadata->>'vehicle_make', ''),
      coalesce(metadata->>'vehicle_model', ''),
      coalesce(metadata->>'vehicle_year', '2024'),
      coalesce(metadata->>'vehicle_color', ''),
      coalesce(metadata->>'vehicle_plate', ''),
      coalesce(metadata->>'license_number', ''),
      coalesce(metadata->>'license_expiry', ''),
      'pending', 
      false,
      0, 
      5.0,
      0,
      now()
    )
    on conflict (id) do nothing;
  
  -- Lógica para PASAJEROS (Passengers)
  elsif (metadata->>'role' = 'passenger') then
    insert into public.passengers (
      id,
      email,
      phone,
      full_name,
      rating,
      created_at
    )
    values (
      new.id,
      new.email,
      coalesce(new.phone, metadata->>'phone'),
      coalesce(metadata->>'full_name', ''),
      5.0,
      now()
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- 4. REINICIAR EL TRIGGER
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
