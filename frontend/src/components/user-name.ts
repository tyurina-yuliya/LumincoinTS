import {AuthUtils} from "../ulits/auth-utils";
import { UserInfoType } from "../types/user-info.type";

export class UserName {
    constructor() {
        const userInfo = AuthUtils.getAuthInfo(AuthUtils.userInfoTokenKey);
        if (typeof userInfo === 'string') {
            const parsedUserInfo: UserInfoType | null = JSON.parse(userInfo);
            if (parsedUserInfo) {
                const firstName: string = parsedUserInfo.name || '';
                const lastName: string = parsedUserInfo.lastName || '';
                const fullName: string = `${firstName} ${lastName}`.trim();

                const userNameElement: HTMLElement | null = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = fullName;
                }
            }
        }
    }
}