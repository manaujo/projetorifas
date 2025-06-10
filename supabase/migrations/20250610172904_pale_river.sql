/*
  # Add missing fields to raffles table
  
  1. Changes
    - Add pix_key column to raffles table
    - Add buyer_info column to tickets table
    - Update policies to handle new fields
*/

-- Add pix_key to raffles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'raffles' AND column_name = 'pix_key') THEN
        ALTER TABLE raffles ADD COLUMN pix_key text;
    END IF;
END $$;

-- Add buyer_info to tickets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tickets' AND column_name = 'buyer_info') THEN
        ALTER TABLE tickets ADD COLUMN buyer_info jsonb;
    END IF;
END $$;

-- Update raffles table policies to include pix_key
DROP POLICY IF EXISTS "Users can update own raffles" ON raffles;
CREATE POLICY "Users can update own raffles"
  ON raffles
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Update tickets table policies to include buyer_info
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id LIKE 'guest-%');

-- Allow raffle creators to view tickets for their raffles
CREATE POLICY "Raffle creators can view tickets for their raffles"
  ON tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM raffles
      WHERE raffles.id = tickets.raffle_id
      AND raffles.created_by = auth.uid()
    )
    OR auth.uid() = user_id
  );