export interface NombaClientConfig {
    clientId: string;
    clientSecret: string;
    accountId: string;
    environment?: "sandbox" | "production";
    baseUrl?: string;
}

type AllowedPaymentMethods =
    | "Card"
    | "Transfer"
    | "Nomba QR"
    | "USSD"
    | "Buy Now Pay Later"
    | "MOMO"
    | "Intl Card"
    | "Apple Pay";

// Authentication
export interface AuthData {
    access_token: string;
    token_type: string;
    expires_in: string;
    refresh_token: string;
}

export interface NombaBaseResponse<T> {
    code: string;
    description: string;
    data: T;
}

export type AuthenticateResponse = NombaBaseResponse<AuthData>;
export type RefreshTokenResponse = NombaBaseResponse<AuthData>;

// ─── Checkout Orders ───────────────────────────────────────────────────────────
/**
 * POST /v1/checkout/order
 * https://developer.nomba.com/nomba-api-reference/online-checkout/create-an-online-checkout-order
 */
export interface CreateOrderRequest {
    order: {
        orderReference: string;
        customerId: string;
        callbackUrl: string;
        customerEmail?: string;
        /** Amount in base currency units (e.g. "10000.00" for ₦10,000.00) */
        amount: string;
        currency: string;
        allowedPaymentMethods?: AllowedPaymentMethods[];
        orderMetaData?: Record<string, string>;
    };
    meta?: Record<string, string>;
    /** Set to true to tokenize the card for future recurring charges */
    tokenizeCard?: boolean;
}

export interface CreateOrderData {
    checkoutLink: string;
    orderReference: string;
    orderId: string;
}

export type CreateOrderResponse = NombaBaseResponse<CreateOrderData>;

// ─── Submit Card Details (Direct Charge) ──────────────────────────────────────
/**
 * POST /v1/checkout/checkout-card-detail
 * https://developer.nomba.com/nomba-api-reference/charge/submit-customer-card-details
 */
export interface DeviceInformation {
    httpBrowserLanguage: string;
    httpBrowserJavaEnabled: boolean;
    httpBrowserJavaScriptEnabled: boolean;
    httpBrowserColorDepth: string;
    httpBrowserScreenHeight: string;
    httpBrowserScreenWidth: string;
    httpBrowserTimeDifference: string;
    userAgentBrowserValue: string;
    deviceChannel: string; // e.g. "Browser"
}

export interface SubmitCardDetailsRequest {
    orderReference: string;
    cardDetails: {
        cardNumber: string;
        cardExpiryMonth: number;
        cardExpiryYear: number;
        cardCVV: number;
        cardPin?: number;
    };
    /** Whether to save (tokenize) the card for future use */
    saveCard?: string; // "true" | "false"
    deviceInformation?: DeviceInformation;
}

export interface CardChargeData {
    status: string;
    message: string;
    /** Next action required, e.g. "OTP", "3DS" */
    responseCode: "00" | "T0" | "SO";
    secureAuthenticationData?: Record<string, string>;
    orderReference: string;
    transactionId: string;
}

export type SubmitCardDetailsResponse = NombaBaseResponse<CardChargeData>;

export interface RequestSaveCardOTPRequest {
    orderReference: string;
    phoneNumber: string;
}

export type RequestSaveCardOTPResponse = NombaBaseResponse<unknown>;

export interface ResendSaveCardOTPRequest {
    orderReference: string;
}

export type ResendSaveCardOTPResponse = NombaBaseResponse<unknown>;

export interface SubmitSaveCardOTPRequest {
    otp: string;
    orderReference: string;
    transactionId: string;
}

export type SubmitSaveCardOTPResponse = NombaBaseResponse<unknown>;

// ─── Charge Tokenized Card (Recurring) ────────────────────────────────────────
/**
 * POST /v1/checkout/tokenized-card-payment
 * https://developer.nomba.com/nomba-api-reference/online-checkout/charge-a-customer-using-tokenized-card-data
 */
export interface ChargeTokenizedCardRequest {
    order: {
        orderReference: string;
        customerId: string;
        callbackUrl: string;
        customerEmail: string;
        amount: string;
        currency: string;
        accountId?: string;
        allowedPaymentMethods?: AllowedPaymentMethods[];
        orderMetaData?: Record<string, string>;
    };
    tokenKey: string;
}

export interface ChargeTokenizedCardData {
    status: string;
    message: string;
}

export type ChargeTokenizedCardResponse = NombaBaseResponse<ChargeTokenizedCardData>;

