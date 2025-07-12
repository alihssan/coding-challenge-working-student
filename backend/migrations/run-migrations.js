import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppDataSource } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations table to track applied migrations
async function createMigrationsTable() {
  try {
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Migrations table created/verified');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error.message);
    throw error;
  }
}

// Get list of applied migrations
async function getAppliedMigrations() {
  try {
    const result = await AppDataSource.query('SELECT name FROM migrations ORDER BY id');
    return result.map(row => row.name);
  } catch (error) {
    console.error('❌ Error getting applied migrations:', error.message);
    return [];
  }
}

// Apply a single migration
async function applyMigration(migrationName, migrationPath) {
  try {
    console.log(`🔄 Applying migration: ${migrationName}`);
    
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    await AppDataSource.query(migrationContent);
    
    // Record the migration as applied
    await AppDataSource.query('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
    
    console.log(`✅ Applied migration: ${migrationName}`);
  } catch (error) {
    console.error(`❌ Error applying migration ${migrationName}:`, error.message);
    throw error;
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');
    
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Get all migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure order
    
    console.log(`📋 Found ${migrationFiles.length} migration files`);
    console.log(`📋 Applied migrations: ${appliedMigrations.length}\n`);
    
    // Apply pending migrations
    let appliedCount = 0;
    for (const migrationFile of migrationFiles) {
      const migrationName = migrationFile;
      
      if (!appliedMigrations.includes(migrationName)) {
        const migrationPath = path.join(migrationsDir, migrationFile);
        await applyMigration(migrationName, migrationPath);
        appliedCount++;
      } else {
        console.log(`⏭️  Skipping already applied migration: ${migrationName}`);
      }
    }
    
    if (appliedCount === 0) {
      console.log('\n🎉 All migrations are up to date!');
    } else {
      console.log(`\n🎉 Successfully applied ${appliedCount} migration(s)!`);
    }
    
    // Close database connection
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations }; 