import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'annex' | 'justification' | 'other';
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  relatedConventionId?: string;
  relatedInvoiceId?: string;
  downloadUrl?: string;
  tags?: string[];
}

export interface DocumentUploadRequest {
  file: File;
  type: string;
  relatedConventionId?: string;
  relatedInvoiceId?: string;
  tags?: string[];
  description?: string;
  paymentAmount?: number; // Ajout pour upload preuve paiement
}

@Injectable()
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Upload de document - support both old and new interfaces
  uploadDocument(fileOrRequest: File | any, type?: string, description?: string): Observable<any> {
    const formData = new FormData();
    
    if (fileOrRequest instanceof File) {
      // New interface: uploadDocument(file, type, description)
      formData.append('file', fileOrRequest);
      formData.append('type', type || 'document');
      if (description) {
        formData.append('description', description);
      }
    } else {
      // Old interface: uploadDocument(request)
      const request = fileOrRequest;
      formData.append('file', request.file);
      formData.append('type', request.type || 'document');
      if (request.description) {
        formData.append('description', request.description);
      }
      if (request.relatedInvoiceId) {
        formData.append('invoiceId', request.relatedInvoiceId);
      }
      if (request.relatedConventionId) {
        formData.append('relatedConventionId', request.relatedConventionId);
      }
      if (request.tags) {
        formData.append('tags', JSON.stringify(request.tags));
      }
      if (request.paymentAmount) {
        formData.append('paymentAmount', String(request.paymentAmount));
      }
    }
    
    formData.append('clientId', this.authService.getCurrentUser()?.id || '');
    formData.append('clientEmail', this.authService.getCurrentUser()?.email || '');
    
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.getHeaders()
    });
  }

  // Récupération des documents
  getDocuments(filters?: {
    type?: string;
    relatedConventionId?: string;
    relatedInvoiceId?: string;
    tags?: string[];
  }): Observable<Document[]> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.relatedConventionId) queryParams.append('relatedConventionId', filters.relatedConventionId);
      if (filters.relatedInvoiceId) queryParams.append('relatedInvoiceId', filters.relatedInvoiceId);
      if (filters.tags) queryParams.append('tags', JSON.stringify(filters.tags));
      params = '?' + queryParams.toString();
    }
    return this.http.get<Document[]>(`${this.apiUrl}${params}`, { headers: this.getHeaders() });
  }

  // Documents par convention
  getDocumentsByConvention(conventionId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/convention/${conventionId}`, { headers: this.getHeaders() });
  }

  // Documents par facture
  getDocumentsByInvoice(invoiceId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/invoice/${invoiceId}`, { headers: this.getHeaders() });
  }

  // Téléchargement de document
  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${documentId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Prévisualisation de document
  previewDocument(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/preview/${documentId}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Mise à jour des tags
  updateDocumentTags(documentId: string, tags: string[]): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${documentId}/tags`, {
      tags
    }, { headers: this.getHeaders() });
  }

  // Suppression de document
  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`, { headers: this.getHeaders() });
  }

  // Archivage de document
  archiveDocument(documentId: string): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${documentId}/archive`, {}, { headers: this.getHeaders() });
  }

  // Recherche de documents
  searchDocuments(query: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() });
  }
} 