import { Convention } from './convention.model';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  CHECK = 'CHECK',
  OTHER = 'OTHER'
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference: string;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reference?: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  
  // Relations
  conventionId: string;
  convention?: Convention;
  
  // Financial
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  
  // Items and Payments
  items: InvoiceItem[];
  payments: Payment[];
  
  // Metadata
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface InvoiceFormData {
  conventionId: string;
  reference?: string;
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItemFormData[];
  notes?: string;
  termsAndConditions?: string;
  applyTax?: boolean;
  taxRate?: number;
  discountAmount?: number;
  discountType?: 'fixed' | 'percentage';
}

export interface InvoiceItemFormData {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface PaymentFormData {
  amount: number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  reference: string;
  notes?: string;
}

export interface InvoiceFilter {
  search?: string;
  status?: InvoiceStatus[];
  conventionId?: string;
  issueDateFrom?: Date;
  issueDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper functions
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
    return false;
  }
  
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);
  return today > dueDate;
}

export function getInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
    return invoice.status;
  }
  
  if (isInvoiceOverdue(invoice)) {
    return InvoiceStatus.OVERDUE;
  }
  
  if (invoice.amountPaid > 0 && invoice.amountPaid < invoice.totalAmount) {
    return InvoiceStatus.PARTIALLY_PAID;
  }
  
  return invoice.status;
}

export function calculateInvoiceTotals(
  items: InvoiceItem[], 
  taxRate: number = 0, 
  discountAmount: number = 0, 
  discountType: 'fixed' | 'percentage' = 'fixed'
) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
  
  // Apply discount
  let discount = 0;
  if (discountType === 'percentage') {
    discount = (subtotal * discountAmount) / 100;
  } else {
    discount = Math.min(discountAmount, subtotal);
  }
  
  const subtotalAfterDiscount = subtotal - discount;
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount: discount,
    taxAmount,
    totalAmount
  };
}
