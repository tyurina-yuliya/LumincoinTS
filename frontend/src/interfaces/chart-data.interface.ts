export interface ChartData {
    labels: string[];
    options: {
        scales: {
            y: {
                beginAtZero: boolean;
            };
        };
    };
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        hoverOffset: number;
    }[];
}
