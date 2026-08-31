-- ================================================================
-- TRISAKAY: Municipality of Gonzaga Tricycle Booking System
-- Supabase Database Schema & RLS Security Policies
-- ================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
  barangay TEXT NOT NULL,
  toda_name TEXT,
  plate_number TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for mobile lookup
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);

-- 2. TODAS TABLE
CREATE TABLE IF NOT EXISTS public.todas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  zone_barangay TEXT NOT NULL,
  president_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  active_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FARE ROUTES TABLE (Gonzaga LGU Matrix)
CREATE TABLE IF NOT EXISTS public.fare_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  from_barangay TEXT NOT NULL,
  to_barangay TEXT NOT NULL,
  regular_rate NUMERIC NOT NULL,
  discount_rate NUMERIC NOT NULL,
  csu_rate NUMERIC,
  is_special_arrangement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  passenger_name TEXT NOT NULL,
  passenger_mobile TEXT NOT NULL,
  pickup_barangay TEXT NOT NULL,
  pickup_landmark TEXT NOT NULL,
  destination_barangay TEXT NOT NULL,
  destination_landmark TEXT NOT NULL,
  passengers_count INT DEFAULT 1,
  discount_type TEXT DEFAULT 'regular' CHECK (discount_type IN ('regular', 'senior_student_pwd')),
  special_notes TEXT,
  estimated_fare NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING_FOR_DRIVER' CHECK (
    status IN ('WAITING_FOR_DRIVER', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'PASSENGER_PICKED_UP', 'COMPLETED', 'CANCELLED')
  ),
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  driver_name TEXT,
  driver_mobile TEXT,
  toda_name TEXT,
  plate_number TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  rating_comment TEXT,
  is_waiting_alert BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index for real-time booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON public.bookings(passenger_id);

-- 5. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reporter_role TEXT NOT NULL,
  target_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_name TEXT NOT NULL,
  target_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  fuel_surge_multiplier NUMERIC DEFAULT 1.0,
  max_passengers_capacity INT DEFAULT 8,
  allow_waiting_feature BOOLEAN DEFAULT TRUE,
  office_location TEXT DEFAULT 'Municipality of Gonzaga, Cagayan',
  contact_email TEXT DEFAULT 'trisakay@gmail.com',
  contact_number TEXT DEFAULT '09628039440'
);

-- Enable Realtime for live driver notification alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Seed Initial Gonzaga Fare Matrix
INSERT INTO public.fare_routes (route, from_barangay, to_barangay, regular_rate, discount_rate, csu_rate) VALUES
('Pateng to Poblacion', 'Pateng', 'Poblacion', 25, 20, 25),
('Rebecca to Poblacion', 'Rebecca', 'Poblacion', 25, 20, 30),
('Isca to Poblacion', 'Isca', 'Poblacion', 35, 25, 35),
('Cabanbanan Sur to Poblacion', 'Cabanbanan Sur', 'Poblacion', 30, 25, 30),
('Cabanbanan Norte to Poblacion', 'Cabanbanan Norte', 'Poblacion', 40, 25, 35),
('Casitan to Poblacion', 'Casitan', 'Poblacion', 35, 30, 35),
('Calayan to Poblacion', 'Calayan', 'Poblacion', 25, 20, 30),
('Callao to Poblacion', 'Callao', 'Poblacion', 30, 20, 30),
('Minanga to Poblacion', 'Minanga', 'Poblacion', 30, 20, 30),
('Batangan to Poblacion', 'Batangan', 'Poblacion', 25, 20, 30),
('Magrafil to Poblacion', 'Magrafil', 'Poblacion', 50, 45, 50),
('Magrafil to Highway', 'Magrafil', 'Highway', 25, 20, 30),
('Sta. Isabel / Tapel to Poblacion', 'Sta. Isabel', 'Poblacion', 40, 30, 35),
('Tapel to Poblacion', 'Tapel', 'Poblacion', 30, 25, 30),
('San Francisco / Ipil to Poblacion', 'San Francisco', 'Poblacion', 50, 40, 45),
('Ipil to Poblacion', 'Ipil', 'Poblacion', 35, 30, 40),
('Ipil (Burattok)', 'Ipil', 'Burattok', 45, 45, 45),
('Ipil - Amunitan', 'Ipil', 'Amunitan', 20, 15, 20),
('Amunitan - Poblacion', 'Amunitan', 'Poblacion', 40, 30, 40),
('Cabiraoan (Mid)', 'Cabiraoan', 'Poblacion', 30, 20, 30),
('Baua - Amunitan', 'Baua', 'Amunitan', 20, 15, 20),
('Baua - Cabiraoan', 'Baua', 'Cabiraoan', 35, 25, 35),
('Baua - Sta. Cruz', 'Baua', 'Sta. Cruz', 20, 15, 20),
('Baua - San Jose', 'Baua', 'San Jose', 20, 15, 20),
('Within Baua Barangay', 'Baua', 'Baua', 20, 15, 20),
('Poblacion Within Zone', 'Poblacion', 'Poblacion', 20, 15, 20),
('Sta. Clara (Purok 1 & 2) to Poblacion', 'Sta. Clara (Purok 1 & 2)', 'Poblacion', 35, 30, 35),
('Sta. Clara (Purok 3,4,5,6) to Poblacion', 'Sta. Clara (Purok 3, 4, 5, 6)', 'Poblacion', 40, 35, 40)
ON CONFLICT DO NOTHING;

-- Seed Initial TODAs
INSERT INTO public.todas (name, zone_barangay, president_name, contact_number, active_count) VALUES
('GOTODA (Gonzaga Tricycle Operators & Drivers Association)', 'Poblacion', 'Manuel Valenzuela', '09173338899', 45),
('BAUATODA (Baua Drivers Association)', 'Baua', 'Arnel Castillo', '09204445566', 22),
('CALAYANTODA (Calayan Transport Group)', 'Calayan', 'Roberto Aguinaldo', '09187771122', 18),
('PATENGTODA (Pateng Tricycle Group)', 'Pateng', 'Danilo Pascual', '09278889900', 15)
ON CONFLICT DO NOTHING;

-- Seed Initial System Settings
INSERT INTO public.system_settings (id, fuel_surge_multiplier, max_passengers_capacity, allow_waiting_feature) 
VALUES (1, 1.0, 8, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. ENABLE REALTIME BROADCASTING FOR BOOKINGS & USERS
-- ================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;


