import {HttpUtils} from "../../ulits/http-utils";
import {AuthUtils} from "../../ulits/auth-utils";
import { RequestResultType } from "../../types/request-result.type";

export class Login {
    readonly openNewRoute: (url: string) => Promise<void>;
    readonly emailInputElement: HTMLElement | null;
    readonly emailErrorInputElement: HTMLElement | null;
    readonly passwordInputElement: HTMLElement | null;
    readonly passwordErrorInputElement: HTMLElement | null;
    private rememberMeElement: HTMLElement | null;
    readonly commonErrorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => Promise<void>) {

        this.openNewRoute = openNewRoute;

        this.emailInputElement = document.getElementById('email');
        this.emailErrorInputElement = document.getElementById('email-error');

        this.passwordInputElement = document.getElementById('password');
        this.passwordErrorInputElement = document.getElementById('password-error');

        this.rememberMeElement = document.getElementById('remember');
        this.commonErrorElement = document.getElementById('common-error');

        const processButton: HTMLElement | null = document.getElementById('process-button')
        if (processButton) {
            processButton.addEventListener('click', this.login.bind(this));
        }
    }

    private validateForm(): boolean {
        let isValid: boolean = true;

        if (this.emailInputElement && this.emailErrorInputElement) {
            if ((this.emailInputElement as HTMLInputElement).value && (this.emailInputElement as HTMLInputElement).value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
                this.emailInputElement.classList.remove('is-invalid');
                this.emailErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.emailInputElement.classList.add('is-invalid');
                this.emailErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }

        if (this.passwordInputElement && this.passwordErrorInputElement) {
            if ((this.passwordInputElement as HTMLInputElement).value) {
                this.passwordInputElement.classList.remove('is-invalid');
                this.passwordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.passwordInputElement.classList.add('is-invalid');
                this.passwordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        return isValid;
    }


    private async login(): Promise<void> {

        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        if (this.validateForm()) {
            const result: RequestResultType = await HttpUtils.request('/login', 'POST', false, {
                email: (this.emailInputElement as HTMLInputElement).value,
                password: (this.passwordInputElement as HTMLInputElement).value,
                rememberMe: (this.rememberMeElement as HTMLInputElement).checked
            });


            if (result.error || !result.response || (result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken || !result.response.user.id || !result.response.user.name || !result.response.user.lastName))) {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }
            }

            AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
                name: result.response.user.name,
                lastName: result.response.user.lastName,
                id: result.response.user.id
            });

            await this.openNewRoute('/');
        }

    }

}