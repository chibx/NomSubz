import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/api/lib/db/schema.ts",
    out: "./app/api/lib/db/prod/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.PROD_DATABASE_URL!,
        // user: process.env.MIG_DB_USER!,
        // password: process.env.MIG_DB_PASS!,
        // host: process.env.MIG_DB_HOST!,
        // port: Number(process.env.MIG_DB_PORT!),
        // database: process.env.MIG_DB!,
        ssl: true,
    },
});
