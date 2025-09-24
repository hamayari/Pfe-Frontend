import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Facture } from '../models/facture.model';

export interface PaiementStats {
  totalFactures: number;
  facturesPayees: number;
  facturesEnAttente: number;
  montantTotal: number;
  montantPaye: number;
  montantEnAttente: number;
  tauxPaiement: number;
  montantEncaisse: number;
  retards: number;
}

@Injectable({
  providedIn: 'root'
})
export class FactureService {

  constructor() { }

  getPaiementStats(): Observable<PaiementStats> {
    const mockStats: PaiementStats = {
      totalFactures: 25,
      facturesPayees: 18,
      facturesEnAttente: 7,
      montantTotal: 125000,
      montantPaye: 95000,
      montantEnAttente: 30000,
      tauxPaiement: 0.72,
      montantEncaisse: 95000,
      retards: 3
    };
    return of(mockStats);
  }

  getFactures(): Observable<Facture[]> {
    const mockFactures: Facture[] = [
      {
        id: '1',
        reference: 'FAC-2024-001',
        structure: 'Structure A',
        montant: 5000,
        statut: 'NON PAYÉE',
        echeance: '2024-06-15',
        preuveDisponible: false
      },
      {
        id: '2',
        reference: 'FAC-2024-002',
        structure: 'Structure B',
        montant: 7500,
        statut: 'PAYÉE',
        echeance: '2024-06-10',
        preuveDisponible: true
      }
    ];
    return of(mockFactures);
  }

  getPreuve(factureId: string): Observable<Blob> {
    // Mock implementation - return a simple blob
    const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    return of(mockBlob);
  }
}