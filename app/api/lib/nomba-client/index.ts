import { getNombaUrl } from "./utils";
import {
    NombaClientConfig,
    AuthenticateResponse,
    RefreshTokenResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    SubmitCardDetailsRequest,
    SubmitCardDetailsResponse,
    ChargeTokenizedCardRequest,
    ChargeTokenizedCardResponse,
    FetchCheckoutTransactionRequest,
    FetchCheckoutTransactionResponse,
    FilterTransactionsRequest,
    FilterTransactionsResponse,
    RefundOrderRequest,
    RefundOrderResponse,
    CancelOrderRequest,
    CancelOrderResponse,
    ListTokenizedCardsRequest,
    ListTokenizedCardsResponse,
    UpdateTokenizedCardRequest,
    UpdateTokenizedCardResponse,
    NombaAPIError,
    NombaRateLimitError,
    RequestSaveCardOTPRequest,
    RequestSaveCardOTPResponse,
    ResendSaveCardOTPRequest,
    ResendSaveCardOTPResponse,
    SubmitSaveCardOTPRequest,
    SubmitSaveCardOTPResponse,
} from "./types";

/** Max results per page, enforced on the client side (Nomba limit is 50) */
const MAX_PAGE_LIMIT = 50;

export class NombaClient {
    private clientId: string;
    private clientSecret: string;
    private accountId: string;
    private environment?: "sandbox" | "production";
    private baseUrl?: string;

    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiryTime: number | null = null; // timestamp in ms

