import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, switchMap, Subject, of } from 'rxjs';

export interface NotificationPaiement {
  id: string;
  message: string;
  date: string;
  lu: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationPaiement>();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationPaiement[]> {
    // Mock implementation for testing
    const mockNotifications: NotificationPaiement[] = [
      { id: '1', message: 'Test notification', date: new Date().toISOString(), lu: false }
    ];
    return of(mockNotifications);
  }

  getNotificationStream(): Observable<NotificationPaiement> {
    return this.notificationSubject.asObservable();
  }

  markAsRead(id: string): Observable<any> {
    // Mock implementation for testing
    return of({ success: true });
  }
} 