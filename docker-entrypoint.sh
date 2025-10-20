#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until node -e "require('net').createConnection(5432, 'postgres').on('connect', () => process.exit(0)).on('error', () => process.exit(1))" 2>/dev/null; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Running database migrations..."
npx prisma migrate deploy || npx prisma db push

echo "Starting application..."
exec "$@"
