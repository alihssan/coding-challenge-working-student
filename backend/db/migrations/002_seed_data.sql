-- Migration: 002_seed_data.sql
-- Description: Insert initial seed data

-- Insert organisations
INSERT INTO organisation (name) VALUES
  ('Acme Corp'),
  ('Globex Inc')
ON CONFLICT DO NOTHING;

-- Insert users (passwords are hashed versions of 'password123')
INSERT INTO users (name, email, password, organisation_id) VALUES
  ('Alice', 'alice@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  ('Bob',   'bob@acme.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  ('Carol', 'carol@globex.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 2)
ON CONFLICT (email) DO NOTHING;

-- Insert tickets
INSERT INTO tickets (title, description, status, user_id, organisation_id) VALUES
  ('Broken printer',          'The 3rd floor printer is jammed.', 'open',    1, 1),
  ('VPN not connecting',      'Cannot connect since morning.',    'open',    2, 1),
  ('Website down',            'Landing page returns 500.',        'open',    3, 2),
  ('Request new laptop',      'Need a MacBook Pro M3.',           'pending', 1, 1),
  ('Email spam issue',        'Receiving lots of spam emails.',   'open',    2, 1)
ON CONFLICT DO NOTHING; 