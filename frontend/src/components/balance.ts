import {HttpUtils} from "../ulits/http-utils";
import { RequestResultType } from "../types/request-result.type";

export class Balance {
    constructor() {
        this.getBalance().then();
    }
    private async getBalance(): Promise<void> {
        const result: RequestResultType = await HttpUtils.request('/balance');
        if (result && result.response) {
            this.updateBalance(result.response.balance);
        }
    }
    private updateBalance(balance: string): void {
        const balanceElement: HTMLElement | null = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `${balance}$`
        }
    }
}