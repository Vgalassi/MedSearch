FROM postgres:16

RUN echo 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";' > /docker-entrypoint-initdb.d/init.sql