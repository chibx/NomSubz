import { getEnv } from "./utils";

export const isDebug = getEnv("DEBUG", "0") == "1";

export const databaseUrl = getEnv("DATABASE_URL");
export const nombaWebhookSecret = getEnv("NOMBA_WH_SECRET");
export const nombaAccountId = getEnv("NOMBA_ACCOUNT_ID");
export const nombaClientId = getEnv("NOMBA_CLIENT_ID");
export const nombaClientSecret = getEnv("NOMBA_SECRET");