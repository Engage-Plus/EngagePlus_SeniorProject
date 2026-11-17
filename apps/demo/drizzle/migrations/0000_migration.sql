CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'social',
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs public read" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "orgs create own" ON public.organizations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "orgs update own" ON public.organizations FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "orgs delete own" ON public.organizations FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'social',
  location text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  is_free boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "org owners create events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = org_id AND o.owner_id = auth.uid()));
CREATE POLICY "org owners update events" ON public.events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = org_id AND o.owner_id = auth.uid()));
CREATE POLICY "org owners delete events" ON public.events FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = org_id AND o.owner_id = auth.uid()));

CREATE TABLE public.rsvps (
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);
GRANT SELECT, INSERT, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rsvps" ON public.rsvps FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.follows (
  user_id uuid NOT NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own follows" ON public.follows FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

INSERT INTO public.organizations (id, name, description, category) VALUES
 ('11111111-0000-0000-0000-000000000001','Howard University Student Association','The official student government representing every Bison on campus.','professional'),
 ('11111111-0000-0000-0000-000000000002','Caribbean Students Association','Celebrating Caribbean culture, food, music and community at the Mecca.','cultural'),
 ('11111111-0000-0000-0000-000000000003','Bison Coders','Hackathons, workshops and study nights for students who build software.','academic'),
 ('11111111-0000-0000-0000-000000000004','Howard Poetry Society','Open mics, writing circles and spoken word showcases.','cultural'),
 ('11111111-0000-0000-0000-000000000005','Pre-Law Society','LSAT prep, attorney panels and law school visits.','professional'),
 ('11111111-0000-0000-0000-000000000006','Bison Gaming League','Tournaments, game nights and esports for every skill level.','social');

INSERT INTO public.events (org_id, title, description, category, location, starts_at, ends_at, is_free) VALUES
 ('11111111-0000-0000-0000-000000000001','Yardfest Planning Town Hall','Help shape this year''s Yardfest lineup and activities.','social','Blackburn Center Ballroom', now() + interval '2 days', now() + interval '2 days 2 hours', true),
 ('11111111-0000-0000-0000-000000000002','Caribbean Night Market','Food, vendors and soca all night on the Yard.','cultural','The Yard', now() + interval '4 days', now() + interval '4 days 4 hours', true),
 ('11111111-0000-0000-0000-000000000003','Intro to React Workshop','Build your first web app in 90 minutes. Laptops required.','academic','Douglass Hall 116', now() + interval '1 day', now() + interval '1 day 90 minutes', true),
 ('11111111-0000-0000-0000-000000000003','Fall Hack Night','Overnight build session with pizza and mentors.','academic','iLab, Founders Library', now() + interval '9 days', now() + interval '9 days 8 hours', true),
 ('11111111-0000-0000-0000-000000000004','Open Mic: Voices of the Mecca','Sign up at the door to perform poetry, music or comedy.','cultural','Cramton Auditorium', now() + interval '3 days', now() + interval '3 days 3 hours', true),
 ('11111111-0000-0000-0000-000000000005','Attorney Panel & Networking','Meet Howard Law alumni practicing in DC.','professional','School of Business Auditorium', now() + interval '6 days', now() + interval '6 days 2 hours', true),
 ('11111111-0000-0000-0000-000000000006','Smash Bros Tournament','Bracket play, prizes for top 3. $5 entry.','social','Blackburn Game Room', now() + interval '5 days', now() + interval '5 days 4 hours', false),
 ('11111111-0000-0000-0000-000000000001','Homecoming Volunteer Info Session','Learn how to get involved with Homecoming week.','social','Armour J. Blackburn 148', now() + interval '7 days', now() + interval '7 days 1 hour', true);