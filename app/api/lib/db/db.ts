import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseUrl, isDebug } from "../utils/env";
import * as schema from "./schema";
import { APP_NAME } from "@/app/shared/constants";

const pool = new Pool({
    connectionString: databaseUrl,
    application_name: APP_NAME,
    keepAlive: true,
});

export const appDB = drizzle({ client: pool, logger: isDebug, schema });
