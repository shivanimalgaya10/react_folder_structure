import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

import {
    removeLocalStorageToken,
    removeSessionStorageToken,
    // getSessionStorageToken,
    getLocalStorageToken
} from '@/utils/common/common.utils';
import config from '@/config';
import { APIRequestConfig } from '@/types/common.types';

const APIrequest = async ({
    method,
    url,
    baseURL,
    queryParams,
    bodyData,
    formHeaders,
    removeHeaders,
    ip,
    allowNull = false,
    token = ''
}: APIRequestConfig) => {
    const apiToken = token !== '' ? token : getLocalStorageToken();

    // const language = getLocalStorageLanguage();
    // const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
        const axiosConfig: AxiosRequestConfig = {
            method: method || 'GET',
            baseURL: config.API_BASE_URL,
            headers: {
                'content-type': 'application/json'
            }
        };
        if (ip) {
            axiosConfig.headers = axiosConfig.headers ?? {};
            axiosConfig.headers.ip = ip;
        }

        if (formHeaders) {
            axiosConfig.headers = { ...axiosConfig.headers, ...formHeaders };
        }

        if (baseURL) {
            axiosConfig.baseURL = baseURL;
        }

        if (url) {
            axiosConfig.url = url;
        }

        if (queryParams) {
            const queryParamsPayload: { [key: string]: unknown } = {};
            for (const key in queryParams) {
                if (Object.hasOwnProperty.call(queryParams, key)) {
                    let element = queryParams[key];
                    if (typeof element === 'string') {
                        element = element.trim();
                    }
                    if (!['', null, undefined, NaN].includes(element)) {
                        queryParamsPayload[key] = element;
                    }
                }
            }
            axiosConfig.params = queryParamsPayload;
        }

        if (bodyData) {
            if (bodyData instanceof FormData) {
                for (const [key, value] of bodyData.entries()) {
                    if (value == 'null') {
                        bodyData.delete(key);
                    }
                }
                axiosConfig.data = bodyData;
            } else {
                const bodyPayload: { [key: string]: unknown } = {};
                for (const key in bodyData) {
                    if (Object.hasOwnProperty.call(bodyData, key)) {
                        let element = bodyData[key];
                        if (typeof element === 'string') {
                            element = element.trim();
                        }
                        if (![null, undefined, NaN].includes(element as number) && !allowNull) {
                            bodyPayload[key] = element; 
                        } else {
                            bodyPayload[key] = element;
                        }
                    }
                }
                axiosConfig.data = bodyPayload;
            }
        }

        if (removeHeaders) {
            delete axiosConfig.headers;
        }

        if (apiToken) {
            axiosConfig.headers = {
                ...axiosConfig.headers,
                authorization: `Bearer ${apiToken}`
            };
        }

        const res = await axios(axiosConfig);
        return res.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            throw new Error(error as unknown as string);
        } else {
            const errorRes = (error as { response: AxiosResponse }).response;
            if (errorRes && errorRes.status && errorRes.status === 403) {
                if (window.location.pathname !== '/login') {
                    window.location.replace('/login');
                    toast.error('You do not have permission to access this route');
                }
            }
            if (errorRes.data.message) {
                if ([401].includes(errorRes.status)) {
                    removeLocalStorageToken();
                    removeSessionStorageToken();
                    if (window.location.pathname !== '/login') {
                        window.location.replace('/login');
                        // store.dispatch(logout());
                        toast.error('Session expired please login again!');
                    }
                } else if ([404].includes(errorRes.status) && 
                (errorRes?.data?.message === 'Data not found.' ||
                    errorRes?.data?.message === 'No data found')) {
                    return errorRes.data;
                }
                else {
                    toast.error(errorRes.data.message);
                }
            } else {
                toast.error(errorRes?.data?.[0]?.message || errorRes?.statusText || 'Not Found');
            }
            if (
                Object.keys(errorRes.data.error).length &&
                [401].includes(errorRes.data.error.status)
            ) {
                removeSessionStorageToken();
                removeLocalStorageToken();
                if (window.location.pathname !== '/login') { 
                    window.location.replace('/login');
                }
            }
            if (errorRes?.data?.message) {
                if (window.location.pathname !== '/login') toast.error(errorRes?.data?.message);
                else toast.error('Invalid credentials');
            } else if (errorRes?.data?.error?.length > 0 && errorRes?.data?.error) {
                toast(errorRes?.data?.error?.[0]?.message);
            }
            return null;
        } 
    }
};

export default APIrequest;
