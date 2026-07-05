import { FormDataInfo } from "decode-formdata";
import { AnalyticsPeriodType } from "@/app/api/lib/db/schema";

export const APP_NAME = "NomSubz";
export const CALLBACK_URL = "https://numsubz.vercel.app/";
export const ERR_EXPIRED_SESSION = "Expired session data";
export const ERR_NO_ACCESSTOKEN = "No access token";
export const ERR_INVALID_ACCESSTOKEN = "Invalid token";
export const ERR_FIRST_UNBIND_CARD =
    "This card is currently linked to a subscription, bind those subscriptions to another card or cancel subscription";

const DAILY: AnalyticsPeriodType = 0;
const WEEKLY: AnalyticsPeriodType = 1;
const MONTHLY: AnalyticsPeriodType = 2;

export { DAILY, WEEKLY, MONTHLY };

export const REGISTER_FORM_INFO: FormDataInfo = {
    booleans: ["receive_newsletter"],
};
