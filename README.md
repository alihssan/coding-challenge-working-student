# Coding Challenge - Working Student

## Docker Setup

This project includes Docker Compose configuration to run the entire application stack in containers.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Start services in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild and start services:**
   ```bash
   docker-compose up --build
   ```

### Services

- **Frontend**: React app running on http://localhost:5173
- **Backend**: Node.js API running on http://localhost:4000
- **Database**: PostgreSQL running on localhost:5432

### Development

The Docker setup includes volume mounts for development, so changes to your code will be reflected immediately without rebuilding containers.

### Database

The PostgreSQL database will be automatically initialized with the schema from `db/schema.sql` when the container starts for the first time.

## Manual Setup

If you prefer to run the services manually without Docker, see the individual README files in the `frontend/` and `backend/` directories.
