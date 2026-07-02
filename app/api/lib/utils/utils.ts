import { createConsola, LogLevels } from "consola";
import { Epoch, Snowyflake } from "snowyflake";
import { PgBoss } from "pg-boss";
import { databaseUrl, isDebug, nombaAccountId, nombaClientId, nombaClientSecret } from "./env";
import { subscriptionDurations } from "./constants";
import { ParsedDbError, ParsedDbErrorType, PlanType } from "../types/types";
import { DatabaseError } from "pg";
import { isValiError } from "valibot";
import { StructuredResponse } from "../types/response";
import { NextResponse } from "next/server";
import { subscribers } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";
import { appDB } from "../db/db";
import { NombaClient } from "../nomba-client";

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

export const nombaClient = new NombaClient({
    accountId: nombaAccountId,
    clientId: nombaClientId,
    clientSecret: nombaClientSecret,
});

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

export function addToDate(ms: number, date?: Date): Date {
    const milli = date ? date.getTime() : new Date().getTime();
    return new Date(milli + ms);
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

export function structuredResponse<T>(
    status: number,
    message: string,
    data: T | null = {} as T,
    errors?: ValidationError[],
) {
    const resp: StructuredResponse<T> = {
        status,
        message,
        errors,
        data: data,
    };

    return NextResponse.json(resp, { status: status, statusText: message });
}

export function toValidationError(error: Error) {
    if (!isValiError(error)) return;
    const validationErrors: ValidationError[] = [];

    for (const iss of error.issues) {
        validationErrors.push(new ValidationError((iss.path?.[0].key as string) || "", iss.message));
    }

    return validationErrors;
}

export const isSubscriberForApp = toGoErrorRet(async (appId: string, subscriberId: bigint) => {
    let result = false;
    const b = await appDB
        .select({
            a: sql<number>`1`,
        })
        .from(subscribers)
        .where(and(eq(subscribers.appId, appId), eq(subscribers.subscriberId, subscriberId)));

    if (b.length > 0) {
        result = true;
    }
    return result;
});

/**
 * Traverses the error to extract the raw node-postgres DatabaseError
 */
export function extractPgError(error: unknown): DatabaseError | null {
    if (error instanceof DatabaseError) {
        return error;
    }

    if (error && typeof error === "object" && "cause" in error && error.cause instanceof DatabaseError) {
        return error.cause;
    }

    return null;
}

export function parseDrizzleError(error: unknown): ParsedDbError | null {
    const pgError = extractPgError(error);

    if (!pgError) {
        return null; // Not a Postgres database error (e.g. network timeout or syntax error)
    }

    switch (pgError.code) {
        case "23505": // unique_violation
            return {
                type: ParsedDbErrorType.UNIQUE_VIOLATION,
                message: "A record with this identifier already exists.",
                detail: pgError.detail, // e.g., "Key (email)=(user@example.com) already exists."
                table: pgError.table,
                constraint: pgError.constraint,
            };

        case "23503": // foreign_key_violation
            return {
                type: ParsedDbErrorType.FOREIGN_KEY_VIOLATION,
                message: "This operation references a record that does not exist.",
                detail: pgError.detail,
                table: pgError.table,
                constraint: pgError.constraint,
            };

        case "23502": // not_null_violation
            return {
                type: ParsedDbErrorType.NOT_NULL_VIOLATION,
                message: `The field for column "${pgError.column}" cannot be null.`,
                table: pgError.table,
                column: pgError.column,
            };

        case "23514": // check_violation
            return {
                type: ParsedDbErrorType.CHECK_VIOLATION,
                message: "The data provided violates an application check constraint.",
                table: pgError.table,
                constraint: pgError.constraint,
            };

        default:
            return {
                type: ParsedDbErrorType.UNKNOWN_DB_ERROR,
                message: pgError.message || "An unhandled database exception occurred.",
                detail: pgError.detail,
            };
    }
}

export function addWithSubscriptionDuration(currentDate: Date, durationType: PlanType) {
    return new Date(currentDate.getTime() + subscriptionDurations[durationType]);
}
