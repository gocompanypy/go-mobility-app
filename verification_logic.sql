-- Function to get public driver profile for verification
-- Accessible by everyone (public), returns only safe data
CREATE OR REPLACE FUNCTION get_driver_public_profile(p_driver_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_color TEXT,
    vehicle_plate TEXT,
    level TEXT,
    rating NUMERIC,
    trip_count INTEGER,
    joined_at TIMESTAMPTZ,
    is_active BOOLEAN
) 
SECURITY DEFINER -- Runs with privileges of creator (admin) to bypass RLS for public read
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.avatar_url,
        d.vehicle_make,
        d.vehicle_model,
        d.vehicle_color,
        d.vehicle_plate,
        d.level,
        d.rating,
        d.total_trips as trip_count,
        d.created_at as joined_at,
        (d.status = 'active') as is_active
    FROM public.drivers d
    WHERE d.id = p_driver_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to anonymous users (for public scanning) and authenticated users
GRANT EXECUTE ON FUNCTION get_driver_public_profile(UUID) TO anon, authenticated, service_role;
