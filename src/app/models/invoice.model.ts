export interface Invoice {
    id: string;
    reference: string;
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    conventionId: string;
    conventionName: string;
    amount: number;
    paidAmount?: number;
    currency: string;
    taxRate: number;
    discount?: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIALLY_PAID' | 'PENDING' | 'PROOF_PENDING' | 'PROOF_VALIDATED' | 'PENDING_VERIFICATION' | 'PROOF_REJECTED';
    paymentMethod: string;
    issueDate: Date;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    notes?: string;
    tags?: string[];
    items?: InvoiceItem[];
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxRate: number;
    discount?: number;
}

export interface InvoiceReminder {
    id: string;
    invoiceId: string;
    type: 'email' | 'sms';
    sentAt: Date;
    status: 'sent' | 'failed';
    recipient: string;
    content: string;
} 