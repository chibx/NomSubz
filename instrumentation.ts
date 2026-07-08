import { logger, pgBoss } from "./app/api/lib/utils/utils";
import { initializeBackgroundJobs } from "./app/api/lib/worker";

export async function register() {
    try {
        await pgBoss.start();
        await initializeBackgroundJobs();
        logger.debug("Instrumentation registered");
    } catch (err) {
        // No DB available locally — skip background jobs, frontend still works
        console.warn("[instrumentation] pgBoss unavailable, skipping background jobs:", (err as Error).message);
    }
}