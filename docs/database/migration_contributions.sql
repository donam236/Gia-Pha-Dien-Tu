-- ═══ Phase 3: Contribution system ═══
-- 1. Create Types
CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE contribution_type AS ENUM ('edit', 'add_child', 'add_spouse', 'add_media');
-- 2. Create Contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id TEXT REFERENCES public.people(handle) ON DELETE CASCADE,
    contributor_name TEXT NOT NULL,
    contributor_contact TEXT,
    contribution_type contribution_type NOT NULL DEFAULT 'edit',
    proposed_data JSONB NOT NULL,
    evidence_urls TEXT [] DEFAULT '{}',
    status contribution_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 3. Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
-- 4. Policies
-- Allow anyone to submit a contribution
CREATE POLICY "Enable insert for all users" ON public.contributions FOR
INSERT WITH CHECK (true);
-- Allow admins to read all
-- Note: In a real app, this would check for a 'admin' role in auth.users or a separate profiles table
CREATE POLICY "Admins can view all contributions" ON public.contributions FOR
SELECT USING (true);
-- Simplified for lab/demo
-- Allow admins to update (approve/reject)
CREATE POLICY "Admins can update contributions" ON public.contributions FOR
UPDATE USING (true);
-- Simplified for lab/demo
-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_contributions_updated_at BEFORE
UPDATE ON contributions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();