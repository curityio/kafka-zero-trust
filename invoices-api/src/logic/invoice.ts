/*
 * An invoice record that might be stored in this microservice's database
 */
export interface Invoice {
    invoiceID: string;
    transactionID: string;
    userID: string;
    utcTime: Date;
    amount: number;
}
