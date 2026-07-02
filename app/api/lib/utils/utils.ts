import { createConsola, LogLevels } from "consola";
import { Epoch, Snowyflake } from "snowyflake";
import { PgBoss } from "pg-boss";
import { databaseUrl, isDebug } from "./env";

export class ValidationError {
    field: string;
    message: string;
    constructor(field: string, message: string) {
        this.field = field;
        this.message = message;
    }
}

export class FriendlyError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

export const pgBoss = new PgBoss({
    connectionString: databaseUrl,
});

export const snowflake = new Snowyflake({
    epoch: Epoch.Discord,
});

export const logger = createConsola({
    level: isDebug ? LogLevels.debug : LogLevels.info,
    stderr: process.stderr,
    stdout: process.stdout,
    reporters: [
        {
            log: (logObj, ctx) => {
                ctx.options.stdout?.write(JSON.stringify(logObj));
            },
        },
    ],
});

export function getEnv(key: string, defaultStr?: string): string {
    const value = process.env[key] || defaultStr;
    if (value == undefined || value.length == 0) {
        console.error(`Environment Variable \`${key}\` not set!`);
        process.exit(1);
    }
    return value as string;
}

export function dateToString(date: Date): string;
export function dateToString(date: null): null;
export function dateToString(date: Date | null): string | null;

export function dateToString(date: Date | null): string | null {
    if (date) {
        return date.toISOString();
    }
    return null;
}

/** A function that returns a Golang like function return */
export function toGoErrorRet<T, A extends unknown[]>(
    fn: (...args: A) => T,
): (...args: A) => Promise<[Awaited<T>, null] | [null, Error]> {
    return async function (...args) {
        try {
            const result = await fn(...args);
            return [result, null];
        } catch (error) {
            return [null, error as Error];
        }
    };
}

export const safeFormdata = toGoErrorRet((request: Request) => request.formData());