    constructor(config: NombaClientConfig) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.accountId = config.accountId;
        this.environment = config.environment;
        this.baseUrl = config.baseUrl;
    }

    /**
     * Authenticate and retrieve access & refresh tokens.
     * https://developer.nomba.com/docs/guides/authentication-best-practises
     */
    async authenticate(): Promise<AuthenticateResponse> {
        const url = getNombaUrl("/v1/auth/token/issue", this.environment, this.baseUrl);
        const headers = {
            "Content-Type": "application/json",
            accountId: this.accountId,
        };
        const body = JSON.stringify({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const res = await fetch(url, {
            method: "POST",
            headers,
            body,
        });

        if (!res.ok) {
            throw new Error(`Authentication failed with status ${res.status}: ${await res.text()}`);
        }

        const data = (await res.json()) as AuthenticateResponse;
        if (data && data.data) {
            this.accessToken = data.data.access_token;
            this.refreshToken = data.data.refresh_token;
            // expires_in is an ISO date string. Subtract 5s safety margin.
            this.tokenExpiryTime = new Date(data.data.expires_in).getTime() - 5000;
        }

        return data;
    }

    /**
     * Refresh an expired access token using the refresh token.
     * https://developer.nomba.com/nomba-api-reference/authenticate/refresh-an-expired-token
     */
    async refreshAccessToken(): Promise<RefreshTokenResponse> {
        if (!this.refreshToken) {
            return this.authenticate();
        }

        const url = getNombaUrl("/v1/auth/token/refresh", this.environment, this.baseUrl);
        const headers = {
            "Content-Type": "application/json",
            accountId: this.accountId,
        };
        const body = JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: this.refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const res = await fetch(url, {
            method: "POST",
            headers,
            body,
        });

        if (!res.ok) {
            // If refreshing fails, re-authenticate completely
            return this.authenticate();
        }

        const data = (await res.json()) as RefreshTokenResponse;
        if (data && data.data) {
            this.accessToken = data.data.access_token;
            this.refreshToken = data.data.refresh_token;
            this.tokenExpiryTime = new Date(data.data.expires_in).getTime() - 5000;
        }

        return data;
    }

    /**
     * Get a valid access token, auto-authenticating or refreshing if expired.
     */
    private async getValidToken(): Promise<string> {
        if (!this.accessToken || !this.tokenExpiryTime) {
            await this.authenticate();
        } else if (Date.now() >= this.tokenExpiryTime) {
            await this.refreshAccessToken();
        }
        return this.accessToken!;
    }

    /**
     * Internal request wrapper with authentication auto-management and structured error handling.
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = await this.getValidToken();
        const url = getNombaUrl(endpoint, this.environment, this.baseUrl);

        const headers = new Headers(options.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("accountId", this.accountId);
        if (
            !headers.has("Content-Type") &&
            (options.method === "POST" || options.method === "PUT" || options.method === "PATCH")
        ) {
            headers.set("Content-Type", "application/json");
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorData: unknown;
            let code = "UNKNOWN_ERROR";
            let description = `Request to ${endpoint} failed with status ${response.status}`;

            try {
                const text = await response.text();
                description = text;
                const json = JSON.parse(text);
                errorData = json;
                if (json.code) code = json.code;
                if (json.description) description = json.description;
            } catch {
                // Ignore parse errors; description is already the raw text
            }

            if (response.status === 429) {
                const retryAfter = response.headers.get("Retry-After")
                    ? parseInt(response.headers.get("Retry-After")!)
                    : undefined;
                throw new NombaRateLimitError(description, retryAfter);
            }

            throw new NombaAPIError(description, response.status, code, errorData);
        }

        return (await response.json()) as T;
    }

    /**
     * Create an online checkout order.
     * POST /v1/checkout/order
     * https://developer.nomba.com/nomba-api-reference/online-checkout/create-an-online-checkout-order
     */
    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        return this.request<CreateOrderResponse>("/v1/checkout/order", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Submit customer card details to initiate a direct card charge.
     * POST /v1/checkout/checkout-card-detail
     * https://developer.nomba.com/nomba-api-reference/charge/submit-customer-card-details
     */
    async submitCardDetails(request: SubmitCardDetailsRequest): Promise<SubmitCardDetailsResponse> {
        return this.request<SubmitCardDetailsResponse>("/v1/checkout/checkout-card-detail", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async requestSaveCardOTP(request: RequestSaveCardOTPRequest) {
        return this.request<RequestSaveCardOTPResponse>("/v1/checkout/user-card/auth", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async resendSaveCardOTP(request: ResendSaveCardOTPRequest) {
        return this.request<ResendSaveCardOTPResponse>("/v1/checkout/resend-otp", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async submitSaveCardOTP(request: SubmitSaveCardOTPRequest) {
        return this.request<SubmitSaveCardOTPResponse>("/v1/checkout/checkout-card-otp", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Charge a customer using tokenized card data (recurring payments).
     * POST /v1/checkout/tokenized-card-payment
     * https://developer.nomba.com/nomba-api-reference/online-checkout/charge-a-customer-using-tokenized-card-data
     */
    async chargeTokenizedCard(request: ChargeTokenizedCardRequest): Promise<ChargeTokenizedCardResponse> {
        return this.request<ChargeTokenizedCardResponse>("/v1/checkout/tokenized-card-payment", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Verify/fetch the status of a checkout transaction by orderReference.
     * POST /v1/checkout/confirm-transaction-receipt
     * https://developer.nomba.com/nomba-api-reference/online-checkout/fetch-checkout-transaction
     */
    async fetchCheckoutTransaction(
        request: FetchCheckoutTransactionRequest,
    ): Promise<FetchCheckoutTransactionResponse> {
        return this.request<FetchCheckoutTransactionResponse>("/v1/checkout/confirm-transaction-receipt", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Filter/list transactions under the parent account.
     * GET /v1/transactions/accounts/{accountId}
     * Uses cursor-based pagination (limit + cursor).
     * https://developer.nomba.com/nomba-api-reference/transactions/filter-parent-account-transactions
     */
    async filterTransactions(request?: FilterTransactionsRequest): Promise<FilterTransactionsResponse> {
        const queryParams = new URLSearchParams();
        if (request) {
            if (request.limit !== undefined) queryParams.set("limit", String(Math.min(request.limit, MAX_PAGE_LIMIT)));
            if (request.cursor !== undefined) queryParams.set("cursor", request.cursor);
            if (request.status !== undefined) queryParams.set("status", request.status);
            if (request.dateFrom !== undefined) queryParams.set("dateFrom", request.dateFrom);
            if (request.dateTo !== undefined) queryParams.set("dateTo", request.dateTo);
            if (request.transactionRef !== undefined) queryParams.set("transactionRef", request.transactionRef);
        }

        const queryString = queryParams.toString();
        const endpoint = `/v1/transactions/accounts/${this.accountId}${queryString ? `?${queryString}` : ""}`;

        return this.request<FilterTransactionsResponse>(endpoint, {
            method: "GET",
        });
    }

    /**
     * Refund a completed checkout transaction (full or partial).
     * POST /v1/checkout/refund
     * https://developer.nomba.com/nomba-api-reference/online-checkout/refund-checkout-transaction
     */
    async refundOrder(request: RefundOrderRequest): Promise<RefundOrderResponse> {
        return this.request<RefundOrderResponse>("/v1/checkout/refund", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Cancel a pending (not yet paid) checkout order.
     * POST /v1/checkout/order/cancel
     * https://developer.nomba.com/nomba-api-reference/online-checkout/cancel-checkout-order
     */
    async cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse> {
        return this.request<CancelOrderResponse>("/v1/checkout/order/cancel", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * List tokenized cards for a merchant account, optionally filtered by email.
     * GET /v1/checkout/tokenized-card-data
     * https://developer.nomba.com/nomba-api-reference/online-checkout/list-tokenized-cards
     */
    async listTokenizedCards(request?: ListTokenizedCardsRequest): Promise<ListTokenizedCardsResponse> {
        const queryParams = new URLSearchParams();
        if (request) {
            if (request.customerEmail !== undefined) queryParams.set("customerEmail", request.customerEmail);
            if (request.startDate !== undefined) queryParams.set("startDate", request.startDate);
            if (request.endDate !== undefined) queryParams.set("endDate", request.endDate);
            if (request.page !== undefined) queryParams.set("page", String(request.page));
        }

        const queryString = queryParams.toString();
        const endpoint = `/v1/checkout/tokenized-card-data${queryString ? `?${queryString}` : ""}`;

        return this.request<ListTokenizedCardsResponse>(endpoint, {
            method: "GET",
        });
    }

    /**
     * Update tokenized card data.
     * PUT /v1/checkout/tokenized-card-data
     * https://developer.nomba.com/nomba-api-reference/online-checkout/update-tokenized-card-data
     */
    async updateTokenizedCard(request: UpdateTokenizedCardRequest): Promise<UpdateTokenizedCardResponse> {
        return this.request<UpdateTokenizedCardResponse>("/v1/checkout/tokenized-card-data", {
            method: "PUT",
            body: JSON.stringify(request),
        });
    }
}
