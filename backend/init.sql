-- =============================================================================
-- Database Initialization Script
-- =============================================================================
-- This script runs automatically when PostgreSQL container starts for the first time.
-- It creates the initial database schema and sets up necessary extensions.
-- =============================================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- Create app user with limited privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'appuser') THEN
        CREATE ROLE appuser WITH LOGIN PASSWORD 'apppassword';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;

-- Create schema
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION appuser;

-- Set search path
ALTER DATABASE appdb SET search_path TO app, public;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization complete!';
END
$$;

