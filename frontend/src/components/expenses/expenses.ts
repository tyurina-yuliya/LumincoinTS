import {HttpUtils} from "../../ulits/http-utils";
import { RequestResultType } from "../../types/request-result.type";
import * as bootstrap from 'bootstrap';

export class Expenses {
    readonly openNewRoute: (url: string) => Promise<void>;
    private selectedExpenseId: string | null;
    private selectedExpenseTitle: string | null;
    readonly modalInstance: bootstrap.Modal | null;

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;
        this.selectedExpenseId = null;
        this.selectedExpenseTitle = null;

        const deleteModalElement: HTMLElement | null = document.getElementById('deleteModal');
        this.modalInstance = deleteModalElement ? new bootstrap.Modal(deleteModalElement) : null;
        if (deleteModalElement) {
            deleteModalElement.addEventListener('hidden.bs.modal', () => {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            });
        }

        this.getExpenses().then();
        const deleteButton: HTMLElement | null = document.getElementById('deleteButton')
        if (deleteButton) {
            deleteButton.addEventListener('click', this.deleteExpense.bind(this));
        }
    }

    private async getExpenses(): Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/categories/expense');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе расходов! Обратитесь в поддержку.");
        }

        this.showRecords(result.response);

    }

    private showRecords(expenses:{ id: string, title: string }[]): void {

        const container: HTMLElement | null = document.getElementById('category-container');
        const createButton: HTMLElement | null = document.getElementById('addNew');

        expenses.forEach(expense => {
            const categoryBlock: HTMLElement | null = document.createElement('div');
            categoryBlock.classList.add('category-block');

            const blockTitle: HTMLElement | null = document.createElement('div');
            blockTitle.classList.add('block-title');
            blockTitle.innerText = expense.title;

            const categoryActions: HTMLElement | null = document.createElement('div');
            categoryActions.classList.add('category-actions');
            categoryActions.innerHTML = `
            <a href="/expenses-edit?id=${expense.id}" class="btn btn-primary me-2">Редактировать</a>
            <a href="#" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${expense.id}">Удалить</a>
            `

            const dangerButton: HTMLElement | null = categoryActions.querySelector('.btn-danger');
            if (dangerButton) {
                dangerButton.addEventListener('click', (e): void => {
                    this.selectedExpenseId = expense.id;
                    this.selectedExpenseTitle = expense.title;
                    this.updateModalText();
                });
            }
            categoryBlock.appendChild(blockTitle);
            categoryBlock.appendChild(categoryActions);
            if (container) {
                container.appendChild(categoryBlock);
            }
        });
        if (container && createButton) {
            container.appendChild(createButton);
        }
    }

    private updateModalText(): void {
        const modalTitleElement: HTMLElement | null = document.getElementById('deleteModalLabel');
        if (modalTitleElement && this.selectedExpenseTitle) {
            modalTitleElement.innerText = `Вы действительно хотите удалить категорию "${this.selectedExpenseTitle}"?`;
        }
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    private async deleteExpense(): Promise<void> {
        if (this.selectedExpenseId) {
            const result:RequestResultType = await HttpUtils.request('/categories/expense/' + this.selectedExpenseId, 'DELETE', true);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                return alert("Возникла ошибка при удалении расхода! Обратитесь в поддержку.");
            }

            const expenseBlock: HTMLElement | null = document.querySelector(`.category-block[data-id="${this.selectedExpenseId}"]`);
            if (expenseBlock) {
                expenseBlock.remove();
            }
            if (this.modalInstance) {
                this.modalInstance.hide();
            }

            await this.openNewRoute('/expenses');
        }
    }
}