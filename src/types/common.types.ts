
export interface APIRequestConfig {
    method: string;
    url?: string;
    allowNull?: boolean;
    baseURL?: string;
    queryParams?: Record<string, string | never>;
    bodyData?: Record<string, number | string | never>;
    formHeaders?: Record<string, string>;
    removeHeaders?: boolean;
    ip?: string;
    token?: string;
}