import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";
import { RequestResultType } from "../../types/request-result.type";
import {Category} from "../../interfaces/category.interface";

// interface Category {
//     id: number;
//     title: string;
// }

export class IncomeAndExpensesEdit {
    readonly openNewRoute: (url: string) => Promise<void>;
    private incomeExpenseSelector: HTMLElement | null;
    private operationCategorySelect: HTMLElement | null;
    private operationCategorySelectError: HTMLElement | null;
    private operationAmountInput: HTMLElement | null ;
    private operationAmountErrorInput: HTMLElement | null;
    private operationDatepickerInput: HTMLElement | null;
    private operationDatepickerErrorInput: HTMLElement | null;
    private operationCommentaryInput: HTMLElement | null;
    private operationCommentaryErrorInput: HTMLElement | null;
    private categoriesMap: { [key: string]: number };
    readonly id: string | null ;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;

        DatePickingUtil.datePicking((): void => {});

        this.incomeExpenseSelector = document.getElementById('operationSelector');

        this.operationCategorySelect = document.getElementById('operationCategory');
        this.operationCategorySelectError = document.getElementById('operationCategoryError');

        this.operationAmountInput = document.getElementById('operationAmount');
        this.operationAmountErrorInput = document.getElementById('operationAmountError');

        this.operationDatepickerInput = document.getElementById('operationDatepicker');
        this.operationDatepickerErrorInput = document.getElementById('operationDatepickerError');

        this.operationCommentaryInput = document.getElementById('operationCommentary');
        this.operationCommentaryErrorInput = document.getElementById('operationCommentaryError');

        this.categoriesMap = {};

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        this.id = urlParams.get('id');
        this.checkId().then();

        if (this.id) {
            this.getOperation(this.id).then();
        }

        const editButton: HTMLElement | null = document.getElementById('editButton');
        if (editButton) {
            editButton.addEventListener('click',this.updateOperation.bind(this));
        }
    }

    private async checkId(): Promise<void> {
        if (!this.id) {
            await this.openNewRoute('/');
        }
    }

    private async getOperation(id: string): Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert("Возникла ошибка при редактировании операции! Обратитесь в поддержку.");
        }
        this.showOperation(result.response).then();
    }

    async showOperation(operation: { type: string, category_id: number | string, category: string, amount: number  , date: string , comment: string }): Promise<void> {
        (this.incomeExpenseSelector as HTMLSelectElement).value = operation.type === 'income' ? '1' : '2';

        await this.updateOperationCategories();

        (this.operationCategorySelect as HTMLSelectElement).value = operation.category_id = operation.category;

        (this.operationAmountInput as HTMLInputElement).value = operation.amount.toString();
        (this.operationDatepickerInput as HTMLInputElement).value = new Date(operation.date).toLocaleDateString('ru-RU');
        (this.operationCommentaryInput as HTMLInputElement).value = operation.comment;
    }

    private async updateOperationCategories(): Promise<void> {
        const selectedValue: string | null = (this.incomeExpenseSelector as HTMLSelectElement).value;
        let url: string = selectedValue === "1" ? '/categories/income' : '/categories/expense';

        const result: RequestResultType = await HttpUtils.request(url);
        if (result.error || !result.response) {
            alert("Ошибка загрузки категорий!");
            return;
        }
        if (this.operationCategorySelect) {
            this.operationCategorySelect.innerHTML = '<option value="">Выберите категорию</option>';
            this.categoriesMap = {};

            const categories: Category[] = result.response;

            categories.forEach(item => {
                const option: HTMLElement | null = document.createElement('option');

                (option as HTMLInputElement).value = item.title;
                option.textContent = item.title;

                this.categoriesMap[item.title] = item.id; // мапит title в ID
                if (this.operationCategorySelect) {
                    this.operationCategorySelect.appendChild(option);
                }
            });
        }
    }

    // Функция для конвертации формата даты
    private convertToBackendFormat(dateStr: string): string {
        // Ожидаемый формат: DD.MM.YYYY
        const [day, month, year] = dateStr.split(".");
        // Возвращаем дату в формате YYYY-MM-DD
        return `${year}-${month}-${day}`;
    }

    private validateForm(): boolean {
        let isValid: boolean = true;

        if (this.operationCategorySelect && this.operationCategorySelectError) {
            if ((this.operationCategorySelect as HTMLInputElement).value) {
                this.operationCategorySelect.classList.remove('is-invalid');
                this.operationCategorySelectError.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationCategorySelect.classList.add('is-invalid');
                this.operationCategorySelectError.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }

        if (this.operationAmountInput && this.operationAmountErrorInput) {
            if ((this.operationAmountInput as HTMLInputElement).value) {
                this.operationAmountInput.classList.remove('is-invalid');
                this.operationAmountErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationAmountInput.classList.add('is-invalid');
                this.operationAmountErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }

        if (this.operationDatepickerInput && this.operationDatepickerErrorInput) {
            if ((this.operationDatepickerInput as HTMLInputElement).value) {
                this.operationDatepickerInput.classList.remove('is-invalid');
                this.operationDatepickerErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationDatepickerInput.classList.add('is-invalid');
                this.operationDatepickerErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }

        if (this.operationCommentaryInput && this.operationCommentaryErrorInput) {
            if ((this.operationCommentaryInput as HTMLInputElement).value) {
                this.operationCommentaryInput.classList.remove('is-invalid');
                this.operationCommentaryErrorInput.classList.replace('invalid-feedback', 'valid-feedback');
            } else {
                this.operationCommentaryInput.classList.add('is-invalid');
                this.operationCommentaryErrorInput.classList.replace('valid-feedback', 'invalid-feedback');
                isValid = false;
            }
        }
        return isValid;
    }

    async updateOperation(e: { preventDefault: () => void; }):Promise<void>  {
        e.preventDefault();

        if (this.validateForm()) {
            const operationType: string = (this.incomeExpenseSelector as HTMLSelectElement).value === "1" ? "income" : "expense";
            const formattedDate: string = this.convertToBackendFormat((this.operationDatepickerInput as HTMLInputElement).value);
            const categoryTitle: string = (this.operationCategorySelect as HTMLSelectElement).value;
            const categoryId: number | null = this.categoriesMap[categoryTitle];
            const operationAmount: number | null = parseFloat((this.operationAmountInput as HTMLInputElement).value);

            const result: RequestResultType = await HttpUtils.request('/operations/' + this.id, 'PUT', true,{
                type: operationType,
                amount: operationAmount,
                date: formattedDate,
                comment: (this.operationCommentaryInput as HTMLInputElement).value,
                category_id: categoryId ,
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }
            if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
                return alert("Возникла ошибка при редактировании категории! Обратитесь в поддержку.");
            }
            await this.openNewRoute('/income-and-expenses');
        }
    }
}