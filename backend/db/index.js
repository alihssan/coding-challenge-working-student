import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Enhanced query function that supports RLS
export const query = async (text, params, userId = null) => {
  const client = await pool.connect();
  
  try {
    // Set the current user ID for RLS if provided
    if (userId) {
      await client.query('SELECT set_current_user_id($1)', [userId]);
    }
    
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Query function for operations that don't need RLS
export const queryWithoutRLS = (text, params) => pool.query(text, params);

// Test database connection
export const testConnection = async () => {
  try {
    const result = await queryWithoutRLS('SELECT NOW()');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Close database connection
export const closeConnection = () => pool.end();
