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

-- 1.1 DRIVER LOCATIONS (Real-time tracking)
create table public.driver_locations (
  driver_id uuid references public.drivers(id) primary key,
  lat float8 not null,
  lng float8 not null,
  rotation float8 default 0,
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
  
  status text default 'searching', -- searching, accepted, arrived, in_progress, completed, cancelled_passenger, cancelled_driver, no_drivers
  
  pickup_address text,
  pickup_lat float8,
  pickup_lng float8,
  
  dropoff_address text,
  dropoff_lat float8,
  dropoff_lng float8,
  
  estimated_distance float8,
  estimated_duration float8,
  estimated_price numeric,
  final_price numeric,
  
  surge_multiplier numeric default 1.0,
  payment_method text default 'cash', -- cash, card, wallet
  
  passenger_rating int,
  driver_rating int,
  tip_amount numeric default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- 4. PRICE CONFIGS TABLE
create table public.price_configs (
  id uuid default uuid_generate_v4() primary key,
  vehicle_type text not null,
  base_fare numeric not null,
  price_per_km numeric not null,
  price_per_min numeric not null,
  minimum_fare numeric not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. TRUSTED CONTACTS TABLE
create table public.trusted_contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. SAVED PLACES TABLE
create table public.saved_places (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  address text not null,
  lat float8 not null,
  lng float8 not null,
  type text default 'other', -- home, work, other
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. MESSAGES TABLE (Chat)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) not null,
  sender_id uuid references auth.users not null,
  sender_type text not null, -- driver, passenger
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  body text not null,
  type text default 'general',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. RLS POLICIES (Expanded)
alter table public.drivers enable row level security;
alter table public.passengers enable row level security;
alter table public.trips enable row level security;
alter table public.price_configs enable row level security;
alter table public.trusted_contacts enable row level security;
alter table public.saved_places enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Drivers policies
create policy "Drivers can view their own profile" on public.drivers for select using ( auth.uid() = id );
create policy "Drivers can update their own profile" on public.drivers for update using ( auth.uid() = id );
create policy "Everyone can view active drivers" on public.drivers for select using ( true );
create policy "System can insert drivers" on public.drivers for insert with check (auth.uid() = id);

-- Passengers policies
create policy "Passengers can view own profile" on public.passengers for select using ( auth.uid() = id );
create policy "Passengers can update own profile" on public.passengers for update using ( auth.uid() = id );
create policy "Users can insert own profile" on public.passengers for insert with check (auth.uid() = id);

-- Trips policies
create policy "Users can view their own trips" on public.trips for select using ( auth.uid() = passenger_id or auth.uid() = driver_id );
create policy "Passengers can create trips" on public.trips for insert with check ( auth.uid() = passenger_id );
create policy "Users can update their trips" on public.trips for update using ( auth.uid() = passenger_id or auth.uid() = driver_id );

-- Price Configs (Read-only for users)
create policy "Everyone can view price configs" on public.price_configs for select using ( true );

-- Trusted Contacts
create policy "Users can manage their own trusted contacts" on public.trusted_contacts 
  for all using ( auth.uid() = user_id );

-- Saved Places
create policy "Users can manage their own saved places" on public.saved_places 
  for all using ( auth.uid() = user_id );

-- Messages
create policy "Users can view messages of their trips" on public.messages 
  for select using ( 
    exists (
      select 1 from public.trips 
      where id = trip_id and (passenger_id = auth.uid() or driver_id = auth.uid())
    )
  );
create policy "Users can send messages to their trips" on public.messages 
  for insert with check ( 
    exists (
      select 1 from public.trips 
      where id = trip_id and (passenger_id = auth.uid() or driver_id = auth.uid())
    )
  );

-- Notifications
create policy "Users can view their own notifications" on public.notifications 
  for select using ( auth.uid() = user_id );
create policy "Users can update their own notifications" on public.notifications 
  for update using ( auth.uid() = user_id );

-- Driver Locations
create policy "Drivers can update their own location" on public.driver_locations 
  for all using ( auth.uid() = driver_id );
create policy "Everyone can view driver locations" on public.driver_locations 
  for select using ( true );

-- 10. SAMPLE DATA
insert into public.price_configs (vehicle_type, base_fare, price_per_km, price_per_min, minimum_fare)
values 
  ('economy', 15000, 3000, 500, 20000),
  ('moto', 8000, 2000, 300, 12000),
  ('comfort', 20000, 4000, 800, 25000),
  ('xl', 30000, 5000, 1000, 40000),
  ('women', 20000, 4000, 800, 25000);
