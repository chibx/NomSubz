import { logger } from "./app/api/lib/utils/utils";
import { initializeBackgroundJobs } from "./app/api/lib/worker";

export async function register() {
    await initializeBackgroundJobs();
    logger.debug("Instrumentation registered");
}
