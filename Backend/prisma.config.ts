import dotenv from "dotenv";
dotenv.config();
import { defineConfig } from "prisma/config";

console.log("DB URL:", process.env.DATABASE_URL); // ✅ correct place

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});