import {AuthUtils} from "../../ulits/auth-utils";
import {HttpUtils} from "../../ulits/http-utils";

export class Logout {
    readonly openNewRoute: (url: string) => Promise<void>;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            this.openNewRoute('/login').then();
            return;
        }
        this.logout().then();
    }

    private async logout(): Promise<void> {

        await HttpUtils.request('/logout', 'POST', false, {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey),
        });
        AuthUtils.deleteAuthInfo();
        await this.openNewRoute('/login');
    }

}
