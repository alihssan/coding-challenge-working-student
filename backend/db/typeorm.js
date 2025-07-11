import { AppDataSource } from "../config/database.js";

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established with TypeORM");
    return AppDataSource;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export const getRepository = (entity) => {
  return AppDataSource.getRepository(entity);
};

export const closeDatabase = async () => {
  try {
    await AppDataSource.destroy();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
}; 