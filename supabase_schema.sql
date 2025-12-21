-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. DRIVERS TABLE
create table public.drivers (
  id uuid references auth.users not null primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  vehicle_type text, -- economy, comfort, moto, etc.
  vehicle_color text,
  vehicle_make text,
  vehicle_model text,
  vehicle_plate text,
  vehicle_year text,
  license_number text,
  license_expiry text,
  
  status text default 'pending', -- pending, active, suspended, blocked
  is_online boolean default false,
  is_available boolean default true,
  rating numeric default 5.0,
  total_trips int default 0,
  
  balance numeric default 0, -- Current wallet balance
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. PASSENGERS TABLE
create table public.passengers (
  id uuid references auth.users not null primary key,
  email text,
  phone text,
  full_name text,
  
  rating numeric default 5.0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TRIPS TABLE
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  passenger_id uuid references public.passengers(id),
  driver_id uuid references public.drivers(id),
  
  status text default 'requested', -- requested, accepted, in_progress, completed, cancelled
  
  origin_address text,
  origin_lat float8,
  origin_lng float8,
  
  destination_address text,
  destination_lat float8,
  destination_lng float8,
  
  distance_km float8,
  duration_min float8,
  
  price numeric,
  payment_method text default 'cash', -- cash, card, wallet
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- 4. RLS POLICIES (Simple for now)
alter table public.drivers enable row level security;
alter table public.passengers enable row level security;
alter table public.trips enable row level security;

-- Drivers policies
create policy "Drivers can view their own profile"
  on public.drivers for select
  using ( auth.uid() = id );

create policy "Drivers can update their own profile"
  on public.drivers for update
  using ( auth.uid() = id );
  
create policy "Everyone can view active drivers/vehicles"
  on public.drivers for select
  using ( true ); -- Simplify for passenger view

create policy "System/Admin can insert drivers"
  on public.drivers for insert
  with check (auth.uid() = id);

-- Passengers policies
create policy "Passengers can view own profile"
  on public.passengers for select
  using ( auth.uid() = id );

create policy "Passengers can update own profile"
  on public.passengers for update
  using ( auth.uid() = id );
  
create policy "Users can insert own profile"
  on public.passengers for insert
  with check (auth.uid() = id);

-- Trips policies
create policy "Users can view their own trips"
  on public.trips for select
  using ( auth.uid() = passenger_id or auth.uid() = driver_id );

create policy "Passengers can create trips"
  on public.trips for insert
  with check ( auth.uid() = passenger_id );

create policy "Drivers/Passengers can update their trips"
  on public.trips for update
  using ( auth.uid() = passenger_id or auth.uid() = driver_id );
