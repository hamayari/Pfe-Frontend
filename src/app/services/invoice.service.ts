import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

import { Invoice as InvoiceModel } from '../models/invoice.model';

export interface Invoice extends InvoiceModel {}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface InvoiceRequest {
  reference: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  conventionId: string;
  conventionName: string;
  amount: number;
  currency: string;
  taxRate: number;
  paymentMethod: string;
  issueDate: Date;
  dueDate: Date;
  description?: string;
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
}

export interface InvoiceFilter {
  status?: string;
  clientId?: string;
  conventionId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  ids?: string[];
}

export interface InvoiceNotifications {
  overdueInvoices: number;
  upcomingDueDates: number;
  pendingApprovals: number;
  paymentConfirmations: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  private statsSubject = new BehaviorSubject<InvoiceStats | null>(null);

  constructor(private http: HttpClient) {}

  // Récupérer toutes les factures
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  // Alias pour getInvoices (pour compatibilité)
  getAllInvoices(): Observable<Invoice[]> {
    return this.getInvoices();
  }

  // Récupérer les factures récentes
  getRecentInvoices(limit: number = 5): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  // Récupérer les statistiques des factures
  getInvoiceStats(): Observable<InvoiceStats> {
    return this.http.get<InvoiceStats>(`${this.apiUrl}/stats`);
  }

  // Alias pour getInvoiceStats (pour compatibilité)
  getInvoiceStatistics(): Observable<InvoiceStats> {
    return this.getInvoiceStats();
  }

  // Récupérer une facture par ID
  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle facture
  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  // Mettre à jour une facture
  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  // Mettre à jour le statut d'une facture
  updateInvoiceStatus(id: string, status: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Supprimer une facture
  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Marquer une facture comme payée
  markAsPaid(id: string, paidDate?: Date): Observable<Invoice> {
    const updateData = { 
      status: 'paid', 
      paidDate: paidDate || new Date() 
    };
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/mark-paid`, updateData);
  }

  // Valider les données d'une facture
  validateInvoiceData(invoiceData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!invoiceData.reference) {
      errors.push('La référence est obligatoire');
    }
    if (!invoiceData.amount || invoiceData.amount <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }
    if (!invoiceData.dueDate) {
      errors.push('La date d\'échéance est obligatoire');
    }
    if (!invoiceData.clientId) {
      errors.push('Le client est obligatoire');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtenir la couleur du statut de paiement
  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  }

  // Obtenir le libellé du statut de paiement
  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  }

  // Obtenir le libellé de la méthode de paiement
  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'transfer': return 'Virement';
      case 'check': return 'Chèque';
      case 'cash': return 'Espèces';
      default: return method;
    }
  }

  // Envoyer un rappel de paiement
  sendPaymentReminder(invoiceId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${invoiceId}/send-reminder`, {});
  }

  // Envoyer des rappels de paiement en lot
  sendPaymentReminders(invoiceIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-reminders`, { invoiceIds });
  }

  // Enregistrer des paiements en lot
  recordBulkPayments(payments: PaymentRequest[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-payments`, { payments });
  }

  // Obtenir les notifications de factures
  getInvoiceNotifications(): Observable<InvoiceNotifications> {
    return this.http.get<InvoiceNotifications>(`${this.apiUrl}/notifications`);
  }

  // Exporter les factures
  exportInvoices(format: string, filters?: InvoiceFilter): Observable<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof InvoiceFilter];
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('format', format);
    
    return this.http.get(`${this.apiUrl}/export?${params.toString()}`, {
      responseType: 'blob'
    });
  }

  // Générer un PDF de facture
  generateInvoicePDF(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
  }

  // Méthodes pour les observables
  get invoices$(): Observable<Invoice[]> {
    return this.invoicesSubject.asObservable();
  }

  get stats$(): Observable<InvoiceStats | null> {
    return this.statsSubject.asObservable();
  }

  // Mettre à jour les données
  refreshInvoices(): void {
    this.getInvoices().subscribe(invoices => {
      this.invoicesSubject.next(invoices);
    });
  }

  refreshStats(): void {
    this.getInvoiceStats().subscribe(stats => {
      this.statsSubject.next(stats);
    });
  }

  // Rafraîchir toutes les données
  refreshAllData(): void {
    this.refreshInvoices();
    this.refreshStats();
  }
} 