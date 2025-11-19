import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceService, Invoice, InvoiceStats, InvoiceNotifications } from './invoice.service';
import { environment } from '../../environments/environment';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/invoices`;

  const mockInvoice: Invoice = {
    id: '1',
    reference: 'INV-001',
    invoiceNumber: 'F-2024-001',
    clientId: 'client1',
    clientName: 'Client Test',
    conventionId: 'conv1',
    conventionName: 'Convention Test',
    amount: 5000,
    currency: 'TND',
    taxRate: 19,
    status: 'PENDING',
    paymentMethod: 'transfer',
    issueDate: new Date('2024-01-01'),
    dueDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockInvoices: Invoice[] = [mockInvoice];

  const mockStats: InvoiceStats = {
    totalInvoices: 100,
    paidInvoices: 70,
    pendingInvoices: 25,
    overdueInvoices: 5,
    totalAmount: 500000,
    paidAmount: 350000,
    pendingAmount: 125000,
    overdueAmount: 25000
  };

  const mockNotifications: InvoiceNotifications = {
    overdueInvoices: 5,
    upcomingDueDates: 10,
    pendingApprovals: 3,
    paymentConfirmations: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InvoiceService]
    });

    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInvoices()', () => {
    it('should fetch all invoices', (done) => {
      service.getInvoices().subscribe(invoices => {
        expect(invoices.length).toBe(1);
        expect(invoices[0]).toEqual(mockInvoice);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoices);
    });

    it('should handle empty invoices list', (done) => {
      service.getInvoices().subscribe(invoices => {
        expect(invoices.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('getAllInvoices()', () => {
    it('should be alias for getInvoices', (done) => {
      service.getAllInvoices().subscribe(invoices => {
        expect(invoices).toEqual(mockInvoices);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockInvoices);
    });
  });

  describe('getRecentInvoices()', () => {
    it('should fetch recent invoices with default limit', (done) => {
      service.getRecentInvoices().subscribe(invoices => {
        expect(invoices.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/recent?limit=5`);
      req.flush(mockInvoices);
    });

    it('should fetch recent invoices with custom limit', (done) => {
      service.getRecentInvoices(10).subscribe(invoices => {
        expect(invoices.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/recent?limit=10`);
      req.flush(mockInvoices);
    });
  });

  describe('getInvoiceStats()', () => {
    it('should fetch invoice statistics', (done) => {
      service.getInvoiceStats().subscribe(stats => {
        expect(stats.totalInvoices).toBe(100);
        expect(stats.paidInvoices).toBe(70);
        expect(stats.pendingInvoices).toBe(25);
        expect(stats.overdueInvoices).toBe(5);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      req.flush(mockStats);
    });
  });

  describe('getInvoiceStatistics()', () => {
    it('should be alias for getInvoiceStats', (done) => {
      service.getInvoiceStatistics().subscribe(stats => {
        expect(stats).toEqual(mockStats);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      req.flush(mockStats);
    });
  });

  describe('getInvoiceById()', () => {
    it('should fetch invoice by id', (done) => {
      service.getInvoiceById('1').subscribe(invoice => {
        expect(invoice).toEqual(mockInvoice);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush(mockInvoice);
    });

    it('should handle not found error', (done) => {
      service.getInvoiceById('999').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createInvoice()', () => {
    it('should create new invoice', (done) => {
      const newInvoice: Partial<Invoice> = {
        reference: 'INV-002',
        amount: 7500,
        clientName: 'New Client'
      };

      service.createInvoice(newInvoice).subscribe(invoice => {
        expect(invoice.reference).toBe('INV-002');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newInvoice);
      req.flush({ ...mockInvoice, ...newInvoice, id: '2' });
    });
  });

  describe('updateInvoice()', () => {
    it('should update existing invoice', (done) => {
      const updateData = {
        amount: 6000,
        status: 'PAID' as const
      };

      service.updateInvoice('1', updateData).subscribe(invoice => {
        expect(invoice.amount).toBe(6000);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockInvoice, ...updateData });
    });
  });

  describe('updateInvoiceStatus()', () => {
    it('should update invoice status', (done) => {
      service.updateInvoiceStatus('1', 'PAID').subscribe(invoice => {
        expect(invoice.status).toBe('PAID');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.status).toBe('PAID');
      req.flush({ ...mockInvoice, status: 'PAID' });
    });
  });

  describe('deleteInvoice()', () => {
    it('should delete invoice', (done) => {
      service.deleteInvoice('1').subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('markAsPaid()', () => {
    it('should mark invoice as paid with default date', (done) => {
      service.markAsPaid('1').subscribe(invoice => {
        expect(invoice.status).toBe('PAID');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/mark-paid`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.status).toBe('paid');
      req.flush({ ...mockInvoice, status: 'PAID' });
    });

    it('should mark invoice as paid with custom date', (done) => {
      const paidDate = new Date('2024-01-15');
      
      service.markAsPaid('1', paidDate).subscribe(invoice => {
        expect(invoice.status).toBe('PAID');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/mark-paid`);
      expect(req.request.body.paidDate).toEqual(paidDate);
      req.flush({ ...mockInvoice, status: 'PAID', paidDate });
    });
  });

  describe('validateInvoiceData()', () => {
    it('should validate correct invoice data', () => {
      const validInvoice = {
        reference: 'INV-001',
        amount: 5000,
        dueDate: new Date(),
        clientId: 'client1'
      };

      const result = service.validateInvoiceData(validInvoice);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return error for missing reference', () => {
      const invalidInvoice = {
        amount: 5000,
        dueDate: new Date(),
        clientId: 'client1'
      };

      const result = service.validateInvoiceData(invalidInvoice);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La référence est obligatoire');
    });

    it('should return error for invalid amount', () => {
      const invalidInvoice = {
        reference: 'INV-001',
        amount: 0,
        dueDate: new Date(),
        clientId: 'client1'
      };

      const result = service.validateInvoiceData(invalidInvoice);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Le montant doit être supérieur à 0');
    });

    it('should return error for missing due date', () => {
      const invalidInvoice = {
        reference: 'INV-001',
        amount: 5000,
        clientId: 'client1'
      };

      const result = service.validateInvoiceData(invalidInvoice);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La date d\'échéance est obligatoire');
    });

    it('should return error for missing client', () => {
      const invalidInvoice = {
        reference: 'INV-001',
        amount: 5000,
        dueDate: new Date()
      };

      const result = service.validateInvoiceData(invalidInvoice);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Le client est obligatoire');
    });
  });

  describe('getPaymentStatusColor()', () => {
    it('should return success for paid status', () => {
      expect(service.getPaymentStatusColor('paid')).toBe('success');
    });

    it('should return warning for pending status', () => {
      expect(service.getPaymentStatusColor('pending')).toBe('warning');
    });

    it('should return danger for overdue status', () => {
      expect(service.getPaymentStatusColor('overdue')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(service.getPaymentStatusColor('unknown')).toBe('secondary');
    });
  });

  describe('getPaymentStatusLabel()', () => {
    it('should return correct labels', () => {
      expect(service.getPaymentStatusLabel('paid')).toBe('Payée');
      expect(service.getPaymentStatusLabel('pending')).toBe('En attente');
      expect(service.getPaymentStatusLabel('overdue')).toBe('En retard');
      expect(service.getPaymentStatusLabel('unknown')).toBe('Inconnu');
    });
  });

  describe('getPaymentMethodLabel()', () => {
    it('should return correct payment method labels', () => {
      expect(service.getPaymentMethodLabel('card')).toBe('Carte bancaire');
      expect(service.getPaymentMethodLabel('transfer')).toBe('Virement');
      expect(service.getPaymentMethodLabel('check')).toBe('Chèque');
      expect(service.getPaymentMethodLabel('cash')).toBe('Espèces');
    });

    it('should return original value for unknown method', () => {
      expect(service.getPaymentMethodLabel('crypto')).toBe('crypto');
    });
  });

  describe('sendPaymentReminder()', () => {
    it('should send payment reminder', (done) => {
      service.sendPaymentReminder('1').subscribe(result => {
        expect(result.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/send-reminder`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true });
    });
  });

  describe('sendPaymentReminders()', () => {
    it('should send bulk payment reminders', (done) => {
      const invoiceIds = ['1', '2', '3'];

      service.sendPaymentReminders(invoiceIds).subscribe(result => {
        expect(result.sent).toBe(3);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/send-reminders`);
      expect(req.request.body).toEqual({ invoiceIds });
      req.flush({ sent: 3 });
    });
  });

  describe('getInvoiceNotifications()', () => {
    it('should fetch invoice notifications', (done) => {
      service.getInvoiceNotifications().subscribe(notifications => {
        expect(notifications.overdueInvoices).toBe(5);
        expect(notifications.upcomingDueDates).toBe(10);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/notifications`);
      req.flush(mockNotifications);
    });
  });

  describe('exportInvoices()', () => {
    it('should export invoices as Excel', (done) => {
      const mockBlob = new Blob(['data'], { type: 'application/vnd.ms-excel' });

      service.exportInvoices('excel').subscribe(blob => {
        expect(blob).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes(`${apiUrl}/export`));
      req.flush(mockBlob);
    });

    it('should export invoices with filters', (done) => {
      const mockBlob = new Blob(['data']);
      const filters = { status: 'paid', clientId: 'client1' };

      service.exportInvoices('pdf', filters).subscribe(blob => {
        expect(blob).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`${apiUrl}/export`) && 
        req.url.includes('status=paid')
      );
      req.flush(mockBlob);
    });
  });

  describe('generateInvoicePDF()', () => {
    it('should generate PDF for invoice', (done) => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });

      service.generateInvoicePDF('1').subscribe(blob => {
        expect(blob).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/pdf`);
      req.flush(mockBlob);
    });
  });

  describe('Observables', () => {
    it('should expose invoices$ observable', (done) => {
      service.invoices$.subscribe(invoices => {
        expect(invoices).toBeDefined();
        expect(Array.isArray(invoices)).toBe(true);
        done();
      });
    });

    it('should expose stats$ observable', (done) => {
      service.stats$.subscribe(stats => {
        expect(stats).toBeDefined();
        done();
      });
    });
  });

  describe('refreshInvoices()', () => {
    it('should refresh invoices list', (done) => {
      service.invoices$.subscribe(invoices => {
        if (invoices.length > 0) {
          expect(invoices).toEqual(mockInvoices);
          done();
        }
      });

      service.refreshInvoices();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockInvoices);
    });
  });

  describe('refreshStats()', () => {
    it('should refresh statistics', (done) => {
      service.stats$.subscribe(stats => {
        if (stats) {
          expect(stats).toEqual(mockStats);
          done();
        }
      });

      service.refreshStats();
      const req = httpMock.expectOne(`${apiUrl}/stats`);
      req.flush(mockStats);
    });
  });

  describe('refreshAllData()', () => {
    it('should refresh both invoices and stats', () => {
      service.refreshAllData();

      const invoicesReq = httpMock.expectOne(apiUrl);
      invoicesReq.flush(mockInvoices);

      const statsReq = httpMock.expectOne(`${apiUrl}/stats`);
      statsReq.flush(mockStats);
    });
  });
});
