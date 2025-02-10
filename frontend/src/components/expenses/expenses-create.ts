import {HttpUtils} from "../../ulits/http-utils";
import { RequestResultType } from "../../types/request-result.type";

export class ExpensesCreate {
    readonly openNewRoute: (url: string) => Promise<void>;
    readonly createExpenseElement: HTMLElement  | null;
    readonly createExpenseErrorElement: HTMLElement | null;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        this.createExpenseElement = document.getElementById('expenseTitle');
        this.createExpenseErrorElement = document.getElementById('expenseTitleError');

        const createButton: HTMLElement | null = document.getElementById('createButton');
        if (createButton) {
            createButton.addEventListener('click', this.createNewExpense.bind(this))
        }
    }

    private validateForm(): boolean {
        let isValid: boolean = true;
        if (this.createExpenseElement && this.createExpenseErrorElement && (this.createExpenseElement as HTMLInputElement).value) {
            this.createExpenseElement.classList.remove('is-invalid');
            this.createExpenseErrorElement.classList.replace('invalid-feedback', 'valid-feedback');
        } else if (this.createExpenseElement && this.createExpenseErrorElement) {
            this.createExpenseElement.classList.add('is-invalid');
            this.createExpenseErrorElement.classList.replace('valid-feedback', 'invalid-feedback');
            isValid = false;
        }
        return isValid;
    }

    private async createNewExpense(e: { preventDefault: () => void; }): Promise<void> {
        e.preventDefault();

        if (this.validateForm()) {
            const result: RequestResultType = await HttpUtils.request('/categories/expense', 'POST', true,{
                title: (this.createExpenseElement as HTMLInputElement).value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при создании расхода! Обратитесь в поддержку.");
            }
            await this.openNewRoute('/expenses');
        }
    }


}