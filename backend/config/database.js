import { DataSource } from "typeorm";
import { Organisation } from "../db/entities/Organisation.js";
import { User } from "../db/entities/User.js";
import { Ticket } from "../db/entities/Ticket.js";

export const createDataSource = () => {
  return new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "ticketing_db",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [Organisation, User, Ticket],
    subscribers: [],
    migrations: [],
    extra: {
      max: 20,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
  });
};

export const AppDataSource = createDataSource(); 