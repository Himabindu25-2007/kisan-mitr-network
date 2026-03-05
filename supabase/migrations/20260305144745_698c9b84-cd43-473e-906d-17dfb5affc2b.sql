-- Farmers table
CREATE TABLE public.farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  farmer_name text NOT NULL,
  father_name text,
  phone text,
  aadhaar text,
  address text,
  village text,
  district text,
  state text,
  land_size_acres numeric,
  soil_type text,
  irrigation_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view farmers" ON public.farmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update own farmers" ON public.farmers FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can delete own farmers" ON public.farmers FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Farmer crops table (past, present, future)
CREATE TABLE public.farmer_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
  crop_name text NOT NULL,
  crop_period text NOT NULL CHECK (crop_period IN ('past', 'present', 'future')),
  season text,
  year text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view farmer_crops" ON public.farmer_crops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert farmer_crops" ON public.farmer_crops FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.farmers WHERE id = farmer_id AND created_by = auth.uid())
);
CREATE POLICY "Authenticated users can update farmer_crops" ON public.farmer_crops FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.farmers WHERE id = farmer_id AND created_by = auth.uid())
);
CREATE POLICY "Authenticated users can delete farmer_crops" ON public.farmer_crops FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.farmers WHERE id = farmer_id AND created_by = auth.uid())
);