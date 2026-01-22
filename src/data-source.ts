import "reflect-metadata";
import { DataSource } from "typeorm";
import { TelemetryEvent } from "./entities/TelemetryEvent";
import dotenv from "dotenv";

import { User } from "./entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "telemetry",
  synchronize: false, // We will use migrations
  logging: false,
  entities: [TelemetryEvent, User],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
