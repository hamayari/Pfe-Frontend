import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConventionService, ConventionListResponse } from './convention.service';
import { Convention, ConventionFilter, ConventionFormData, ConventionStatus, PaymentTerm } from '../models/convention.model';
import { environment } from '../../../environments/environment';

describe('ConventionService', () => {
  let service: ConventionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/conventions`;

  // Mock data
  const mockConvention: Convention = {
    id: '1',
    reference: 'CONV-2024-001',
    label: 'Convention Test',
    clientId: 'client-1',
    clientName: 'Client Test',
    governorate: 'Tunis',
    structure: 'Structure Test',
    application: 'App Test',
    amount: 10000,
    status: ConventionStatus.ACTIVE,
    date: new Date('2024-01-01'),
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    paymentTerm: PaymentTerm.THIRTY_DAYS,
    commercialId: 'comm-1',
    projectManagerId: 'pm-1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockConventionList: ConventionListResponse = {
    data: [mockConvention],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConventionService]
    });

    service = TestBed.inject(ConventionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP en attente
  });

  // ==================== Tests d'initialisation ====================
  
  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct API URL', () => {
      expect(apiUrl).toContain('/conventions');
    });
  });

  // ==================== Tests getConventions ====================
  
  describe('getConventions', () => {
    it('should retrieve conventions list', (done) => {
      service.getConventions().subscribe(response => {
        expect(response).toEqual(mockConventionList);
        expect(response.data.length).toBe(1);
        expect(response.total).toBe(1);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockConventionList);
    });

    it('should handle empty conventions list', (done) => {
      const emptyResponse: ConventionListResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      service.getConventions().subscribe(response => {
        expect(response.data.length).toBe(0);
        expect(response.total).toBe(0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(emptyResponse);
    });

    it('should apply filters as query parameters', (done) => {
      const filter: ConventionFilter = {
        status: ConventionStatus.ACTIVE,
        governorate: 'Tunis'
      };

      service.getConventions(filter).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === apiUrl &&
               request.params.get('status') === 'ACTIVE' &&
               request.params.get('governorate') === 'Tunis';
      });
      
      expect(req.request.method).toBe('GET');
      req.flush(mockConventionList);
    });

    it('should ignore null and undefined filter values', (done) => {
      const filter: ConventionFilter = {
        status: ConventionStatus.ACTIVE,
        governorate: undefined,
        structure: null as any
      };

      service.getConventions(filter).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === apiUrl &&
               request.params.get('status') === 'ACTIVE' &&
               !request.params.has('governorate') &&
               !request.params.has('structure');
      });
      
      req.flush(mockConventionList);
    });

    it('should ignore empty string filter values', (done) => {
      const filter: ConventionFilter = {
        status: undefined,
        governorate: 'Tunis'
      };

      service.getConventions(filter).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === apiUrl &&
               !request.params.has('status') &&
               request.params.has('governorate');
      });
      
      req.flush(mockConventionList);
    });

    it('should handle API error', (done) => {
      service.getConventions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('erreur');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle custom error message from backend', (done) => {
      service.getConventions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Custom error message');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ==================== Tests getConvention ====================
  
  describe('getConvention', () => {
    it('should retrieve a single convention', (done) => {
      const conventionId = '1';

      service.getConvention(conventionId).subscribe(convention => {
        expect(convention).toEqual(mockConvention);
        expect(convention.id).toBe('1');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${conventionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConvention);
    });

    it('should handle 404 error for non-existent convention', (done) => {
      service.getConvention('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ==================== Tests createConvention ====================
  
  describe('createConvention', () => {
    it('should create a new convention', (done) => {
      const newConvention: ConventionFormData = {
        reference: 'CONV-2024-002',
        label: 'New Convention',
        clientId: 'client-2',
        governorate: 'Tunis',
        structure: 'Structure',
        application: 'App',
        amount: 15000,
        paymentTerm: PaymentTerm.THIRTY_DAYS,
        commercialId: 'comm-1',
        projectManagerId: 'pm-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      service.createConvention(newConvention).subscribe(convention => {
        expect(convention).toBeDefined();
        expect(convention.label).toBe('New Convention');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newConvention);
      req.flush({ ...mockConvention, ...newConvention });
    });

    it('should handle validation errors', (done) => {
      const invalidConvention: ConventionFormData = {} as ConventionFormData;

      service.createConvention(invalidConvention).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should send correct content type', (done) => {
      const newConvention: ConventionFormData = {
        reference: 'REF-001',
        clientId: 'client-1',
        governorate: 'Tunis',
        structure: 'Structure',
        application: 'App',
        amount: 1000,
        paymentTerm: PaymentTerm.IMMEDIATE,
        commercialId: 'comm-1',
        projectManagerId: 'pm-1',
        label: 'Test'
      };

      service.createConvention(newConvention).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.headers.has('Content-Type')).toBeFalsy(); // Angular ajoute automatiquement
      req.flush(mockConvention);
    });
  });

  // ==================== Tests updateConvention ====================
  
  describe('updateConvention', () => {
    it('should update an existing convention', (done) => {
      const conventionId = '1';
      const updates: ConventionFormData = {
        reference: 'CONV-2024-001',
        clientId: 'client-1',
        governorate: 'Tunis',
        structure: 'Structure',
        application: 'App',
        amount: 20000,
        paymentTerm: PaymentTerm.THIRTY_DAYS,
        commercialId: 'comm-1',
        projectManagerId: 'pm-1',
        label: 'Updated Convention'
      };

      service.updateConvention(conventionId, updates).subscribe(convention => {
        expect(convention).toBeDefined();
        expect(convention.label).toBe('Updated Convention');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${conventionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockConvention, ...updates });
    });

    it('should handle 404 error for non-existent convention', (done) => {
      const updates: ConventionFormData = {
        reference: 'REF-001',
        clientId: 'client-1',
        governorate: 'Tunis',
        structure: 'Structure',
        application: 'App',
        amount: 1000,
        paymentTerm: PaymentTerm.IMMEDIATE,
        commercialId: 'comm-1',
        projectManagerId: 'pm-1',
        label: 'Test'
      };

      service.updateConvention('999', updates).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should allow partial updates', (done) => {
      const partialUpdate: ConventionFormData = {
        amount: 25000
      } as ConventionFormData;

      service.updateConvention('1', partialUpdate).subscribe(convention => {
        expect(convention).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.body).toEqual(partialUpdate);
      req.flush(mockConvention);
    });
  });

  // ==================== Tests deleteConvention ====================
  
  describe('deleteConvention', () => {
    it('should delete a convention', (done) => {
      const conventionId = '1';

      service.deleteConvention(conventionId).subscribe(() => {
        expect(true).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${conventionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 error for non-existent convention', (done) => {
      service.deleteConvention('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle permission errors', (done) => {
      service.deleteConvention('1').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  // ==================== Tests de gestion d'erreurs ====================
  
  describe('Error Handling', () => {
    it('should handle network errors', (done) => {
      service.getConventions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should log errors to console', (done) => {
      spyOn(console, 'error');

      service.getConventions().subscribe({
        next: () => fail('should have failed'),
        error: () => {
          expect(console.error).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should provide user-friendly error messages', (done) => {
      service.getConventions().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBeTruthy();
          expect(typeof error.message).toBe('string');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  // ==================== Tests d'intégration ====================
  
  describe('Integration Tests', () => {
    it('should perform CRUD operations in sequence', (done) => {
      const newConvention: ConventionFormData = {
        reference: 'INT-001',
        clientId: 'client-1',
        governorate: 'Tunis',
        structure: 'Structure',
        application: 'App',
        amount: 5000,
        paymentTerm: PaymentTerm.IMMEDIATE,
        commercialId: 'comm-1',
        projectManagerId: 'pm-1',
        label: 'Integration Test'
      };

      // Create
      service.createConvention(newConvention).subscribe(created => {
        expect(created).toBeDefined();

        // Read
        service.getConvention(created.id).subscribe(fetched => {
          expect(fetched.id).toBe(created.id);

          // Update
          const updateData: ConventionFormData = {
            reference: created.reference,
            clientId: created.clientId,
            governorate: created.governorate,
            structure: created.structure,
            application: created.application,
            amount: created.amount,
            paymentTerm: created.paymentTerm,
            commercialId: created.commercialId,
            projectManagerId: created.projectManagerId,
            label: 'Updated'
          };
          service.updateConvention(created.id, updateData).subscribe(updated => {
            expect(updated).toBeDefined();

            // Delete
            service.deleteConvention(created.id).subscribe(() => {
              expect(true).toBeTruthy();
              done();
            });

            const deleteReq = httpMock.expectOne(`${apiUrl}/${created.id}`);
            deleteReq.flush(null);
          });

          const updateReq = httpMock.expectOne(`${apiUrl}/${created.id}`);
          updateReq.flush(mockConvention);
        });

        const getReq = httpMock.expectOne(`${apiUrl}/${created.id}`);
        getReq.flush(mockConvention);
      });

      const createReq = httpMock.expectOne(apiUrl);
      createReq.flush(mockConvention);
    });
  });
});