// ─── Fetch Checkout Transaction ────────────────────────────────────────────────
/**
 * POST /v1/checkout/confirm-transaction-receipt
 * https://developer.nomba.com/nomba-api-reference/online-checkout/fetch-checkout-transaction
 */
export interface FetchCheckoutTransactionRequest {
    orderReference: string;
}

export interface FetchCheckoutTransactionData {
    status: string;
    message: string;
    order?: {
        orderId: string;
        orderReference: string;
        amount: string;
        currency: string;
        customerEmail?: string;
        accountId?: string;
    };
}

export type FetchCheckoutTransactionResponse = NombaBaseResponse<FetchCheckoutTransactionData>;

// ─── Filter Parent Account Transactions ───────────────────────────────────────
/**
 * GET /v1/transactions/accounts/{accountId}
 * https://developer.nomba.com/nomba-api-reference/transactions/filter-parent-account-transactions
 * Uses cursor-based pagination (limit + cursor).
 */
export interface FilterTransactionsRequest {
    limit?: number; // max 50
    cursor?: string; // cursor for next page, from previous response
    status?: string;
    dateFrom?: string; // ISO date string
    dateTo?: string; // ISO date string
    transactionRef?: string;
}

export interface TransactionItem {
    id: string;
    transactionRef: string;
    orderReference?: string;
    amount: number;
    currency: string;
    status: string;
    type?: string;
    source?: string;
    timeCreated: string;
    rrn?: string;
    stan?: string;
    merchantTxRef?: string;
}

export interface FilterTransactionsData {
    transactions: TransactionItem[];
    /** Cursor for the next page. If absent, no more pages. */
    cursor?: string;
}

export type FilterTransactionsResponse = NombaBaseResponse<FilterTransactionsData>;

// ─── Refund Checkout Transaction ──────────────────────────────────────────────
/**
 * POST /v1/checkout/refund
 * https://developer.nomba.com/nomba-api-reference/online-checkout/refund-checkout-transaction
 */
export interface RefundOrderRequest {
    transactionId: string;
    /** Optional for partial refund */
    amount?: number;
    /** Required if refund is via bank transfer */
    accountNumber?: string;
    /** Required if refund is via bank transfer */
    bankCode?: string;
}

export interface RefundOrderData {
    success: boolean;
    message: string;
}

export type RefundOrderResponse = NombaBaseResponse<RefundOrderData>;

// ─── Cancel Checkout Order ─────────────────────────────────────────────────────
/**
 * POST /v1/checkout/order/cancel
 * https://developer.nomba.com/nomba-api-reference/online-checkout/cancel-checkout-order
 */
export interface CancelOrderRequest {
    orderReference: string;
}

export interface CancelOrderData {
    success: boolean;
    message: string;
}

export type CancelOrderResponse = NombaBaseResponse<CancelOrderData>;

// ─── Recurring / Tokenized Cards ──────────────────────────────────────────────
/**
 * GET /v1/checkout/tokenized-card-data
 * https://developer.nomba.com/nomba-api-reference/online-checkout/list-tokenized-cards
 */
export interface ListTokenizedCardsRequest {
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
}

export interface TokenizedCardItem {
    tokenKey: string;
    customerEmail: string;
    cardType: string; // e.g. "Verve"
    cardPan: string; // masked PAN e.g. "234818********7580"
    tokenExpirationDate: string; // e.g. "20/20"
}

export interface ListTokenizedCardsData {
    nextPage?: string | null;
    tokenizedCardDataList: TokenizedCardItem[];
}

export type ListTokenizedCardsResponse = NombaBaseResponse<ListTokenizedCardsData>;

/**
 * PUT /v1/checkout/tokenized-card-data
 * https://developer.nomba.com/nomba-api-reference/online-checkout/update-tokenized-card-data
 */
export interface UpdateTokenizedCardRequest {
    tokenKey: string;
}

export interface UpdateTokenizedCardData {
    success: boolean;
    message: string;
}

export type UpdateTokenizedCardResponse = NombaBaseResponse<UpdateTokenizedCardData>;

// ─── Webhook ──────────────────────────────────────────────────────────────────
/**
 * Nomba sends webhook events to your registered callback URL.
 * Verify the signature from the `nomba-signature` header using HMAC-SHA256.
 */

// ─── Literal unions ──────────────────────────────────────────────────────────

// ─── Literal unions ──────────────────────────────────────────────────────────

export enum EventType {
    PAYMENT_SUCCESS = "payment_success",
    PAYOUT_SUCCESS = "payout_success",
    PAYMENT_FAILED = "payment_failed",
    PAYOUT_REFUND = "payout_refund",
}

