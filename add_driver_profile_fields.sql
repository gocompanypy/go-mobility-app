-- Agrega columnas para el perfil avanzado del conductor
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_xp int DEFAULT 0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS level text DEFAULT 'BRONCE'; -- BRONCE, PLATA, ORO, DIAMANTE
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS next_level_xp int DEFAULT 1000;

-- Notificar a PostgREST para recargar el esquema
NOTIFY pgrst, 'reload schema';
