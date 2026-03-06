
-- Complaints table
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  village text,
  district text,
  mobile text,
  problem_type text NOT NULL,
  description text,
  photo_url text,
  status text NOT NULL DEFAULT 'Pending',
  priority text NOT NULL DEFAULT 'Normal',
  admin_notes text,
  submitted_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disease Reports table
CREATE TABLE public.disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text,
  crop_name text NOT NULL,
  disease_name text NOT NULL,
  confidence numeric,
  severity text,
  description text,
  photo_url text,
  pesticide_recommended text,
  status text NOT NULL DEFAULT 'Pending',
  admin_notes text,
  submitted_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS for disease_reports
ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view disease_reports" ON public.disease_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert disease_reports" ON public.disease_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admins can update disease_reports" ON public.disease_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
