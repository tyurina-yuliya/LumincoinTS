import {AuthUtils} from "../../ulits/auth-utils";
import config from "../../config/config";

interface ApiResponse {
    error?: string;
    user?: {
        id: number;
        name: string;
        lastName: string;
    }
}

export class SignUp {
    readonly openNewRoute: (url: string) => Promise<void>;
    readonly nameInputElement!: HTMLElement | null;
    readonly nameErrorInputElement!: HTMLElement | null;
    readonly emailInputElement!: HTMLElement | null;
    readonly emailErrorInputElement!: HTMLElement | null;
    readonly passwordInputElement!: HTMLElement | null;
    readonly passwordErrorInputElement!: HTMLElement | null;
    readonly repeatPasswordInputElement!: HTMLElement | null ;
    readonly repeatPasswordErrorInputElement!: HTMLElement | null ;
    readonly commonErrorElement!: HTMLElement | null ;

    constructor(openNewRoute: (url: string) => Promise<void>) {

        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            this.openNewRoute('/').then();
            return;
        }

        this.nameInputElement = document.getElementById('name');
        this.nameErrorInputElement = document.getElementById('name-error');

        this.emailInputElement = document.getElementById('email');
        this.emailErrorInputElement = document.getElementById('email-error');

        this.passwordInputElement = document.getElementById('password');
        this.passwordErrorInputElement = document.getElementById('password-error');

        this.repeatPasswordInputElement = document.getElementById('repeat-password');
        this.repeatPasswordErrorInputElement = document.getElementById('repeat-password-error');

        this.commonErrorElement = document.getElementById('common-error');

        const processButton: HTMLElement | null = document.getElementById('process-button');
        if (processButton) {
            processButton.addEventListener('click', this.singUp.bind(this));
        }
    }

    private validateForm():boolean {
        let isValid: boolean = true;

        if (this.nameInputElement && this.nameErrorInputElement) {
            if ((this.nameInputElement as HTMLInputElement).value && (this.nameInputElement as HTMLInputElement).value.match(/^[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)*[^\s]$/)) {
                this.nameInputElement.classList.remove('is-invalid');
                this.nameErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.nameInputElement.classList.add('is-invalid');
                this.nameErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
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
            if ((this.passwordInputElement as HTMLInputElement).value && (this.passwordInputElement as HTMLInputElement).value.match(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
                this.passwordInputElement.classList.remove('is-invalid');
                this.passwordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.passwordInputElement.classList.add('is-invalid');
                this.passwordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }

        if (this.repeatPasswordErrorInputElement && this.repeatPasswordInputElement && this.passwordInputElement) {
            if ((this.repeatPasswordInputElement as HTMLInputElement).value && (this.repeatPasswordInputElement as HTMLInputElement).value === (this.passwordInputElement as HTMLInputElement).value) {
                this.repeatPasswordInputElement.classList.remove('is-invalid');
                this.repeatPasswordErrorInputElement.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.repeatPasswordInputElement.classList.add('is-invalid');
                this.repeatPasswordErrorInputElement.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        return isValid;
    }

    private async singUp(): Promise<void> {

        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }


        if (this.validateForm() && this.nameInputElement) {
            const fullName:string = (this.nameInputElement as HTMLInputElement).value.trim();
            const nameParts:string[] = fullName.split(' ');
            const firstName:string = nameParts[0];
            const lastName:string = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            const response: Response = await fetch(config.api + '/signup', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: firstName,
                    lastName: lastName,
                    email: (this.emailInputElement as HTMLInputElement).value,
                    password: (this.passwordInputElement as HTMLInputElement).value,
                    passwordRepeat: (this.repeatPasswordInputElement as HTMLInputElement).value,
                })
            });

            const result: ApiResponse = await response.json();

            if (result.error || !result.user || !result.user.id || !result.user.name || !result.user.lastName) {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }
            }

            if (result.user) {
                AuthUtils.setAuthInfo('', '', {
                    name: result.user.name,
                    lastName: result.user.lastName,
                    id: result.user.id
                })
            }
            await this.openNewRoute('/login');
        }
    }
}