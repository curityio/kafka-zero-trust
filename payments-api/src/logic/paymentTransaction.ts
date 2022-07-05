/*
 * A payment transaction record that might be stored in this microservice's database
 */
export interface PaymentTransaction {
    paymentTransactionID: string;
    orderTransactionID: string;
    userID: string;
    utcTime: Date;
    amount: number;
}
