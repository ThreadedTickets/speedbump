import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  password: process.env.POSTGRES_PASSWORD,
  user: process.env.POSTGRES_USERNAME,
  database: "speedbump",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
});
pool.query(fs.readFileSync(path.join(process.cwd(), `/src/utils/database/schema/guild.sql`), "utf-8"));

export default pool;
