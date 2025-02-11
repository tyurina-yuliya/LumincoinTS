import Chart from "chart.js/auto";
import {DatePickingUtil} from "../ulits/date-picking-util";
import {HttpUtils} from "../ulits/http-utils";
import { RequestResultType } from "../types/request-result.type";
import { ChartConfiguration } from "chart.js";
import {Operation} from "../interfaces/operation.interface";
import {Operations} from "../interfaces/operations.interface";
import {ChartData} from "../interfaces/chart-data.interface";
import {legendMargin} from "../interfaces/legend-margin.interface";

export class Main {
    readonly openNewRoute: (url: string) => Promise<void>;
    private operations: Operation[];
    readonly incomeChart: HTMLCanvasElement | null;
    readonly expensesChart: HTMLCanvasElement | null;
    private incomeChartInstance: Chart | null;
    private expensesChartInstance: Chart | null;
    private incomeOperations: Operation[];
    private expenseOperations: Operation[];

    constructor(openNewRoute: (url: string) => Promise<void>) {
        this.openNewRoute = openNewRoute;
        this.operations = [];
        this.incomeOperations = [];
        this.expenseOperations = [];

        this.incomeChart = document.getElementById("incomeChart") as HTMLCanvasElement | null;
        this.expensesChart = document.getElementById("expensesChart") as HTMLCanvasElement | null;

        this.incomeChartInstance = null;
        this.expensesChartInstance = null;

        this.setDateFilterListeners();

        DatePickingUtil.datePicking((startDate: string | number, endDate: string | number): void => {
            const startDateObj: Date | undefined = typeof startDate === 'string' ? new Date(startDate) : undefined;
            const endDateObj: Date | undefined = typeof endDate === 'string' ? new Date(endDate) : undefined;
            this.getOperations(startDateObj, endDateObj).then();
        });

        const today: Date = new Date();
        this.getOperations(today, today).then();
    }

    private formatDate(date: Date | string): string {
        if (typeof date === "string") {
            return date;
        }
        const year: number = date.getFullYear();
        const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
        const day: string = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private async getOperations(startDate?: Date | string, endDate?: Date | string, customUrl: string | null = null): Promise<void> {
        const formattedStartDate: string | undefined = startDate ? this.formatDate(startDate) : undefined;
        const formattedEndDate: string | undefined = endDate ? this.formatDate(endDate) : undefined;

        const result: RequestResultType = await HttpUtils.request(
            customUrl ??
            `/operations?period=interval&dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}`
        );

        if (result.error) {
            return alert(
                "Возникла ошибка при запросе доходов и расходов! Обратитесь в поддержку."
            );
        }

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        this.operations = result.response;
        this.incomeOperations = this.operations.filter(
            (op: Operation): boolean => op.type === "income"
        );
        this.expenseOperations = this.operations.filter(
            (op: Operation): boolean => op.type === "expense"
        );

        this.incomePieChart();
        this.expensePieChart();
    }

    groupByCategory(operations:Operations[]):{[key:string]:number} {
        return operations.reduce((acc: { [key: string]: number }, op: Operations): { [key: string]: number } => {
            if (!acc[op.category]) {
                acc[op.category] = 0;
            }
            acc[op.category] += op.amount;
            return acc;
        }, {});
    }

    getRandomColor(): string {
        // динамическая генерация цветов
        const r: number = Math.floor(Math.random() * 255);
        const g: number = Math.floor(Math.random() * 255);
        const b: number = Math.floor(Math.random() * 255);
        return `rgb(${r}, ${g}, ${b})`;
    }

    generateColors(labels: (string | number)[]): string[] {
        return labels.map(() => this.getRandomColor());
    }

    incomePieChart(): void {
        const incomeByCategory: {[key: string]: number} = this.groupByCategory(this.incomeOperations);
        const incomeLabels: string[] = Object.keys(incomeByCategory);
        const incomeData: number[] = Object.values(incomeByCategory);
        const backgroundColors: string[] = this.generateColors(incomeLabels);

        const legendMargin: legendMargin = {
            id: "legendMargin",
            beforeInit(chart: { legend: { height: number; fit: () => void; }; }): void {
                // console.log(chart.legend.fit);
                const fitValue: () => void = chart.legend.fit;
                chart.legend.fit = function fit(): number {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data: ChartData = {
            labels: incomeLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
            datasets: [
                {
                    label: "Сумма доходов",
                    data: incomeData,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                },
            ],
        };

        let config: ChartConfiguration | any = {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false,
                        },
                    },
                },
                responsive: true,
            },
            plugins: [legendMargin],
        };

        if (this.incomeChartInstance) {
            this.incomeChartInstance.data = data;
            this.incomeChartInstance.update();
        } else {
            this.incomeChartInstance = new Chart((this.incomeChart) as HTMLCanvasElement, config);
        }
    }

    private expensePieChart(): void {
        const expenseByCategory: {[key: string]: number} = this.groupByCategory(this.expenseOperations);
        const expenseLabels: string[] = Object.keys(expenseByCategory);
        const expenseData: number[] = Object.values(expenseByCategory);

        const backgroundColors: string[] = this.generateColors(expenseLabels);

        const legendMargin: legendMargin = {
            id: "legendMargin",
            beforeInit(chart: { legend: { height: number; fit: () => void; }; }) {
                const fitValue: () => void = chart.legend.fit;
                chart.legend.fit = function fit(): number {
                    fitValue.bind(chart.legend)();
                    return (this.height += 30);
                };
            },
        };

        const data: ChartData = {
            labels: expenseLabels,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
            datasets: [
                {
                    label: "Сумма расходов",
                    data: expenseData,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                },
            ],
        };

        let config: ChartConfiguration | any = {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 35,
                            padding: 10,
                            usePointStyle: false,
                        },
                    },
                },
                responsive: true,
            },
            plugins: [legendMargin],
        };

        if (this.expensesChartInstance) {
            this.expensesChartInstance.data = data;
            this.expensesChartInstance.update();
        } else {
            this.expensesChartInstance = new Chart((this.expensesChart) as HTMLCanvasElement, config);
        }
    }

    private setDateFilterListeners():void {
        const todayButton: HTMLElement | null = document.querySelector("#todayBtn");
        if (todayButton) {
            todayButton.addEventListener("click", () => {
                const today = new Date();
                this.getOperations(today, today).then();
            });
        }

        const weekButton: Element | null = document.querySelector("#weekBtn");
        if (weekButton) {
            weekButton.addEventListener("click", () => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                this.getOperations(weekAgo, today).then();
            });
        }

        const monthButton: Element | null = document.querySelector("#monthBtn");
        if (monthButton) {
            monthButton.addEventListener("click", () => {
                const today = new Date();
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                this.getOperations(monthAgo, today).then();
            });
        }

        const yearButton: Element | null = document.querySelector("#yearBtn");
        if (yearButton) {
            yearButton.addEventListener("click", () => {
                const today = new Date();
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                this.getOperations(yearAgo, today).then();
            });
        }

        const allButton: Element | null = document.querySelector("#allBtn");
        if (allButton) {
            allButton.addEventListener("click", () => {
                this.getOperations(undefined, undefined, `/operations?period=all`).then();
            });
        }
    }
}
