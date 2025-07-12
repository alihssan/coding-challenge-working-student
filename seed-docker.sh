#!/bin/bash

echo "Database is automatically seeded via db/schema.sql when Docker starts up."
echo "No manual seeding required - the schema file contains all necessary seed data."
echo ""
echo "If you need to reseed the database, restart the Docker containers:"
echo "  docker compose down"
echo "  docker compose up" 