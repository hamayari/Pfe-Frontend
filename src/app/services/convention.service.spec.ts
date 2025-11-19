import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConventionService, Convention, ConventionStats } from './convention.service';
import { environment } from '../../environments/environment';

describe('ConventionService', () => {
  let service: ConventionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/conventions`;

  const mockConvention: Convention = {
    id: '1',
    title: 'Convention Test',
    reference: 'CONV-001',
    clientId: 'client1',
    clientName: 'Client Test',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'ACTIVE',
    amount: 10000,
    currency: 'TND',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockConventions: Convention[] = [mockConvention];

  const mockStats: ConventionStats = {
    total: 100,
    active: 80,
    expired: 15,
    renewal: 5,
    byGovernorate: [
      { governorate: 'Tunis', count: 50 },
      { governorate: 'Sfax', count: 30 }
    ]
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
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConventions()', () => {
    it('should fetch all conventions', (done) => {
      service.getConventions().subscribe(conventions => {
        expect(conventions.length).toBe(1);
        expect(conventions[0]).toEqual(mockConvention);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockConventions);
    });

    it('should handle empty conventions list', (done) => {
      service.getConventions().subscribe(conventions => {
        expect(conventions.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });

    it('should handle HTTP error', (done) => {
      service.getConventions().subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getAllConventions()', () => {
    it('should be alias for getConventions', (done) => {
      service.getAllConventions().subscribe(conventions => {
        expect(conventions).toEqual(mockConventions);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConventions);
    });
  });

  describe('getRecentConventions()', () => {
    it('should fetch recent conventions with default limit', (done) => {
      service.getRecentConventions().subscribe(conventions => {
        expect(conventions.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/recent?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConventions);
    });

    it('should fetch recent conventions with custom limit', (done) => {
      service.getRecentConventions(10).subscribe(conventions => {
        expect(conventions.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/recent?limit=10`);
      req.flush(mockConventions);
    });
  });

  describe('getConventionStats()', () => {
    it('should fetch convention statistics', (done) => {
      service.getConventionStats().subscribe(stats => {
        expect(stats.total).toBe(100);
        expect(stats.active).toBe(80);
        expect(stats.expired).toBe(15);
        expect(stats.byGovernorate.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('getConventionById()', () => {
    it('should fetch convention by id', (done) => {
      service.getConventionById('1').subscribe(convention => {
        expect(convention).toEqual(mockConvention);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConvention);
    });

    it('should handle not found error', (done) => {
      service.getConventionById('999').subscribe(
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

  describe('createConvention()', () => {
    it('should create new convention', (done) => {
      const newConvention: Partial<Convention> = {
        reference: 'CONV-002',
        clientName: 'New Client',
        amount: 15000
      };

      service.createConvention(newConvention).subscribe(convention => {
        expect(convention.reference).toBe('CONV-002');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newConvention);
      req.flush({ ...mockConvention, ...newConvention, id: '2' });
    });

    it('should handle validation error', (done) => {
      const invalidConvention: Partial<Convention> = {
        reference: ''
      };

      service.createConvention(invalidConvention).subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateConvention()', () => {
    it('should update existing convention', (done) => {
      const updateData: Partial<Convention> = {
        amount: 20000,
        status: 'ACTIVE'
      };

      service.updateConvention('1', updateData).subscribe(convention => {
        expect(convention.amount).toBe(20000);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush({ ...mockConvention, ...updateData });
    });
  });

  describe('deleteConvention()', () => {
    it('should delete convention', (done) => {
      service.deleteConvention('1').subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete error', (done) => {
      service.deleteConvention('1').subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Observables', () => {
    it('should expose conventions$ observable', (done) => {
      service.conventions$.subscribe(conventions => {
        expect(conventions).toBeDefined();
        expect(Array.isArray(conventions)).toBe(true);
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

  describe('refreshConventions()', () => {
    it('should refresh conventions list', (done) => {
      service.conventions$.subscribe(conventions => {
        if (conventions.length > 0) {
          expect(conventions).toEqual(mockConventions);
          done();
        }
      });

      service.refreshConventions();

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConventions);
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
    it('should refresh both conventions and stats', () => {
      service.refreshAllData();

      const conventionsReq = httpMock.expectOne(apiUrl);
      conventionsReq.flush(mockConventions);

      const statsReq = httpMock.expectOne(`${apiUrl}/stats`);
      statsReq.flush(mockStats);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed data gracefully', (done) => {
      service.getConventions().subscribe(conventions => {
        expect(conventions).toBeDefined();
        expect(Array.isArray(conventions)).toBe(true);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([{ invalid: 'data' }]);
    });
  });
});


  describe('getConventions', () => {
    it('should handle API error', (done) => {
      service.getConventions().subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', (done) => {
      service.getConventions().subscribe(
        () => fail('should have failed'),
        (error) => {
          expect(error).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle empty response', (done) => {
      service.getConventions().subscribe(conventions => {
        expect(conventions).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });
