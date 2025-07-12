-- Database schema for the ticketing challenge

CREATE TABLE IF NOT EXISTS organisation (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    organisation_id INTEGER REFERENCES organisation(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    user_id INTEGER REFERENCES users(id),
    organisation_id INTEGER REFERENCES organisation(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive seed data for testing
-- Organisations
INSERT INTO organisation (name) VALUES
  ('Acme Corp'),
  ('Globex Inc'),
  ('TechCorp Solutions'),
  ('Digital Innovations Ltd'),
  ('Cloud Systems Inc'),
  ('DataFlow Analytics'),
  ('SecureNet Technologies'),
  ('MobileFirst Apps'),
  ('AI Research Labs'),
  ('Blockchain Ventures');

-- Users (passwords are hashed versions of 'password123')
INSERT INTO users (name, email, password, organisation_id) VALUES
  -- Acme Corp users
  ('Alice', 'alice@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  ('Bob', 'bob@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1),
  -- Globex Inc users
  ('Carol', 'carol@globex.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 2),
  -- TechCorp Solutions users
  ('Sarah Mitchell', 'sarah@techcorp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 3),
  ('Michael Rodriguez', 'michael@techcorp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 3),
  ('Emily Chen', 'emily@techcorp.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 3),
  -- Digital Innovations Ltd users
  ('James Thompson', 'james@digitalinnovations.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 4),
  ('Lisa Park', 'lisa@digitalinnovations.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 4),
  ('Robert Kim', 'robert@digitalinnovations.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 4),
  -- Cloud Systems Inc users
  ('Jennifer Walsh', 'jennifer@cloudsystems.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 5),
  ('Daniel O''Connor', 'daniel@cloudsystems.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 5),
  -- DataFlow Analytics users
  ('Amanda Foster', 'amanda@dataflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 6),
  ('Christopher Reed', 'christopher@dataflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 6),
  -- SecureNet Technologies users
  ('Nicole Garcia', 'nicole@securenet.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 7),
  ('Kevin Martinez', 'kevin@securenet.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 7),
  -- MobileFirst Apps users
  ('Rachel Turner', 'rachel@mobilefirst.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 8),
  ('Andrew Phillips', 'andrew@mobilefirst.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 8),
  -- AI Research Labs users
  ('Stephanie Campbell', 'stephanie@airesearch.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 9),
  ('Brandon Evans', 'brandon@airesearch.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 9),
  -- Blockchain Ventures users
  ('Megan Collins', 'megan@blockchainventures.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 10),
  ('Ryan Stewart', 'ryan@blockchainventures.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 10),
  -- Admin user (can access all organizations)
  ('Admin User', 'admin@system.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8s.m', 1);

-- Update admin user role
UPDATE users SET role = 'admin' WHERE email = 'admin@system.com';

-- Comprehensive tickets data
INSERT INTO tickets (title, description, status, user_id, organisation_id) VALUES
  -- Original simple tickets
  ('Broken printer', 'The 3rd floor printer is jammed.', 'open', 1, 1),
  ('VPN not connecting', 'Cannot connect since morning.', 'open', 2, 1),
  ('Website down', 'Landing page returns 500.', 'open', 3, 2),
  ('Request new laptop', 'Need a MacBook Pro M3.', 'pending', 1, 1),
  ('Email spam issue', 'Receiving lots of spam emails.', 'open', 2, 1),
  
  -- TechCorp Solutions tickets
  ('Database performance optimization needed', 'Production database queries are taking too long. Need to optimize indexes and query performance.', 'open', 4, 3),
  ('API rate limiting implementation', 'Need to implement rate limiting for our public API to prevent abuse and ensure fair usage.', 'in_progress', 5, 3),
  ('CI/CD pipeline broken', 'Automated deployment pipeline is failing on the staging environment. Build process needs fixing.', 'open', 6, 3),
  
  -- Digital Innovations Ltd tickets
  ('User authentication system upgrade', 'Current authentication system needs to be upgraded to support OAuth 2.0 and multi-factor authentication.', 'pending', 7, 4),
  ('Frontend responsive design issues', 'Mobile version of the web application has layout issues on various screen sizes.', 'open', 8, 4),
  ('Third-party integration failure', 'Payment gateway integration is returning errors. Need to investigate and fix the connection.', 'open', 9, 4),
  
  -- Cloud Systems Inc tickets
  ('Cloud infrastructure scaling', 'Need to implement auto-scaling for our cloud infrastructure to handle traffic spikes.', 'in_progress', 10, 5),
  ('Data backup verification', 'Automated backup verification process is not working. Need to fix and ensure data integrity.', 'open', 11, 5),
  
  -- DataFlow Analytics tickets
  ('Machine learning model deployment', 'New ML model needs to be deployed to production. Requires infrastructure setup and monitoring.', 'pending', 12, 6),
  ('Real-time analytics dashboard', 'Need to build a real-time analytics dashboard for monitoring system performance metrics.', 'open', 13, 6),
  
  -- SecureNet Technologies tickets
  ('Security vulnerability patch', 'Critical security vulnerability found in our authentication library. Need immediate patch deployment.', 'open', 14, 7),
  ('Penetration testing setup', 'Need to set up automated penetration testing for our web applications.', 'pending', 15, 7),
  
  -- MobileFirst Apps tickets
  ('Mobile app push notifications', 'Push notification service is not working on iOS devices. Need to fix the implementation.', 'open', 16, 8),
  ('App store optimization', 'Need to optimize app store listings and improve app discoverability.', 'pending', 17, 8),
  
  -- AI Research Labs tickets
  ('AI model training pipeline', 'Need to set up automated training pipeline for our machine learning models.', 'in_progress', 18, 9),
  ('Data preprocessing automation', 'Manual data preprocessing is time-consuming. Need to automate the process.', 'open', 19, 9),
  
  -- Blockchain Ventures tickets
  ('Smart contract audit', 'New smart contract needs security audit before deployment to mainnet.', 'pending', 20, 10),
  ('Blockchain node synchronization', 'Private blockchain nodes are out of sync. Need to fix synchronization issues.', 'open', 21, 10),
  
  -- Additional cross-organization tickets
  ('Microservices architecture review', 'Current microservices architecture needs review and optimization for better performance.', 'in_progress', 4, 3),
  ('Load testing infrastructure', 'Need to set up comprehensive load testing for our web services.', 'pending', 7, 4),
  ('Monitoring and alerting system', 'Current monitoring system is not comprehensive enough. Need to implement better alerting.', 'open', 10, 5),
  ('Data warehouse migration', 'Need to migrate from current data warehouse to a more scalable solution.', 'pending', 12, 6),
  ('Compliance audit preparation', 'Upcoming compliance audit requires preparation and documentation updates.', 'open', 14, 7),
  ('Cross-platform app development', 'Need to develop cross-platform mobile app using React Native.', 'in_progress', 16, 8),
  ('Natural language processing API', 'Need to develop NLP API for text analysis and sentiment detection.', 'pending', 18, 9),
  ('DeFi protocol integration', 'Need to integrate with popular DeFi protocols for our blockchain application.', 'open', 20, 10);

-- Row-Level Security (RLS) Implementation
-- Enable RLS on tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create a function to set the current user ID for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get current user's organisation ID
CREATE OR REPLACE FUNCTION get_current_user_organisation_id()
RETURNS integer AS $$
DECLARE
    user_org_id integer;
    user_id_text text;
BEGIN
    -- Get the current user ID from session
    user_id_text := current_setting('app.current_user_id', true);
    
    -- Check if the setting exists and is not null
    IF user_id_text IS NULL OR user_id_text = '' THEN
        RETURN NULL;
    END IF;
    
    -- Get the current user ID from session
    SELECT organisation_id INTO user_org_id
    FROM users 
    WHERE id = user_id_text::integer;
    
    RETURN user_org_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean AS $$
DECLARE
    user_role text;
    user_id_text text;
BEGIN
    -- Get the current user ID from session
    user_id_text := current_setting('app.current_user_id', true);
    
    -- Check if the setting exists and is not null
    IF user_id_text IS NULL OR user_id_text = '' THEN
        RETURN false;
    END IF;
    
    -- Get the current user's role from session
    SELECT role INTO user_role
    FROM users 
    WHERE id = user_id_text::integer;
    
    RETURN user_role = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their organisation's tickets" ON tickets;
DROP POLICY IF EXISTS "Users can only modify their organisation's tickets" ON tickets;
DROP POLICY IF EXISTS "tickets_select_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_update_policy" ON tickets;
DROP POLICY IF EXISTS "tickets_delete_policy" ON tickets;

-- Create comprehensive RLS policies for tickets table

-- Policy for SELECT operations (viewing tickets)
CREATE POLICY "tickets_select_policy" ON tickets
    FOR SELECT
    USING (
        -- Admin users can see all tickets
        is_current_user_admin() OR
        -- Regular users can only see tickets from their organisation
        organisation_id = get_current_user_organisation_id()
    );

-- Policy for INSERT operations (creating tickets)
CREATE POLICY "tickets_insert_policy" ON tickets
    FOR INSERT
    WITH CHECK (
        -- Admin users cannot create tickets (business rule)
        NOT is_current_user_admin() AND
        -- Users can only create tickets for their own organisation
        organisation_id = get_current_user_organisation_id()
    );

-- Policy for UPDATE operations (modifying tickets)
CREATE POLICY "tickets_update_policy" ON tickets
    FOR UPDATE
    USING (
        -- Admin users can update any ticket
        is_current_user_admin() OR
        -- Regular users can only update tickets from their organisation
        organisation_id = get_current_user_organisation_id()
    )
    WITH CHECK (
        -- Users can only update tickets in their organisation
        organisation_id = get_current_user_organisation_id()
    );

-- Policy for DELETE operations (deleting tickets)
CREATE POLICY "tickets_delete_policy" ON tickets
    FOR DELETE
    USING (
        -- Admin users can delete any ticket
        is_current_user_admin() OR
        -- Regular users can only delete tickets from their organisation
        organisation_id = get_current_user_organisation_id()
    );

-- Grant necessary permissions for RLS to work
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Grant permissions to the application user
GRANT USAGE ON SCHEMA public TO rls_test_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rls_test_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rls_test_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO rls_test_user;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_organisation_updated_at ON organisation;
CREATE TRIGGER update_organisation_updated_at BEFORE UPDATE ON organisation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a regular user for testing RLS (not a superuser)
CREATE USER rls_test_user WITH PASSWORD 'password123';
GRANT CONNECT ON DATABASE ticketing_db TO rls_test_user;
GRANT USAGE ON SCHEMA public TO rls_test_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rls_test_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rls_test_user;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
