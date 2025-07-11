-- Database schema for the ticketing challenge

CREATE TABLE IF NOT EXISTS organisation (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    organisation_id INTEGER REFERENCES organisation(id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    user_id INTEGER REFERENCES users(id),
    organisation_id INTEGER REFERENCES organisation(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dummy organisations
INSERT INTO organisation (name) VALUES
  ('Acme Corp'),
  ('Globex Inc');

-- Dummy users (passwords are hashed versions of 'password123')
INSERT INTO users (name, email, password, organisation_id) VALUES
  ('Alice', 'alice@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  ('Bob',   'bob@acme.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  ('Carol', 'carol@globex.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 2);

-- Dummy tickets
INSERT INTO tickets (title, description, status, user_id, organisation_id) VALUES
  ('Broken printer',          'The 3rd floor printer is jammed.', 'open',    1, 1),
  ('VPN not connecting',      'Cannot connect since morning.',    'open',    2, 1),
  ('Website down',            'Landing page returns 500.',        'open',    3, 2),
  ('Request new laptop',      'Need a MacBook Pro M3.',           'pending', 1, 1),
  ('Email spam issue',        'Receiving lots of spam emails.',   'open',    2, 1);
