import {HttpUtils} from "../../ulits/http-utils";
import { RequestResultType } from "../../types/request-result.type";

export class IncomeCreate {
    readonly openNewRoute: (url: string) => Promise<void>;
    readonly createIncomeElement: HTMLElement | null;
    readonly createIncomeErrorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        this.createIncomeElement = document.getElementById('incomeTitle');
        this.createIncomeErrorElement = document.getElementById('incomeTitleError');

        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
            createButton.addEventListener('click', this.createNewIncome.bind(this))
        }
    }

    private validateForm():boolean {
        let isValid: boolean = true;
        if (this.createIncomeElement && this.createIncomeErrorElement && (this.createIncomeElement as HTMLInputElement).value) {
            this.createIncomeElement.classList.remove('is-invalid');
            this.createIncomeErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else if (this.createIncomeElement && this.createIncomeErrorElement) {
            this.createIncomeElement.classList.add('is-invalid');
            this.createIncomeErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    private async createNewIncome(e: { preventDefault: () => void; }):Promise<void> {
        e.preventDefault();

        if (this.validateForm()) {
            const result: RequestResultType = await HttpUtils.request('/categories/income', 'POST', true,{
                title: (this.createIncomeElement as HTMLInputElement).value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при создании дохода! Обратитесь в поддержку.");
            }
            await this.openNewRoute('/income');
        }
    }
}