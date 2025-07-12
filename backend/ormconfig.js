import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Organisation } from "./db/entities/Organisation.js";
import { User } from "./db/entities/User.js";
import { Ticket } from "./db/entities/Ticket.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "rls_test_user",
  password: process.env.DB_PASSWORD || "password123",
  database: process.env.DB_NAME || "ticketing_db",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Organisation, User, Ticket],
  subscribers: [],
  migrations: [],
}); 