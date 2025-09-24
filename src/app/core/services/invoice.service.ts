import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, delay } from 'rxjs/operators';
import { 
  Invoice, 
  InvoiceFormData, 
  InvoiceFilter, 
  InvoiceListResponse,
  InvoiceStatus,
  PaymentMethod,
  PaymentFormData,
  InvoiceItem,
  Payment
} from '../models/invoice.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;
  
  // Mock data for development
  private mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2023-001',
      reference: 'CONV-2023-001',
      status: InvoiceStatus.PAID,
      issueDate: new Date('2023-01-15'),
      dueDate: new Date('2023-02-14'),
      paidDate: new Date('2023-02-10'),
      conventionId: '1',
      subtotal: 5000,
      taxAmount: 1000,
      discountAmount: 0,
      totalAmount: 6000,
      amountPaid: 6000,
      balanceDue: 0,
      currency: 'MAD',
      items: [
        {
          id: '1',
          description: 'Service de consultation',
          quantity: 10,
          unitPrice: 500,
          taxRate: 20,
          amount: 5000
        }
      ],
      payments: [
        {
          id: '1',
          amount: 6000,
          paymentDate: new Date('2023-02-10'),
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          reference: 'PAY-001',
          recordedBy: 'system',
          recordedAt: new Date('2023-02-10')
        }
      ],
      notes: 'Paiement reçu avec succès',
      termsAndConditions: 'Paiement dans les 30 jours',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-02-10'),
      createdBy: 'system'
    },
    // Add more mock invoices as needed
  ];

  constructor(private http: HttpClient) {}

  // Get all invoices with pagination and filtering
  getInvoices(filter: InvoiceFilter = {}): Observable<InvoiceListResponse> {
    // In a real app, this would be an HTTP request with query parameters
    // const params = this.buildQueryParams(filter);
    // return this.http.get<InvoiceListResponse>(this.apiUrl, { params });
    
    // Mock implementation for development
    let filteredInvoices = [...this.mockInvoices];
    
    // Apply filters
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
        (inv.reference && inv.reference.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filter.status && filter.status.length > 0) {
      filteredInvoices = filteredInvoices.filter(inv => filter.status?.includes(inv.status));
    }
    
    if (filter.conventionId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.conventionId === filter.conventionId);
    }
    
    if (filter.issueDateFrom) {
      const fromDate = new Date(filter.issueDateFrom);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.issueDate) >= fromDate);
    }
    
    if (filter.issueDateTo) {
      const toDate = new Date(filter.issueDateTo);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.issueDate) <= toDate);
    }
    
    if (filter.dueDateFrom) {
      const fromDate = new Date(filter.dueDateFrom);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.dueDate) >= fromDate);
    }
    
    if (filter.dueDateTo) {
      const toDate = new Date(filter.dueDateTo);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.dueDate) <= toDate);
    }
    
    if (filter.minAmount !== undefined) {
      filteredInvoices = filteredInvoices.filter(inv => inv.totalAmount >= (filter.minAmount || 0));
    }
    
    if (filter.maxAmount !== undefined) {
      filteredInvoices = filteredInvoices.filter(inv => inv.totalAmount <= (filter.maxAmount || Infinity));
    }
    
    // Apply sorting
    if (filter.sortField) {
      filteredInvoices = this.sortInvoices(filteredInvoices, filter.sortField, filter.sortOrder || 'asc');
    }
    
    // Apply pagination
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + limit);
    
    // Simulate API delay
    return of({
      data: paginatedInvoices,
      total: filteredInvoices.length,
      page,
      limit,
      totalPages: Math.ceil(filteredInvoices.length / limit)
    }).pipe(delay(300));
  }

  // Get a single invoice by ID
  getInvoiceById(id: string): Observable<Invoice> {
    // In a real app: return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
    const invoice = this.mockInvoices.find(i => i.id === id);
    return invoice 
      ? of(invoice).pipe(delay(200)) 
      : throwError(() => new Error('Invoice not found'));
  }

  // Create a new invoice
  createInvoice(invoiceData: InvoiceFormData): Observable<Invoice> {
    // In a real app: return this.http.post<Invoice>(this.apiUrl, invoiceData);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: (this.mockInvoices.length + 1).toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(this.mockInvoices.length + 1).padStart(3, '0')}`,
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(invoiceData.issueDate || new Date()),
      dueDate: new Date(invoiceData.dueDate || new Date()),
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      amountPaid: 0,
      balanceDue: 0,
      currency: 'MAD',
      items: (invoiceData.items || []).map((item, index) => ({
        id: (index + 1).toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        amount: item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)
      })),
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id' // This would be set by the server
    };
    
    this.mockInvoices = [...this.mockInvoices, newInvoice];
    return of(newInvoice).pipe(delay(300));
  }

  // Update an existing invoice
  updateInvoice(id: string, invoiceData: Partial<InvoiceFormData>): Observable<Invoice> {
    // In a real app: return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoiceData);
    const invoiceIndex = this.mockInvoices.findIndex(i => i.id === id);
    
    if (invoiceIndex === -1) {
      return throwError(() => new Error('Invoice not found'));
    }
    
    const updatedInvoice = {
      ...this.mockInvoices[invoiceIndex],
      ...invoiceData,
      issueDate: new Date(invoiceData.issueDate || new Date()),
      dueDate: new Date(invoiceData.dueDate || new Date()),
      items: (invoiceData.items || []).map((item, index) => ({
        id: (index + 1).toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        amount: item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)
      })),
      updatedAt: new Date(),
      updatedBy: 'current-user-id' // This would be set by the server
    };
    
    this.mockInvoices = [
      ...this.mockInvoices.slice(0, invoiceIndex),
      updatedInvoice,
      ...this.mockInvoices.slice(invoiceIndex + 1)
    ];
    
    return of(updatedInvoice).pipe(delay(300));
  }

  // Delete an invoice
  deleteInvoice(id: string): Observable<void> {
    // In a real app: return this.http.delete<void>(`${this.apiUrl}/${id}`);
    const invoiceIndex = this.mockInvoices.findIndex(i => i.id === id);
    
    if (invoiceIndex === -1) {
      return throwError(() => new Error('Invoice not found'));
    }
    
    this.mockInvoices = this.mockInvoices.filter(invoice => invoice.id !== id);
    return of(undefined).pipe(delay(300));
  }

  // Update invoice status
  updateInvoiceStatus(id: string, status: InvoiceStatus): Observable<Invoice> {
    // In a real app: return this.http.patch<Invoice>(`${this.apiUrl}/${id}/status`, { status });
    const invoice = this.mockInvoices.find(i => i.id === id);
    
    if (!invoice) {
      return throwError(() => new Error('Invoice not found'));
    }
    
    const updatedInvoice = {
      ...invoice,
      status,
      updatedAt: new Date(),
      updatedBy: 'current-user-id'
    };
    
    if (status === 'PAID' && !invoice.paidDate) {
      updatedInvoice.paidDate = new Date();
      updatedInvoice.amountPaid = updatedInvoice.totalAmount;
      updatedInvoice.balanceDue = 0;
    }
    
    return this.updateInvoice(id, updatedInvoice);
  }

  // Add a payment to an invoice
  addPayment(invoiceId: string, paymentData: PaymentFormData): Observable<Payment> {
    // In a real app: return this.http.post<Payment>(`${this.apiUrl}/${invoiceId}/payments`, paymentData);
    const invoice = this.mockInvoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
      return throwError(() => new Error('Invoice not found'));
    }
    
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      ...paymentData,
      paymentDate: new Date(paymentData.paymentDate),
      recordedBy: 'current-user-id',
      recordedAt: new Date()
    };
    
    const updatedInvoice = {
      ...invoice,
      payments: [...(invoice.payments || []), newPayment],
      amountPaid: (invoice.amountPaid || 0) + paymentData.amount,
      balanceDue: Math.max(0, (invoice.totalAmount || 0) - ((invoice.amountPaid || 0) + paymentData.amount)),
      status: invoice.totalAmount <= ((invoice.amountPaid || 0) + paymentData.amount) ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
      updatedAt: new Date(),
      updatedBy: 'current-user-id'
    };
    
    if (updatedInvoice.status === InvoiceStatus.PAID && !invoice.paidDate) {
      updatedInvoice.paidDate = new Date();
    }
    
    const invoiceIndex = this.mockInvoices.findIndex(i => i.id === invoiceId);
    this.mockInvoices = [
      ...this.mockInvoices.slice(0, invoiceIndex),
      updatedInvoice,
      ...this.mockInvoices.slice(invoiceIndex + 1)
    ];
    
    return of(newPayment).pipe(delay(300));
  }

  // Generate invoice PDF
  generatePdf(invoiceId: string): Observable<Blob> {
    // In a real app: return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, { responseType: 'blob' });
    // Mock implementation would return a Blob in a real scenario
    return of(new Blob()).pipe(delay(500));
  }

  // Send invoice via email
  sendByEmail(invoiceId: string, emailData: { to: string; cc?: string[]; bcc?: string[]; message?: string }): Observable<{ success: boolean; message: string }> {
    // In a real app: return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${invoiceId}/send-email`, emailData);
    return of({ 
      success: true, 
      message: 'Invoice sent successfully' 
    }).pipe(delay(500));
  }

  // Get invoice statistics
  getInvoiceStats(): Observable<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
    byMonth: Array<{ month: string; count: number; amount: number }>;
  }> {
    // In a real app: return this.http.get(`${this.apiUrl}/stats`);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Mock data for stats
    const stats = {
      totalInvoices: this.mockInvoices.length,
      totalAmount: this.mockInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      paidAmount: this.mockInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      overdueAmount: this.mockInvoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      byStatus: [] as Array<{ status: string; count: number; amount: number }>,
      byMonth: Array(12).fill(0).map((_, i) => ({
        month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
        count: 0,
        amount: 0
      }))
    };
    
    // Calculate status stats
    const statusMap = new Map<string, { count: number; amount: number }>();
    
    this.mockInvoices.forEach(inv => {
      const status = inv.status;
      const amount = inv.totalAmount || 0;
      
      if (!statusMap.has(status)) {
        statusMap.set(status, { count: 0, amount: 0 });
      }
      
      const stat = statusMap.get(status)!;
      stat.count++;
      stat.amount += amount;
    });
    
    stats.byStatus = Array.from(statusMap.entries()).map(([status, { count, amount }]) => ({
      status,
      count,
      amount
    }));
    
    // Calculate monthly stats
    this.mockInvoices.forEach(inv => {
      const month = new Date(inv.issueDate).getMonth();
      if (month >= 0 && month < 12) {
        stats.byMonth[month].count++;
        stats.byMonth[month].amount += inv.totalAmount || 0;
      }
    });
    
    return of(stats).pipe(delay(300));
  }

  // Helper method to sort invoices
  private sortInvoices(invoices: Invoice[], field: string, order: 'asc' | 'desc' = 'asc'): Invoice[] {
    return [...invoices].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (field) {
        case 'invoiceNumber':
          valueA = a.invoiceNumber;
          valueB = b.invoiceNumber;
          break;
        case 'reference':
          valueA = a.reference || '';
          valueB = b.reference || '';
          break;
        case 'issueDate':
          valueA = new Date(a.issueDate).getTime();
          valueB = new Date(b.issueDate).getTime();
          break;
        case 'dueDate':
          valueA = new Date(a.dueDate).getTime();
          valueB = new Date(b.dueDate).getTime();
          break;
        case 'totalAmount':
          valueA = a.totalAmount;
          valueB = b.totalAmount;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          valueA = a[field as keyof Invoice];
          valueB = b[field as keyof Invoice];
      }
      
      if (valueA === null || valueA === undefined) return order === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return order === 'asc' ? 1 : -1;
      
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Build query parameters from filter object
  private buildQueryParams(filter: InvoiceFilter): HttpParams {
    let params = new HttpParams();
    
    if (filter.search) params = params.set('search', filter.search);
    if (filter.status && filter.status.length > 0) {
      filter.status.forEach(status => {
        params = params.append('status', status);
      });
    }
    if (filter.conventionId) params = params.set('conventionId', filter.conventionId);
    if (filter.issueDateFrom) params = params.set('issueDateFrom', filter.issueDateFrom.toISOString());
    if (filter.issueDateTo) params = params.set('issueDateTo', filter.issueDateTo.toISOString());
    if (filter.dueDateFrom) params = params.set('dueDateFrom', filter.dueDateFrom.toISOString());
    if (filter.dueDateTo) params = params.set('dueDateTo', filter.dueDateTo.toISOString());
    if (filter.minAmount !== undefined) params = params.set('minAmount', filter.minAmount.toString());
    if (filter.maxAmount !== undefined) params = params.set('maxAmount', filter.maxAmount.toString());
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.limit) params = params.set('limit', filter.limit.toString());
    if (filter.sortField) params = params.set('sortField', filter.sortField);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    
    return params;
  }
}
