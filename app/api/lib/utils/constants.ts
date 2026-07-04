import { PlanType } from "../types/types";

export const MINUTE_1 = 60 * 1000;
export const MINUTES_5 = 5 * MINUTE_1;
export const MINUTES_15 = 15 * MINUTE_1;
export const MINUTES_30 = 30 * MINUTE_1;
export const HOURS_1 = 60 * MINUTE_1;
export const DAY_1 = 24 * HOURS_1;
export const DAYS_7 = 7 * DAY_1;

export const APPID_KEY = "x-app-id";
export const ACCESSTOKEN_COOKIE = "access_token";
export const REFRESHTOKEN_COOKIE = "refresh_token";

export const DUMMY_200_MESSAGE = "Success";
export const DUMMY_400_MESSAGE = "Invalid Request";
export const DUMMY_401_MESSAGE = "Unauthorized";
export const DUMMY_500_MESSAGE = "An error occured, please try again";
export const ERR_INVALID_APIKEY = "Invalid api key";

export const STATUS_INTERNAL_SERVER_ERROR = 500;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_OK = 200;

export const subscriptionDurations = Object.freeze<Record<PlanType, number>>({
    weekly: DAYS_7,
    monthly: 30 * DAY_1,
    annually: 365.25 * DAY_1,
});

/** 8 (prefix) + 1 (-) + 24 (hashed secret) */
export const APIKEY_LENGTH = 33;

export const OTP_BACKUP_CODES_COUNT = 8;
