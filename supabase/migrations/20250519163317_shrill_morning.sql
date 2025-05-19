/*
  # Create raffles schema

  1. New Tables
    - `raffles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `total_numbers` (integer)
      - `image_url` (text)
      - `draw_date` (timestamptz)
      - `status` (enum)
      - `is_charity` (boolean)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `raffle_numbers`
      - `id` (uuid, primary key)
      - `raffle_id` (uuid, references raffles)
      - `number` (integer)
      - `status` (enum)
      - `user_id` (uuid, references auth.users)
      - `ticket_id` (uuid, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create status enums
CREATE TYPE raffle_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE number_status AS ENUM ('available', 'reserved', 'sold');

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

-- Create raffle_numbers table
CREATE TABLE IF NOT EXISTS raffle_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  number integer NOT NULL,
  status number_status NOT NULL DEFAULT 'available',
  user_id uuid REFERENCES auth.users(id),
  ticket_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, number)
);

-- Enable RLS
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_numbers ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_raffles_updated_at
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_raffle_numbers_updated_at
  BEFORE UPDATE ON raffle_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();