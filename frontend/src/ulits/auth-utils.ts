import config from "../config/config";
import { UserInfoType } from "../types/user-info.type";
import {TokensType} from "../interfaces/tokens-type.interface";

export class AuthUtils {
    public static accessTokenKey: string = "accessToken";
    public static refreshTokenKey: string = "refreshToken";
    public static userInfoTokenKey: string = "userInfo";

    private static refreshPromise: Promise<boolean> | null = null;

   public static setAuthInfo(accessToken:string, refreshToken:string, userInfo:UserInfoType | null = null):void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        if (userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    public static deleteAuthInfo(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    public static getAuthInfo(key: string | undefined): string | { [x: string]: string | null } | null {
        if (key &&[this.accessTokenKey,this.refreshTokenKey,this.userInfoTokenKey].includes(key)) {
            [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key);
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            };
        }
    }

    public static async updateRefreshToken():Promise<boolean> {
        if (!this.refreshPromise) {
            this.refreshPromise = (async ():Promise<boolean> => {
                let result: boolean = false;
                const refreshToken: string | { [x: string]: string | null; } | null = this.getAuthInfo(this.refreshTokenKey);
                if (refreshToken) {
                    const response: Response = await fetch(config.api + "/refresh", {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            refreshToken: refreshToken,
                        }),
                    });

                    if (response && response.status === 200) {
                        const tokens: TokensType = await response.json(); // ТУТ КАКОЙ ТИП НЕ ПОЙМУ ???
                        if (tokens && !tokens.error) {
                            this.setAuthInfo(
                                tokens.tokens.accessToken,
                                tokens.tokens.refreshToken
                            );
                            result = true;
                        }
                    }
                }
                if (!result) {
                    console.log("Invalid refresh token, deleting auth info");
                    this.deleteAuthInfo();
                }
                return result;
            })();
        }

        const refreshResult: boolean = await this.refreshPromise;

        if (refreshResult) {
            this.refreshPromise = null;
        }

        return refreshResult;
    }
}