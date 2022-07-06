/*
 * A custom error class for this API
 */
export class OrderServiceError extends Error {

    private readonly status: number;
    private readonly code: string;
    private readonly cause?: Error;

    public constructor(status: number, code: string, message: string, cause?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.cause = cause;
    }

    public getStatus(): number {
        return this.status;
    }

    public getCode(): string {
        return this.code;
    }

    public getCause(): any {
        return this.cause;
    }
}
