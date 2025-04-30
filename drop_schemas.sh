#!/bin/bash

# Database connection parameters
DB_HOST="localhost"
DB_NAME="khatabook"
DB_USER="root"
DB_PASSWORD="root"

# Create a temporary file for the SQL commands
TMP_SQL="/tmp/drop_schemas.sql"

# Generate SQL to drop all schemas except initSchema and system schemas
cat > "$TMP_SQL" << EOF
DO \$\$
DECLARE
    schema_name text;
BEGIN
    FOR schema_name IN 
        SELECT nspname 
        FROM pg_namespace 
        WHERE nspname NOT IN ('initSchema', 'pg_catalog', 'information_schema', 'public')
          AND nspname NOT LIKE 'pg_%'
    LOOP
        EXECUTE 'DROP SCHEMA ' || quote_ident(schema_name) || ' CASCADE';
        RAISE NOTICE 'Dropped schema: %', schema_name;
    END LOOP;
END;
\$\$ LANGUAGE plpgsql;
EOF

# Execute the SQL commands
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$TMP_SQL"

# Remove the temporary SQL file
rm "$TMP_SQL"

echo "Schema cleanup completed." 