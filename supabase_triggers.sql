-- Función para manejar nuevos usuarios automáticamente
-- Esta función se ejecuta cada vez que se crea un usuario en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Si el rol es 'driver' (Conductor)
  if (new.raw_user_meta_data->>'role' = 'driver') then
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
      license_expiry
    )
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'vehicle_type',
      new.raw_user_meta_data->>'vehicle_make',
      new.raw_user_meta_data->>'vehicle_model',
      new.raw_user_meta_data->>'vehicle_year',
      new.raw_user_meta_data->>'vehicle_color',
      new.raw_user_meta_data->>'vehicle_plate',
      new.raw_user_meta_data->>'license_number',
      new.raw_user_meta_data->>'license_expiry'
    );
    
  -- Si el rol es 'passenger' (Pasajero)
  elsif (new.raw_user_meta_data->>'role' = 'passenger') then
    insert into public.passengers (
      id,
      email,
      phone,
      full_name
    )
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'full_name'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que dispara la función anterior
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
