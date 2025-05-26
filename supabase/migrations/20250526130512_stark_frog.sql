/*
  # Create campaigns schema

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `cover_image` (text)
      - `total_tickets` (integer)
      - `ticket_price` (numeric)
      - `featured` (boolean)
      - `status` (enum)
      - `mode` (enum)
      - `combo_rules` (jsonb)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `campaign_tickets`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `number` (integer)
      - `is_prize` (boolean)
      - `prize_description` (text)
      - `status` (enum)
      - `user_id` (uuid, references auth.users)
      - `purchase_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create status enums
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE campaign_mode AS ENUM ('simple', 'combo');
CREATE TYPE campaign_ticket_status AS ENUM ('available', 'reserved', 'sold');

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  cover_image text NOT NULL,
  total_tickets integer NOT NULL CHECK (total_tickets > 0),
  ticket_price numeric NOT NULL CHECK (ticket_price >= 0),
  featured boolean NOT NULL DEFAULT false,
  status campaign_status NOT NULL DEFAULT 'draft',
  mode campaign_mode NOT NULL DEFAULT 'simple',
  combo_rules jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create campaign_tickets table
CREATE TABLE IF NOT EXISTS campaign_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  number integer NOT NULL,
  is_prize boolean NOT NULL DEFAULT false,
  prize_description text,
  status campaign_ticket_status NOT NULL DEFAULT 'available',
  user_id uuid REFERENCES auth.users(id),
  purchase_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, number)
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON campaigns
  FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Admins can manage campaigns"
  ON campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Create policies for campaign_tickets
CREATE POLICY "Anyone can view campaign tickets"
  ON campaign_tickets
  FOR SELECT
  USING (true);

CREATE POLICY "Users can purchase available tickets"
  ON campaign_tickets
  FOR UPDATE
  USING (status = 'available')
  WITH CHECK (
    NEW.status = 'sold' AND
    NEW.user_id = auth.uid() AND
    OLD.status = 'available'
  );

-- Create updated_at triggers
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaign_tickets_updated_at
  BEFORE UPDATE ON campaign_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to generate campaign tickets
CREATE OR REPLACE FUNCTION generate_campaign_tickets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO campaign_tickets (campaign_id, number)
  SELECT
    NEW.id,
    generate_series(1, NEW.total_tickets);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate tickets
CREATE TRIGGER generate_tickets_after_campaign_insert
  AFTER INSERT ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION generate_campaign_tickets();

-- Create view for buyer rankings
CREATE OR REPLACE VIEW buyer_rankings AS
SELECT
  c.id as campaign_id,
  ct.user_id,
  u.name as user_name,
  COUNT(*) as tickets_bought,
  ROUND(COUNT(*) * 100.0 / c.total_tickets, 2) as participation_percentage
FROM campaigns c
JOIN campaign_tickets ct ON c.id = ct.campaign_id
JOIN auth.users u ON ct.user_id = u.id
WHERE ct.status = 'sold'
GROUP BY c.id, ct.user_id, u.name, c.total_tickets
ORDER BY tickets_bought DESC;