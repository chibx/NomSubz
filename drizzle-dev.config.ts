import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/api/lib/db/schema.ts',
  out: './app/api/lib/db/migrations',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})