import {DatePickingUtil} from "../../ulits/date-picking-util";
import {HttpUtils} from "../../ulits/http-utils";
import { FilteredOperationsType } from "../../types/filtered-operations.type";
import { RequestResultType } from "../../types/request-result.type";

interface Operation {
    id: number;
    type: 'income' | 'expenses';
    category: string;
    amount: number;
    date: string;
    comment?: string;
}

export class IncomeAndExpenses {
    readonly openNewRoute: (url: string) => Promise<void>;
    private allOperations: FilteredOperationsType[] = [];
    private filteredOperations: FilteredOperationsType[] = [];
    private operationToDelete: string | null;

    constructor(openNewRoute: (url: string)=> Promise<void>)  {

        this.openNewRoute = openNewRoute;
        this.allOperations = [];
        this.filteredOperations = [];
        this.operationToDelete = null;

        this.setDateFilterListeners(); // Устанавливаем обработчики для фильтров даты

        DatePickingUtil.datePicking(() => {});
        this.getOperations().then();
        this.filterOperations();
        this.setModalListeners().then();
    }

    private async getOperations(): Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/operations?period=all');

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert("Возникла ошибка при запросе доходов и расходов! Обратитесь в поддержку.");
        }
        this.allOperations = result.response;
        this.showRecords(result.response);

        this.filterOperations();
    }

   private filterOperations(startDate: Date | null = null, endDate: Date | null = null):void {
       const today: Date = new Date();
       let filtered: FilteredOperationsType[] = [];
        if (startDate && endDate) {
            filtered = this.allOperations.filter(operation => {
                const operationDate: Date = new Date(operation.date);
                return operationDate >= startDate && operationDate <= endDate;
            });
        } else {
            // По умолчанию "сегодня"
            filtered = this.allOperations.filter(operation => {
                const operationDate = new Date(operation.date);
                return operationDate.toDateString() === today.toDateString();
            });
        }
        this.filteredOperations = filtered;
        this.showRecords(this.filteredOperations as Operation[]);
    }

    private setDateFilterListeners(): void {
        const todayButton: HTMLElement | null = document.querySelector('#todayBtn');
        if (todayButton) {
            todayButton.addEventListener('click', () => this.filterOperations());
        }

        const weekButton: HTMLElement | null = document.querySelector('#weekBtn');
        if (weekButton) {
            weekButton.addEventListener('click', () => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                this.filterOperations(weekAgo, today);
            });
        }

        const monthButton: HTMLElement | null = document.querySelector('#monthBtn');
        if (monthButton) {
            monthButton.addEventListener('click', () => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                this.filterOperations(monthAgo, today);
            });
        }

        const yearButton: HTMLElement | null= document.querySelector('#yearBtn');
        if (yearButton) {
            yearButton.addEventListener('click', () => {
                const today = new Date();
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                this.filterOperations(yearAgo, today);
            });
        }

        const allButton: HTMLElement | null = document.querySelector('#allBtn');
        if (allButton) {
            allButton.addEventListener('click', () => this.showRecords(this.allOperations as Operation[]));
        }

        const intervalButton: HTMLElement | null = document.querySelector('#intervalBtn');
        if (intervalButton) {
            intervalButton.addEventListener('click', () => {
                const startDate = new Date((document.querySelector('#startDate') as HTMLInputElement).value);
                const endDate = new Date((document.querySelector('#endDate') as HTMLInputElement).value);
                if (startDate && endDate) {
                    this.filterOperations(startDate, endDate);
                }
            });
        }
    }

    showRecords(operations: Operation[]):void {

        const recordsElement: HTMLElement | null = document.getElementById('records');
        if (recordsElement) {
            recordsElement.innerHTML = '';

            let index: number = 1;
            operations.forEach((operation): void => {

                const trElement: HTMLElement | null = document.createElement('tr');
                const formattedDate: string = new Date(operation.date).toLocaleDateString('ru-RU');
                const typeClass: string = operation.type === 'income' ? 'table-type-income' : 'table-type-expenses';
                const typeText: string = operation.type === 'income' ? 'доход' : 'расход';

                trElement.innerHTML = `
            <th scope="row" class="text-center">${index}</th>
            <td class="${typeClass}">${typeText}</td>
              <td class="custom-table-with">${operation.category}</td>
            <td>${operation.amount + ' $'}</td>
            <td>${formattedDate}</td>
            <td class="custom-table-with">${operation.comment}</td>
            <td class="table-actions-buttons d-flex align-items-center justify-content-end">
                <div class="delete-table" data-operation-id="${operation.id}" data-bs-toggle="modal" data-bs-target="#deleteModal">
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z"
                                      fill="black"/>
                                <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z"
                                      fill="black"/>
                                <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z"
                                      fill="black"/>
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z"
                                      fill="black"/>
                            </svg>
                </div>
                <a href="/income-and-expenses-edit?id=${operation.id}" class="edit-table">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"xmlns="http://www.w3.org/2000/svg">
                       <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z"
                                      fill="black"/>
                    </svg>
                </a>
            </td>
            `
                index++;
                recordsElement.appendChild(trElement);
            });
            this.attachDeleteListeners();
        }
    }

   private attachDeleteListeners(): void {
        const deleteButtons: NodeListOf<Element> = document.querySelectorAll('.delete-table');
        if (deleteButtons.length === 0) {
            return;
        }

        deleteButtons.forEach(button => {
            button.addEventListener('click', (event: Event): void => {
                const target = event.currentTarget as HTMLElement;
                const operationId: string | null = target.getAttribute('data-operation-id');
                if (target) {
                    this.operationToDelete = operationId;
                }
            });
        });
    }


    private async setModalListeners(): Promise<void> {
        const modalSuccessButton: HTMLElement | null = document.querySelector('.btn-modal-success');

        if (!modalSuccessButton) {
            return;
        }
        modalSuccessButton.addEventListener('click', async (): Promise<void> => {
            if (this.operationToDelete) {
                const result:any = await HttpUtils.request('/operations/' + this.operationToDelete, 'DELETE', true);

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }
                if (result.error || !result.response || (result.response && result.response.error)) {
                    return alert("Возникла ошибка при удалении Операции! Обратитесь в поддержку.");
                }

                await this.openNewRoute('/income-and-expenses');
            }
        });
    }
}
