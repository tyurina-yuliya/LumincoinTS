export interface legendMargin {
    id: string;
    beforeInit(chart: {
        legend: {
            height: number;
            fit: () => void;
        };
    }): void;
}
