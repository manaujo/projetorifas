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

  2. Security
    - Enable RLS on `raffles` table
    - Add policies for CRUD operations
*/

-- Create status enum
CREATE TYPE raffle_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

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

-- Enable RLS
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create updated_at trigger
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