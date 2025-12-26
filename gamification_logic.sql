-- Function to safely add XP and handle leveling up atomically
CREATE OR REPLACE FUNCTION add_driver_xp(p_driver_id uuid, p_xp_amount int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp int;
    v_current_level text;
    v_new_xp int;
    v_new_level text;
    v_next_level_xp int;
    v_did_level_up boolean := false;
    v_level_thresholds jsonb := '{
        "BRONCE": 1000,
        "PLATA": 3000,
        "ORO": 8000,
        "DIAMANTE": 999999
    }'; 
BEGIN
    -- 1. Get current state
    SELECT current_xp, level INTO v_current_xp, v_current_level
    FROM public.drivers
    WHERE id = p_driver_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Driver not found';
    END IF;

    -- Handle nulls
    IF v_current_xp IS NULL THEN v_current_xp := 0; END IF;
    IF v_current_level IS NULL THEN v_current_level := 'BRONCE'; END IF;

    -- 2. Calculate New XP
    v_new_xp := v_current_xp + p_xp_amount;

    -- 3. Determine New Level
    IF v_new_xp < (v_level_thresholds->>'BRONCE')::int THEN
        v_new_level := 'BRONCE';
        v_next_level_xp := (v_level_thresholds->>'BRONCE')::int;
    ELSIF v_new_xp < (v_level_thresholds->>'PLATA')::int THEN
        v_new_level := 'PLATA';
        v_next_level_xp := (v_level_thresholds->>'PLATA')::int;
    ELSIF v_new_xp < (v_level_thresholds->>'ORO')::int THEN
        v_new_level := 'ORO';
        v_next_level_xp := (v_level_thresholds->>'ORO')::int;
    ELSE
        v_new_level := 'DIAMANTE';
        v_next_level_xp := (v_level_thresholds->>'DIAMANTE')::int; -- Cap or next tier
    END IF;

    -- Check if leveled up (only if level changed AND index increased, but simple inequality works for tiers)
    -- Simplification: If string changed, likely leveled up or down. Assuming up for now.
    IF v_new_level != v_current_level THEN
        v_did_level_up := true;
    END IF;

    -- 4. Update Driver
    UPDATE public.drivers
    SET 
        current_xp = v_new_xp,
        level = v_new_level,
        next_level_xp = v_next_level_xp
    WHERE id = p_driver_id;

    -- 5. Return Result
    RETURN json_build_object(
        'new_xp', v_new_xp,
        'new_level', v_new_level,
        'did_level_up', v_did_level_up,
        'next_level_xp', v_next_level_xp
    );
END;
$$;

-- Grant execute to authenticated users (drivers need to trigger this via app logic, or arguably service role only)
-- Ideally this is called via RPC by the driver client
GRANT EXECUTE ON FUNCTION add_driver_xp TO authenticated;
GRANT EXECUTE ON FUNCTION add_driver_xp TO service_role;
