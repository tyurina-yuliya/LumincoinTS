export interface Operation {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    comment?: string;
}
