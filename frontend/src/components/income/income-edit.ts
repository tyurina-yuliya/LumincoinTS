import {HttpUtils} from "../../ulits/http-utils";
import { RequestResultType } from "../../types/request-result.type";

export class IncomeEdit {
    readonly openNewRoute: (url: string) => Promise<void>;
    readonly editIncomeElement: HTMLElement | null;
    readonly editIncomeErrorElement: HTMLElement | null;
    readonly id: string | null ;

    constructor(openNewRoute: (url: string) => Promise<void>)  {
        this.openNewRoute = openNewRoute;

        this.editIncomeElement = document.getElementById('incomeTitle');
        this.editIncomeErrorElement = document.getElementById('incomeTitleError');

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        this.checkId().then();

        if (this.id) {
            this.getIncome(this.id).then();
        }

        const updateButton: HTMLElement | null = document.getElementById('updateButton')
        if (updateButton) {
            updateButton.addEventListener('click', this.updateIncome.bind(this));
        }
    }

    private async checkId(): Promise<void> {
        if (!this.id) {
            await this.openNewRoute('/');
        }
    }

    private async getIncome(id: string): Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/categories/income/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании дохода! Обратитесь в поддержку.");
        }

        this.showIncome(result.response);
    }

    private showIncome(income:{ id: string, title: string }):void  {
        if (income.title) {
            (this.editIncomeElement as HTMLInputElement).value = income.title;
        }
    }

    private validateForm(): boolean {
        let isValid: boolean = true;
        if (this.editIncomeElement && this.editIncomeErrorElement && (this.editIncomeElement as HTMLInputElement).value) {
            this.editIncomeElement.classList.remove('is-invalid');
            this.editIncomeErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else if (this.editIncomeElement && this.editIncomeErrorElement) {
            this.editIncomeElement.classList.add('is-invalid');
            this.editIncomeErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    private async updateIncome(e: { preventDefault: () => void; }):Promise<void> {
        e.preventDefault();
        if (this.validateForm()) {

            const result: RequestResultType = await HttpUtils.request('/categories/income/' + this.id, 'PUT', true,{
                title: (this.editIncomeElement as HTMLInputElement).value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при редактировании дохода! Обратитесь в поддержку.");
            }
            await this.openNewRoute('/income');
        }
    }
}