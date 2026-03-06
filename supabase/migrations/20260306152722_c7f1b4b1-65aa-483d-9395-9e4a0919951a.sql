
-- Loan Schemes table
CREATE TABLE public.loan_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_name text NOT NULL,
  provider text NOT NULL,
  max_amount numeric NOT NULL DEFAULT 0,
  interest_rate numeric NOT NULL DEFAULT 0,
  eligibility text,
  description text,
  loan_type text NOT NULL DEFAULT 'Crop Loan',
  processing_fee numeric DEFAULT 0,
  tenure_months integer DEFAULT 12,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Loan Applications table
CREATE TABLE public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
  loan_scheme_id uuid REFERENCES public.loan_schemes(id) ON DELETE CASCADE NOT NULL,
  amount_requested numeric NOT NULL,
  tenure_months integer NOT NULL DEFAULT 12,
  emi numeric,
  status text NOT NULL DEFAULT 'Pending',
  applied_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Loan Status Tracking table
CREATE TABLE public.loan_status_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.loan_applications(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL,
  notes text,
  updated_at timestamptz DEFAULT now()
);

-- RLS for loan_schemes (public read, admin write)
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view loan schemes" ON public.loan_schemes FOR SELECT USING (true);
CREATE POLICY "Admins can manage loan schemes" ON public.loan_schemes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS for loan_applications
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view loan applications" ON public.loan_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert loan applications" ON public.loan_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applied_by);
CREATE POLICY "Admins can update loan applications" ON public.loan_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = applied_by);

-- RLS for loan_status_tracking
ALTER TABLE public.loan_status_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view loan tracking" ON public.loan_status_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert loan tracking" ON public.loan_status_tracking FOR INSERT TO authenticated WITH CHECK (true);

-- Seed default loan schemes
INSERT INTO public.loan_schemes (loan_name, provider, max_amount, interest_rate, eligibility, description, loan_type, tenure_months) VALUES
  ('Crop Loan', 'State Bank of India', 300000, 4, 'Farmers with cultivable land', 'Short-term loan for crop cultivation expenses', 'Crop Loan', 12),
  ('PM Kisan Credit Card', 'Government of India', 300000, 3, 'Registered farmers with KCC', 'Flexible credit for all farming needs under PM scheme', 'Kisan Credit Card', 12),
  ('Tractor Loan', 'NABARD', 800000, 7.5, 'Farmers needing mechanization', 'Dedicated financing for tractor purchase', 'Tractor Loan', 60),
  ('Equipment Loan', 'Bank of Baroda', 1000000, 8, 'Farmers with equipment needs', 'Purchase tractors, harvesters & machinery', 'Equipment Loan', 48),
  ('Irrigation Loan', 'Canara Bank', 500000, 6, 'Farmers with irrigation needs', 'Setup drip, sprinkler or bore well systems', 'Irrigation Loan', 36),
  ('Dairy Loan', 'Punjab National Bank', 700000, 7, 'Farmers interested in dairy', 'Start or expand dairy farming operations', 'Dairy Loan', 48),
  ('Government Subsidy Loan', 'Government of India', 500000, 2, 'Small & marginal farmers', 'Subsidized loan under govt welfare schemes', 'Government Subsidy Loan', 24);
