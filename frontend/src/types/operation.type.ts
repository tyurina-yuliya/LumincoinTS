export type OperationType = {
    id: string;
    type: 'income' | 'expenses';
    category: string;
    amount: number;
    date: string;
    comment: string;
}