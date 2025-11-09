/**
 * Modèles pour le module KPI Analysis
 */

export interface KpiResult {
  value: number;
  unit: string;
  description: string;
}

export interface KpiAlert {
  id: string;
  kpiName: string;
  currentValue: number;
  expectedValue?: number;
  thresholdValue?: number;
  status: 'SAIN' | 'A_SURVEILLER' | 'ANORMAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dimension?: string;
  dimensionValue?: string;
  message: string;
  recommendation?: string;
  recipients?: string[];
  alertStatus: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notificationSent: boolean;
  notificationSentAt?: Date;
  notificationChannels?: string[];
}

export interface KpiThreshold {
  id?: string;
  kpiName: string;
  description: string;
  lowThreshold: number;
  highThreshold: number;
  normalValue: number;
  tolerancePercent: number;
  unit: string;
  dimension: string;
  dimensionValue?: string;
  enabled: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KpiDashboard {
  success: boolean;
  globalKpis: { [key: string]: KpiResult };
  kpisByGouvernorat: { [key: string]: { [key: string]: KpiResult } };
  activeAlerts: KpiAlert[];
  criticalAlerts: KpiAlert[];
  stats: {
    totalAlerts: number;
    criticalAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
  };
  timestamp: Date;
}

export interface KpiCard {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  status?: 'SAIN' | 'A_SURVEILLER' | 'ANORMAL';
}
