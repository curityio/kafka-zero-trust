/*
 * A custom error class
 */
class PaymentError extends Error {

    private readonly status: number;
    private readonly code: string;

    public constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public toJson(): any {
        return {
            code: this.code,
            message: this.message,
        }
    }
}
