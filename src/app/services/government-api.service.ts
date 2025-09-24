import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Governorate {
  id: string;
  name: string;
  code: string;
  population: number;
  area: number;
}

export interface Municipality {
  id: string;
  name: string;
  governorateId: string;
  postalCode: string;
  population: number;
}

export interface GovernmentStructure {
  id: string;
  name: string;
  type: 'MINISTRY' | 'AGENCY' | 'DIRECTORATE' | 'OFFICE';
  governorateId?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface TaxInfo {
  taxNumber: string;
  companyName: string;
  address: string;
  taxStatus: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  registrationDate: Date;
  lastDeclaration: Date;
}

export interface BusinessLicense {
  licenseNumber: string;
  businessName: string;
  businessType: string;
  address: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

export interface SocialSecurityInfo {
  socialSecurityNumber: string;
  employeeName: string;
  employerName: string;
  contributionStatus: 'ACTIVE' | 'INACTIVE';
  lastContribution: Date;
  totalContributions: number;
}

@Injectable({
  providedIn: 'root'
})
export class GovernmentApiService {
  private readonly baseUrl = environment.apiUrl + '/government';

  constructor(private http: HttpClient) {}

  // API Gouvernorats - Liste statique des gouvernorats tunisiens
  getGovernorates(): Observable<Governorate[]> {
    const governorates: Governorate[] = [
      { id: '1', name: 'Tunis', code: 'TN-11', population: 1056247, area: 346 },
      { id: '2', name: 'Ariana', code: 'TN-12', population: 576088, area: 482 },
      { id: '3', name: 'Ben Arous', code: 'TN-13', population: 631842, area: 761 },
      { id: '4', name: 'Manouba', code: 'TN-14', population: 379518, area: 1137 },
      { id: '5', name: 'Bizerte', code: 'TN-21', population: 568219, area: 3745 },
      { id: '6', name: 'Nabeul', code: 'TN-22', population: 787920, area: 2858 },
      { id: '7', name: 'Béja', code: 'TN-23', population: 303032, area: 3738 },
      { id: '8', name: 'Jendouba', code: 'TN-24', population: 401477, area: 3102 },
      { id: '9', name: 'Kef', code: 'TN-25', population: 243156, area: 4965 },
      { id: '10', name: 'Siliana', code: 'TN-26', population: 223087, area: 4642 },
      { id: '11', name: 'Sousse', code: 'TN-31', population: 674971, area: 2669 },
      { id: '12', name: 'Monastir', code: 'TN-32', population: 548828, area: 1019 },
      { id: '13', name: 'Mahdia', code: 'TN-33', population: 410812, area: 2966 },
      { id: '14', name: 'Sfax', code: 'TN-34', population: 955421, area: 7545 },
      { id: '15', name: 'Kairouan', code: 'TN-35', population: 570559, area: 6712 },
      { id: '16', name: 'Kasserine', code: 'TN-36', population: 439243, area: 8066 },
      { id: '17', name: 'Sidi Bouzid', code: 'TN-37', population: 429912, area: 6994 },
      { id: '18', name: 'Gabès', code: 'TN-41', population: 374300, area: 7166 },
      { id: '19', name: 'Medenine', code: 'TN-42', population: 479520, area: 9167 },
      { id: '20', name: 'Tataouine', code: 'TN-43', population: 149453, area: 38889 },
      { id: '21', name: 'Gafsa', code: 'TN-51', population: 337331, area: 8990 },
      { id: '22', name: 'Tozeur', code: 'TN-52', population: 107912, area: 4719 },
      { id: '23', name: 'Kebili', code: 'TN-53', population: 156961, area: 22084 },
      { id: '24', name: 'Zaghouan', code: 'TN-61', population: 176945, area: 2760 }
    ];
    
    return of(governorates).pipe(delay(300));
  }

  getMunicipalities(governorateId?: string): Observable<Municipality[]> {
    const params = governorateId ? `?governorateId=${governorateId}` : '';
    return this.http.get<Municipality[]>(`${this.baseUrl}/municipalities${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // API Structures Gouvernementales
  getGovernmentStructures(governorateId?: string): Observable<GovernmentStructure[]> {
    const params = governorateId ? `?governorateId=${governorateId}` : '';
    return this.http.get<GovernmentStructure[]>(`${this.baseUrl}/structures${params}`).pipe(
      catchError(this.handleError)
    );
  }

  // API Informations Fiscales
  getTaxInfo(taxNumber: string): Observable<TaxInfo | null> {
    const taxInfo: TaxInfo = {
      taxNumber: taxNumber,
      companyName: 'Entreprise Test SARL',
      address: '123 Rue de la République, Tunis 1000',
      taxStatus: 'ACTIVE',
      registrationDate: new Date('2020-01-15'),
      lastDeclaration: new Date('2024-01-15')
    };
    return of(taxInfo).pipe(delay(800));
  }

  // API Licences Commerciales
  getBusinessLicense(licenseNumber: string): Observable<BusinessLicense | null> {
    const license: BusinessLicense = {
      licenseNumber: licenseNumber,
      businessName: 'Commerce Test SARL',
      businessType: 'Commerce de détail',
      address: '456 Avenue Habib Bourguiba, Tunis',
      issueDate: new Date('2022-03-20'),
      expiryDate: new Date('2027-03-20'),
      status: 'ACTIVE'
    };
    return of(license).pipe(delay(600));
  }

  // API Sécurité Sociale
  getSocialSecurityInfo(socialSecurityNumber: string): Observable<SocialSecurityInfo | null> {
    const socialSecurity: SocialSecurityInfo = {
      socialSecurityNumber: socialSecurityNumber,
      employeeName: 'Ahmed Ben Ali',
      employerName: 'Entreprise Test SARL',
      contributionStatus: 'ACTIVE',
      lastContribution: new Date('2024-01-31'),
      totalContributions: 120
    };
    return of(socialSecurity).pipe(delay(700));
  }

  // API Validation d'identité
  validateIdentity(identityNumber: string): Observable<{ valid: boolean; name?: string; birthDate?: Date }> {
    const isValid = identityNumber.length === 8 && /^\d+$/.test(identityNumber);
    if (isValid) {
      return of({
        valid: true,
        name: 'Mohamed Ben Salem',
        birthDate: new Date('1985-06-15')
      }).pipe(delay(400));
    }
    return of({ valid: false }).pipe(delay(400));
  }

  // API Vérification d'adresse
  verifyAddress(address: string, postalCode: string): Observable<{ valid: boolean; normalizedAddress?: string }> {
    const isValid = address.length > 10 && postalCode.length === 4;
    if (isValid) {
      return of({
        valid: true,
        normalizedAddress: address + ', ' + postalCode + ' Tunisie'
      }).pipe(delay(300));
    }
    return of({ valid: false }).pipe(delay(300));
  }

  // API Statistiques Gouvernementales
  getGovernmentStatistics(): Observable<any> {
    const stats = {
      totalGovernorates: 24,
      totalMunicipalities: 350,
      totalStructures: 1250,
      activeBusinesses: 45000,
      registeredTaxpayers: 38000,
      activeSocialSecurityMembers: 2800000
    };
    return of(stats).pipe(delay(600));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}


























