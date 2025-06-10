/*
  # Complete Raffle System Database Schema
  
  This file combines all migrations to create the complete database schema.
  Run this in your Supabase SQL Editor to create all necessary tables and relationships.
  
  1. Tables Created:
     - raffles: Main raffle information
     - raffle_numbers: Individual numbers for each raffle
     - tickets: Purchase records linking users to raffles
  
  2. Relationships:
     - raffles -> raffle_numbers (one-to-many)
     - raffles -> tickets (one-to-many)
     - tickets -> raffle_numbers (one-to-many via ticket_id)
     - All tables reference auth.users for user relationships
  
  3. Security:
     - Row Level Security enabled on all tables
     - Appropriate policies for data access and modification
  
  4. Features:
     - Automatic timestamp updates
     - Data integrity constraints
     - Proper indexing for performance
*/

-- Create status enums
DO $$ BEGIN
    CREATE TYPE raffle_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE number_status AS ENUM ('available', 'reserved', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('pix', 'credit_card');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  total_numbers integer NOT NULL CHECK (total_numbers > 0),
  image_url text NOT NULL,
  draw_date timestamptz NOT NULL,
  status raffle_status NOT NULL DEFAULT 'draft',
  is_charity boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  purchase_date timestamptz NOT NULL DEFAULT now(),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create raffle_numbers table
CREATE TABLE IF NOT EXISTS raffle_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  number integer NOT NULL,
  status number_status NOT NULL DEFAULT 'available',
  user_id uuid REFERENCES auth.users(id),
  ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_created_by ON raffles(created_by);
CREATE INDEX IF NOT EXISTS idx_raffles_draw_date ON raffles(draw_date);
CREATE INDEX IF NOT EXISTS idx_raffle_numbers_raffle_id ON raffle_numbers(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_numbers_status ON raffle_numbers(status);
CREATE INDEX IF NOT EXISTS idx_raffle_numbers_user_id ON raffle_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Enable RLS
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active raffles" ON raffles;
DROP POLICY IF EXISTS "Users can create raffles" ON raffles;
DROP POLICY IF EXISTS "Users can update own raffles" ON raffles;
DROP POLICY IF EXISTS "Anyone can view raffle numbers" ON raffle_numbers;
DROP POLICY IF EXISTS "Users can update raffle numbers they own" ON raffle_numbers;
DROP POLICY IF EXISTS "Users can insert raffle numbers" ON raffle_numbers;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Create policies for raffles
CREATE POLICY "Anyone can view active raffles"
  ON raffles
  FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Users can create raffles"
  ON raffles
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own raffles"
  ON raffles
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Create policies for raffle_numbers
CREATE POLICY "Anyone can view raffle numbers"
  ON raffle_numbers
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert raffle numbers"
  ON raffle_numbers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM raffles
      WHERE raffles.id = raffle_numbers.raffle_id
      AND raffles.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update raffle numbers they own"
  ON raffle_numbers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM raffles
      WHERE raffles.id = raffle_numbers.raffle_id
      AND raffles.created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Create policies for tickets
CREATE POLICY "Users can view their own tickets"
  ON tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON tickets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_raffles_updated_at ON raffles;
DROP TRIGGER IF EXISTS update_raffle_numbers_updated_at ON raffle_numbers;
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

-- Create updated_at triggers
CREATE TRIGGER update_raffles_updated_at
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_raffle_numbers_updated_at
  BEFORE UPDATE ON raffle_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want sample data

/*
-- Insert a sample user (you'll need to replace with actual user ID from auth.users)
-- INSERT INTO raffles (title, description, price, total_numbers, image_url, draw_date, status, is_charity, created_by)
-- VALUES (
--   'Sample Raffle',
--   'This is a sample raffle for testing purposes',
--   10.00,
--   100,
--   'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg',
--   now() + interval '7 days',
--   'active',
--   false,
--   'your-user-id-here'
-- );
*/