/** How the transaction was initiated */
export enum OriginatingFrom {
    API = "api",
    POS = "pos",
    WEB = "web",
}

/** Core transaction categories */
export enum TransactionType {
    VACT_TRANSFER = "vact_transfer",
    TRANSFER = "transfer",
    PURCHASE = "purchase",
    ONLINE_CHECKOUT = "online_checkout",
}

/** Virtual account type label */
export type AliasAccountType = "VIRTUAL" | (string & {});

// ─── Nested object interfaces ─────────────────────────────────────────────────

export interface WebhookMerchant {
    walletId: string;
    /** Merchant's wallet balance after the transaction */
    walletBalance: number;
    userId: string;
}

export interface WebhookTerminal {
    /** Human-readable terminal name, e.g. "IKEJA MALL" */
    terminalLabel: string;
    /** Short terminal identifier, e.g. "3PLQXXX" */
    terminalId: string;
}

export interface WebhookTransaction {
    // ── Virtual-account fields (payment_success) ──
    aliasAccountNumber: string;
    aliasAccountName: string;
    aliasAccountReference: string;
    aliasAccountType: AliasAccountType;

    // ── Common fields ──
    fee: number;
    sessionId: string;
    type: TransactionType;
    transactionId: string;
    /** Empty string when not applicable */
    responseCode: string;
    /** Human-readable failure reason, e.g. "Insufficient Funds" */
    responseCodeMessage: string;
    originatingFrom: OriginatingFrom;
    transactionAmount: number;
    narration: string;
    /** ISO 8601 timestamp */
    time: string;

    // ── Payout / refund fields ──
    /** Merchant's own transaction reference */
    merchantTxRef: string;

    // ── POS-specific fields (payment_failed) ──
    /** Retrieval Reference Number */
    rrn: string;
    cardIssuer: string;
    /** ISO bank code for the card's issuing bank */
    cardBank: string;
    terminalSerialNumber: string;
}

export interface WebhookTokenizedCardData {
    tokenKey: string;
    cardType: string;
    tokenExpiryYear: string;
    tokenExpiryMonth: string;
    /** Masked PAN, e.g. "4***45**** ****111*" */
    cardPan: string;
}

export interface WebhookOrder {
    amount: number;
    orderId: string;
    cardType: string;
    accountId: string;
    cardLast4Digits: string;
    cardCurrency: string;
    customerEmail: string;
    customerId: string;
    /** Stringified boolean: "true" | "false" */
    isTokenizedCardPayment: string;
    orderReference: string;
    paymentMethod: string;
    callbackUrl: string;
    currency: string;
    orderMetaData?: Record<string, string>;
}

export interface WebhookCustomer {
    // ── Bank-transfer customer fields ──
    bankCode: string;
    senderName: string;
    recipientName: string;
    bankName: string;
    accountNumber: string;

    // ── POS card customer fields (payment_failed) ──
    /** ISO product / bank code for the card */
    productId: string;
    /** Masked PAN, e.g. "539983 **** **** 4297" */
    cardPan: string;

    // ── Online checkout customer fields (payment_success / web) ──
    /** Masked biller identifier */
    billerId: string;
}

export interface WebhookData {
    merchant?: WebhookMerchant;
    /** Empty object `{}` for API-originated transactions */
    terminal?: WebhookTerminal;
    /** Present on tokenized online card-checkout transactions */
    tokenizedCardData?: WebhookTokenizedCardData;
    transaction?: WebhookTransaction;
    customer?: WebhookCustomer;
    /** Present on online_checkout transactions */
    order?: WebhookOrder;
}

// ─── Root payload ─────────────────────────────────────────────────────────────
export interface WebhookPayload {
    event_type: EventType;
    requestId: string;
    data: WebhookData;
}

// ─── Error Handling ───────────────────────────────────────────────────────────
export interface NombaErrorResponse {
    code: string;
    description: string;
    data?: unknown;
}

export class NombaAPIError extends Error {
    public status: number;
    public code: string;
    public data?: unknown;

    constructor(message: string, status: number, code: string = "UNKNOWN_ERROR", data?: unknown) {
        super(message);
        this.name = "NombaAPIError";
        this.status = status;
        this.code = code;
        this.data = data;
    }
}

export class NombaRateLimitError extends NombaAPIError {
    public retryAfter?: number; // Time in seconds to wait before retrying

    constructor(message: string, retryAfter?: number) {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
        this.name = "NombaRateLimitError";
        this.retryAfter = retryAfter;
    }
}
