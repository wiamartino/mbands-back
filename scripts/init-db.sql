-- Create the appuser if it doesn't exist
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'appuser') THEN
    CREATE ROLE appuser WITH LOGIN PASSWORD 'appuser';
  END IF;
END
$$;

-- Grant necessary privileges to appuser
GRANT ALL PRIVILEGES ON DATABASE name_db TO appuser;
ALTER DATABASE name_db OWNER TO appuser;
