export interface TokensType {
    tokens: {
        accessToken: string;
        refreshToken: string;
    }
    error?: boolean;
}