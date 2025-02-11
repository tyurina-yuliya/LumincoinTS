import config from "../config/config";
import {AuthUtils} from "./auth-utils";
import { RequestResultType } from "../types/request-result.type";

export class HttpUtils {
   public static async request(url: string, method: string = 'GET', useAuth: boolean = true, body: object | string | null  = null): Promise<RequestResultType> {

        const result: RequestResultType  = {
            error: false,
            response: null
        };

        const params: RequestInit = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            }  as { [key: string]: string },
        }

       let tokenData: ReturnType<typeof AuthUtils.getAuthInfo> = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
       let token: string | null = null;

       if (typeof tokenData === 'string') {
           token = tokenData;
       } else if (tokenData && typeof tokenData === 'object') {
           token = tokenData[AuthUtils.accessTokenKey] || null;
       }

       if (useAuth && token) {
           (params.headers as { [key: string]: string }) ['x-auth-token'] = token;
       }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response: Response | null = null;

        try {
            response = await fetch(config.api + url, params);
            result.response = await response.json();
        } catch (e) {
            result.error = true;
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true;
            if (useAuth && response.status === 401) {
                if (!token) {
                    result.redirect = '/login';
                } else {
                    const updateTokenResult: boolean | null = await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        return this.request(url, method, useAuth, body);
                    } else {
                        result.redirect = '/login';
                    }
                }
            }
        }

        return result;
    }
}