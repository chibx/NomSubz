import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/api/lib/db/schema.ts",
    out: "./app/api/lib/db/prod/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.MIG_DATABASE_URL!,
    },
});
