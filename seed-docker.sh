#!/bin/bash

echo "Waiting for PostgreSQL to be ready..."
sleep 15

echo "Running database seed with TypeORM..."
docker-compose exec backend npm run seed:typeorm

echo "Database seeding completed!" 