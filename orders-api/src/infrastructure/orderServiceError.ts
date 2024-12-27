/*
 * A custom error class for this API
 */
export class OrderServiceError extends Error {

    private readonly status: number;
    private readonly code: string;
    private readonly inner?: Error;

    public constructor(status: number, code: string, message: string, inner?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.inner = inner;
    }

    public getStatus(): number {
        return this.status;
    }

    public getCode(): string {
        return this.code;
    }

    public getCause(): any {
        return this.inner;
    }
}
