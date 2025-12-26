-- 1. Asegurar que existe la tabla Passengers (Faltaba en tu script)
create table if not exists public.passengers (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  full_name text,
  rating numeric default 5.0,
  total_trips int default 0,
  created_at timestamptz default now()
);

-- Políticas de seguridad para Passengers
alter table public.passengers enable row level security;
create policy "Public passengers view" on public.passengers for select using (true);
create policy "User update own passenger profile" on public.passengers for update using (auth.uid() = id);

-- 2. Asegurar que existe la tabla Drivers (Por si acaso)
create table if not exists public.drivers (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  vehicle_color text,
  vehicle_plate text,
  license_number text,
  license_expiry text,
  status text default 'pending',
  is_online boolean default false,
  is_available boolean default true,
  wallet_balance numeric default 0,
  rating numeric default 5.0,
  total_trips int default 0,
  created_at timestamptz default now()
);

-- 3. Actualizar la función del Trigger para usar correctamente los metadatos
-- IMPORTANTE: Cambié 'new.phone' por coalesce(new.phone, metadata->>'phone') para asegurar que se guarde el teléfono
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
      new.email, -- Supabase Auth email
      coalesce(new.phone, metadata->>'phone'), -- Prioridad al teléfono de auth, sino metadata
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
      coalesce(new.phone, metadata->>'phone'), -- Correccíon importante aquí también
      coalesce(metadata->>'full_name', ''),
      5.0,
      now()
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- 4. Reiniciar el Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
