import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, timer, combineLatest } from 'rxjs';
import { takeUntil, switchMap, catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { WebsocketService, WebSocketMessage } from './websocket.service';
import { CacheService } from './cache.service';

export interface SystemStats {
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  uptime: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  timestamp: number;
  usageHistory: any[];
  performance: any[];
}

export interface SecurityStats {
  failedLogins: number;
  suspiciousActivities: number;
  lastAudit: Date;
  blockedIPs: number;
  securityAlerts: number;
}

export interface ServiceStatus {
  name: string;
  status: 'ON' | 'OFF';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  event?: string;
  details?: string;
}

export interface RealTimeUpdate {
  type: 'SYSTEM_STATS' | 'ALERT' | 'SECURITY' | 'PERFORMANCE';
  data: any;
  timestamp: Date;
}

export interface MonitoringAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metric?: string;
  value?: number;
  threshold?: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorCount: number;
  successRate: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/monitoring`;
  
  // Subjects for different types of monitoring data
  private systemStatsSubject = new BehaviorSubject<SystemStats | null>(null);
  private alertsSubject = new BehaviorSubject<MonitoringAlert[]>([]);
  private performanceSubject = new BehaviorSubject<PerformanceMetrics | null>(null);
  private usageHistorySubject = new BehaviorSubject<any[]>([]);
  private logsSubject = new BehaviorSubject<any[]>([]);
  
  // Connection status
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private websocketService: WebsocketService,
    private cacheService: CacheService
  ) {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Subscribe to WebSocket connection status
    this.websocketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.connectionStatusSubject.next(status);
        if (status) {
          console.log('Monitoring service connected to WebSocket');
        } else {
          console.log('Monitoring service disconnected from WebSocket');
        }
      });

    // Subscribe to monitoring updates from WebSocket
    this.websocketService.monitoringUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: WebSocketMessage) => {
        this.handleMonitoringMessage(message);
      });

    // Subscribe to dashboard updates for system-wide notifications
    this.websocketService.dashboardUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message: WebSocketMessage) => {
        if (message.data.type === 'monitoring') {
          this.handleMonitoringMessage(message);
        }
      });

    // Fallback polling if WebSocket is not available
    this.setupFallbackPolling();
  }

  private handleMonitoringMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'monitoring':
        if (message.data.systemStats) {
          this.systemStatsSubject.next(message.data.systemStats);
        }
        if (message.data.alerts) {
          this.alertsSubject.next(message.data.alerts);
        }
        if (message.data.performance) {
          this.performanceSubject.next(message.data.performance);
        }
        if (message.data.usageHistory) {
          this.usageHistorySubject.next(message.data.usageHistory);
        }
        if (message.data.logs) {
          this.logsSubject.next(message.data.logs);
        }
        break;
      case 'dashboard':
        if (message.data.monitoring) {
          this.handleMonitoringMessage({
            type: 'monitoring',
            data: message.data.monitoring,
            timestamp: message.timestamp
          });
        }
        break;
    }
  }

  private setupFallbackPolling(): void {
    // Poll every 30 seconds if WebSocket is not connected
    timer(0, 30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.connectionStatusSubject),
        switchMap(isConnected => {
          if (!isConnected) {
            return this.getSystemStats();
          }
          return [];
        }),
        catchError(error => {
          console.error('Fallback polling error:', error);
          return [];
        })
      )
      .subscribe();
  }

  // Public observables
  get systemStats$(): Observable<SystemStats | null> {
    return this.systemStatsSubject.asObservable();
  }

  get alerts$(): Observable<MonitoringAlert[]> {
    return this.alertsSubject.asObservable();
  }

  get performance$(): Observable<PerformanceMetrics | null> {
    return this.performanceSubject.asObservable();
  }

  get usageHistory$(): Observable<any[]> {
    return this.usageHistorySubject.asObservable();
  }

  get logs$(): Observable<any[]> {
    return this.logsSubject.asObservable();
  }

  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  // HTTP API methods
  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.apiUrl}/system-stats`).pipe(
      tap((stats: SystemStats) => this.systemStatsSubject.next(stats)),
      catchError(error => {
        console.error('Error fetching system stats:', error);
        throw error;
      })
    );
  }

  getAlerts(): Observable<MonitoringAlert[]> {
    return this.http.get<MonitoringAlert[]>(`${this.apiUrl}/alerts`).pipe(
      tap((alerts: MonitoringAlert[]) => this.alertsSubject.next(alerts)),
      catchError(error => {
        console.error('Error fetching alerts:', error);
        throw error;
      })
    );
  }

  getPerformanceMetrics(): Observable<PerformanceMetrics> {
    return this.http.get<PerformanceMetrics>(`${this.apiUrl}/performance`).pipe(
      tap((performance: PerformanceMetrics) => this.performanceSubject.next(performance)),
      catchError(error => {
        console.error('Error fetching performance metrics:', error);
        throw error;
      })
    );
  }

  getUsageHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usage-history`)
      .pipe(
        tap(history => this.usageHistorySubject.next(history)),
        catchError(error => {
          console.error('Error fetching usage history:', error);
          throw error;
        })
      );
  }

  getLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`)
      .pipe(
        tap(logs => this.logsSubject.next(logs)),
        catchError(error => {
          console.error('Error fetching logs:', error);
          throw error;
        })
      );
  }

  // Alert management
  acknowledgeAlert(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {})
      .pipe(
        tap(() => {
          const currentAlerts = this.alertsSubject.value;
          const updatedAlerts = currentAlerts.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          );
          this.alertsSubject.next(updatedAlerts);
        }),
        catchError(error => {
          console.error('Error acknowledging alert:', error);
          throw error;
        })
      );
  }

  dismissAlert(alertId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/alerts/${alertId}`)
      .pipe(
        tap(() => {
          const currentAlerts = this.alertsSubject.value;
          const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
          this.alertsSubject.next(updatedAlerts);
        }),
        catchError(error => {
          console.error('Error dismissing alert:', error);
          throw error;
        })
      );
  }

  // Threshold management
  getThresholds(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/thresholds`)
      .pipe(
        catchError(error => {
          console.error('Error fetching thresholds:', error);
          throw error;
        })
      );
  }

  updateThreshold(thresholdId: string, threshold: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/thresholds/${thresholdId}`, threshold)
      .pipe(
        catchError(error => {
          console.error('Error updating threshold:', error);
          throw error;
        })
      );
  }

  updateThresholds(thresholds: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/thresholds`, thresholds)
      .pipe(
        catchError(error => {
          console.error('Error updating thresholds:', error);
          throw error;
        })
      );
  }

  getSecurityStats(): Observable<SecurityStats> {
    return this.http.get<SecurityStats>(`${this.apiUrl}/security`)
      .pipe(
        catchError(error => {
          console.error('Error fetching security stats:', error);
          throw error;
        })
      );
  }

  getServicesStatus(): Observable<ServiceStatus[]> {
    return this.http.get<ServiceStatus[]>(`${this.apiUrl}/services`)
      .pipe(
        catchError(error => {
          console.error('Error fetching services status:', error);
          throw error;
        })
      );
  }

  getRecentLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.apiUrl}/logs/recent`)
      .pipe(
        catchError(error => {
          console.error('Error fetching recent logs:', error);
          throw error;
        })
      );
  }

  getRealTimeUpdates(): Observable<RealTimeUpdate> {
    return this.websocketService.monitoringUpdates$.pipe(
      map((message: WebSocketMessage) => ({
        type: message.type as 'SYSTEM_STATS' | 'ALERT' | 'SECURITY' | 'PERFORMANCE',
        data: message.data,
        timestamp: new Date()
      }))
    );
  }

  // Utility methods
  refreshAllData(): void {
    combineLatest([
      this.getSystemStats(),
      this.getAlerts(),
      this.getPerformanceMetrics(),
      this.getUsageHistory(),
      this.getLogs()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  isConnected(): boolean {
    return this.connectionStatusSubject.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 