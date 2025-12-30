CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'Viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  customer_id text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  contact_person text,
  contact_number text,
  email_address text,
  industry_type text,
  registration_date date DEFAULT CURRENT_DATE NOT NULL,
  customer_status text DEFAULT 'Active' NOT NULL,
  address_line text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers (customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email_address);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (customer_status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (customer_name);

CREATE TABLE IF NOT EXISTS cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  case_id text NOT NULL UNIQUE,
  case_title text NOT NULL,
  client_id uuid NOT NULL,
  case_type text NOT NULL,
  case_status text DEFAULT 'Open' NOT NULL,
  assigned_attorney text,
  filing_date date,
  court_name text,
  hearing_date date,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON cases (case_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases (client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (case_status);
CREATE INDEX IF NOT EXISTS idx_cases_attorney ON cases (assigned_attorney);
CREATE INDEX IF NOT EXISTS idx_cases_type ON cases (case_type);

CREATE TABLE IF NOT EXISTS engagements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  engagement_id text NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  engagement_type text NOT NULL,
  engagement_date date NOT NULL,
  engagement_outcome text,
  contact_person text,
  recorded_by text NOT NULL,
  engagement_channel text NOT NULL,
  engagement_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_engagements_engagement_id ON engagements (engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagements_client_id ON engagements (client_id);
CREATE INDEX IF NOT EXISTS idx_engagements_type ON engagements (engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_date ON engagements (engagement_date);
CREATE INDEX IF NOT EXISTS idx_engagements_outcome ON engagements (engagement_outcome);