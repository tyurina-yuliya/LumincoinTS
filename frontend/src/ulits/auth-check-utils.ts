import {AuthUtils} from "./auth-utils";

export class AuthCheckUtils {
    readonly openNewRoute: (route: string) => void;

    constructor(openNewRoute:(route: string) => void) {

        this.openNewRoute = openNewRoute;

    }

   public checkAndRedirect(): boolean {
        const accessToken: string | object | null = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (!accessToken) {
            this.openNewRoute('/login');
            return false;
        }
        return true;
    }

}