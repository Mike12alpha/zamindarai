-- PostgreSQL init script: ensures the zamindarai database exists.
-- The postgres:15-alpine image runs scripts in /docker-entrypoint-initdb.d/
-- on every container start.
SELECT 'CREATE DATABASE zamindarai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'zamindarai')\gexec
