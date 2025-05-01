#!/bin/bash

# Get connection string parameters from arguments
DB_HOST=$1
DB_NAME=$2
DB_USER=$3
DB_PASSWORD=$4

if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Usage: $0 <host> <dbname> <user> <password>"
    exit 1
fi

# Create user if it doesn't exist
sudo -u postgres psql -c "DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;"

# Create database if it doesn't exist
sudo -u postgres psql -c "SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec"

# Grant permissions
sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;"
sudo -u postgres psql -d $DB_NAME -c "CREATE SCHEMA IF NOT EXISTS initSchema;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA initSchema TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER SCHEMA initSchema OWNER TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON ALL TABLES IN SCHEMA initSchema TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA initSchema TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON ALL FUNCTIONS IN SCHEMA initSchema TO $DB_USER;"

echo "Database setup completed successfully!" 