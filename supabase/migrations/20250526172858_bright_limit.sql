/*
  # Add tickets table and fix relationships

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `raffle_id` (uuid, references raffles)
      - `user_id` (uuid, references auth.users)
      - `purchase_date` (timestamptz)
      - `payment_status` (enum)
      - `payment_method` (enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add foreign key from raffle_numbers to tickets
    - Add payment related enums
    - Update RLS policies

  3. Security
    - Enable RLS on tickets table
    - Add policies for CRUD operations
*/

-- Create payment related enums
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card');

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

-- Add foreign key to raffle_numbers
ALTER TABLE raffle_numbers
  ADD CONSTRAINT raffle_numbers_ticket_id_fkey
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
  ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger for tickets
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();