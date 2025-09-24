import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'convention' | 'facture' | 'echeance';
  description?: string;
  color?: string;
  status: 'pending' | 'overdue' | 'completed';
}

@Injectable()
export class CalendarService {

  constructor() { }

  generateEventsFromConventions(conventions: any[]): CalendarEvent[] {
    return conventions.map(conv => ({
      id: `conv-${conv.id}`,
      title: `Convention: ${conv.reference || conv.title}`,
      date: new Date(conv.startDate || conv.createdAt),
      type: 'convention' as const,
      description: conv.description,
      color: '#2196f3',
      status: conv.status === 'ACTIVE' ? 'pending' : conv.status === 'EXPIRED' ? 'overdue' : 'completed'
    }));
  }

  generateEventsFromInvoices(invoices: any[]): CalendarEvent[] {
    return invoices.map(invoice => ({
      id: `invoice-${invoice.id}`,
      title: `Facture: ${invoice.invoiceNumber}`,
      date: new Date(invoice.dueDate),
      type: 'facture' as const,
      description: `Montant: ${invoice.amount}`,
      color: '#ff9800',
      status: invoice.status === 'PAID' ? 'completed' : new Date(invoice.dueDate) < new Date() ? 'overdue' : 'pending'
    }));
  }

  generateTestEvents(): CalendarEvent[] {
    const today = new Date();
    return [
      {
        id: 'test-1',
        title: 'Convention Test 1',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        type: 'convention',
        description: 'Convention de test',
        color: '#2196f3',
        status: 'pending'
      },
      {
        id: 'test-2',
        title: 'Facture Test 1',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        type: 'facture',
        description: 'Facture de test',
        color: '#ff9800',
        status: 'pending'
      }
    ];
  }

  exportCalendar(format: 'ics' | 'pdf' | 'excel'): Observable<Blob> {
    // Mock implementation - in real app, this would call backend
    const mockData = new Blob(['Calendar export data'], { type: 'text/plain' });
    return of(mockData);
  }
}
