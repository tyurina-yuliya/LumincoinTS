export interface ApiResponse {
    error?: string;
    user?: {
        id: number;
        name: string;
        lastName: string;
    }
}