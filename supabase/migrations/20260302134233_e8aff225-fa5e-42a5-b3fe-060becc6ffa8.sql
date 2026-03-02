
-- Create wild_animals table
CREATE TABLE public.wild_animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  animal_name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  forest_zone TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  officer_contact TEXT NOT NULL,
  initial_latitude DOUBLE PRECISION NOT NULL,
  initial_longitude DOUBLE PRECISION NOT NULL,
  current_latitude DOUBLE PRECISION NOT NULL,
  current_longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'Safe',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location history table for heatmap
CREATE TABLE public.animal_location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.wild_animals(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for tracking ID
CREATE SEQUENCE public.wildlife_tracking_seq START 1;

-- Function to generate tracking ID
CREATE OR REPLACE FUNCTION public.generate_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  seq_val INT;
BEGIN
  prefix := CASE NEW.animal_type
    WHEN 'Elephant' THEN 'ELE'
    WHEN 'Tiger' THEN 'TIG'
    WHEN 'Lion' THEN 'LIO'
    WHEN 'Leopard' THEN 'LEO'
    WHEN 'Deer' THEN 'DER'
    WHEN 'Bear' THEN 'BER'
    WHEN 'Wolf' THEN 'WLF'
    WHEN 'Rhino' THEN 'RHI'
    WHEN 'Cheetah' THEN 'CHE'
    ELSE 'WLD'
  END;
  seq_val := nextval('public.wildlife_tracking_seq');
  NEW.tracking_id := prefix || '-' || LPAD(seq_val::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_tracking_id
BEFORE INSERT ON public.wild_animals
FOR EACH ROW
EXECUTE FUNCTION public.generate_tracking_id();

-- Enable RLS
ALTER TABLE public.wild_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_location_history ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (forest department app, no auth required for demo)
CREATE POLICY "Allow public read wild_animals" ON public.wild_animals FOR SELECT USING (true);
CREATE POLICY "Allow public insert wild_animals" ON public.wild_animals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update wild_animals" ON public.wild_animals FOR UPDATE USING (true);

CREATE POLICY "Allow public read location_history" ON public.animal_location_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert location_history" ON public.animal_location_history FOR INSERT WITH CHECK (true);

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.wild_animals;

-- Index for performance
CREATE INDEX idx_location_history_animal ON public.animal_location_history(animal_id);
CREATE INDEX idx_wild_animals_status ON public.wild_animals(status);
