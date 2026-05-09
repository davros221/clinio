import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

// Attempt to load the local .env file if it exists
config({ path: join(__dirname, "../../../../.env") });

export const AppDataSource = new DataSource({
  type: "postgres",
  // Fallback to the exact credentials from your local docker-compose.yml
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "user", // from POSTGRES_USER
  password: process.env.DB_PASSWORD || "pass", // from POSTGRES_PASSWORD
  database: process.env.DB_DATABASE || "unicorn", // from POSTGRES_DB

  // Look for entities and migrations based on the compiled output or ts-node execution
  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "./migrations/*{.ts,.js}")],

  synchronize: false, // Never use synchronize true with migrations
  logging: true,
});
