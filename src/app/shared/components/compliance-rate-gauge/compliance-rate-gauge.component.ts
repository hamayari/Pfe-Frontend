import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ComplianceData {
  complianceRate: number;
  totalInvoices: number;
  paidOnTime: number;
  paidLate: number;
  unpaid: number;
  overdue: number;
  averageDelayDays: number;
  onTimePaymentRate: number;
  latePaymentRate: number;
  unpaidRate: number;
}

@Component({
  selector: 'app-compliance-rate-gauge',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="compliance-card">
      <mat-card-header>
        <div class="card-header-content">
          <mat-icon class="header-icon">verified</mat-icon>
          <div class="header-text">
            <h3>Taux de Conformité</h3>
            <p>Paiements à temps vs Total</p>
          </div>
        </div>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="60"></mat-spinner>
          <p>Calcul en cours...</p>
        </div>

        <div *ngIf="!loading && data" class="content">
          <!-- Gauge circulaire -->
          <div class="gauge-container">
            <svg class="gauge-svg" viewBox="0 0 200 200">
              <!-- Cercle de fond -->
              <circle
                class="gauge-background"
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#e0e0e0"
                stroke-width="15"
              />
              
              <!-- Cercle de progression -->
              <circle
                class="gauge-progress"
                cx="100"
                cy="100"
                r="85"
                fill="none"
                [attr.stroke]="getColor()"
                stroke-width="15"
                stroke-linecap="round"
                [style.stroke-dasharray]="getCircumference()"
                [style.stroke-dashoffset]="getDashOffset()"
                transform="rotate(-90 100 100)"
              />
            </svg>

            <!-- Valeur centrale -->
            <div class="gauge-value">
              <div class="percentage" [style.color]="getColor()">
                {{ animatedValue | number:'1.0-0' }}%
              </div>
              <div class="level-badge" [style.background]="getColor()">
                {{ getLevel() }}
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="stats-grid">
            <div class="stat-item success">
              <mat-icon>check_circle</mat-icon>
              <div class="stat-content">
                <span class="stat-label">À temps</span>
                <span class="stat-value">{{ data.paidOnTime }}</span>
              </div>
            </div>

            <div class="stat-item warning">
              <mat-icon>schedule</mat-icon>
              <div class="stat-content">
                <span class="stat-label">En retard</span>
                <span class="stat-value">{{ data.paidLate }}</span>
              </div>
            </div>

            <div class="stat-item danger">
              <mat-icon>cancel</mat-icon>
              <div class="stat-content">
                <span class="stat-label">Non payées</span>
                <span class="stat-value">{{ data.unpaid }}</span>
              </div>
            </div>

            <div class="stat-item info">
              <mat-icon>receipt</mat-icon>
              <div class="stat-content">
                <span class="stat-label">Total</span>
                <span class="stat-value">{{ data.totalInvoices }}</span>
              </div>
            </div>
          </div>

          <!-- Détails supplémentaires -->
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">
                <mat-icon>access_time</mat-icon>
                Délai moyen de paiement
              </span>
              <span class="detail-value">{{ data.averageDelayDays | number:'1.0-1' }} jours</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                <mat-icon>trending_up</mat-icon>
                Taux de paiement à temps
              </span>
              <span class="detail-value success-text">{{ data.onTimePaymentRate | number:'1.0-1' }}%</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">
                <mat-icon>trending_down</mat-icon>
                Taux de paiement en retard
              </span>
              <span class="detail-value warning-text">{{ data.latePaymentRate | number:'1.0-1' }}%</span>
            </div>
          </div>

          <!-- Recommandations -->
          <div class="recommendations" [class]="getRecommendationClass()">
            <mat-icon>{{ getRecommendationIcon() }}</mat-icon>
            <p>{{ getRecommendation() }}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .compliance-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .header-text h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .header-text p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #666;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .gauge-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
    }

    .gauge-progress {
      transition: stroke-dashoffset 1.5s ease-out, stroke 0.3s ease;
    }

    .gauge-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .percentage {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 8px;
    }

    .level-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #f5f5f5;
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .stat-item mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-item.success mat-icon { color: #4CAF50; }
    .stat-item.warning mat-icon { color: #FF9800; }
    .stat-item.danger mat-icon { color: #F44336; }
    .stat-item.info mat-icon { color: #2196F3; }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #666;
    }

    .detail-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .detail-value {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .success-text { color: #4CAF50; }
    .warning-text { color: #FF9800; }

    .recommendations {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .recommendations mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;
    }

    .recommendations p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }

    .recommendations.excellent {
      background: #e8f5e9;
      border-color: #4CAF50;
      color: #2e7d32;
    }

    .recommendations.excellent mat-icon { color: #4CAF50; }

    .recommendations.good {
      background: #f1f8e9;
      border-color: #8BC34A;
      color: #558b2f;
    }

    .recommendations.good mat-icon { color: #8BC34A; }

    .recommendations.medium {
      background: #fff3e0;
      border-color: #FF9800;
      color: #e65100;
    }

    .recommendations.medium mat-icon { color: #FF9800; }

    .recommendations.poor {
      background: #fbe9e7;
      border-color: #FF5722;
      color: #bf360c;
    }

    .recommendations.poor mat-icon { color: #FF5722; }

    .recommendations.critical {
      background: #ffebee;
      border-color: #F44336;
      color: #c62828;
    }

    .recommendations.critical mat-icon { color: #F44336; }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ComplianceRateGaugeComponent implements OnInit, OnChanges {
  @Input() data: ComplianceData | null = null;
  @Input() loading = false;

  animatedValue = 0;
  private animationFrame: any;

  ngOnInit() {
    if (this.data) {
      this.animateValue();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.animateValue();
    }
  }

  animateValue() {
    const target = this.data?.complianceRate || 0;
    const duration = 1500;
    const startTime = performance.now();
    const startValue = this.animatedValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.animatedValue = startValue + (target - startValue) * easeOut;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animatedValue = target;
      }
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(animate);
  }

  getCircumference(): number {
    return 2 * Math.PI * 85;
  }

  getDashOffset(): number {
    const rate = this.data?.complianceRate || 0;
    const circumference = this.getCircumference();
    return circumference - (rate / 100) * circumference;
  }

  getColor(): string {
    const rate = this.data?.complianceRate || 0;
    if (rate >= 90) return '#4CAF50';
    if (rate >= 75) return '#8BC34A';
    if (rate >= 60) return '#FFC107';
    if (rate >= 40) return '#FF9800';
    return '#F44336';
  }

  getLevel(): string {
    const rate = this.data?.complianceRate || 0;
    if (rate >= 90) return 'Excellent';
    if (rate >= 75) return 'Bon';
    if (rate >= 60) return 'Moyen';
    if (rate >= 40) return 'Faible';
    return 'Critique';
  }

  getRecommendationClass(): string {
    const rate = this.data?.complianceRate || 0;
    if (rate >= 90) return 'excellent';
    if (rate >= 75) return 'good';
    if (rate >= 60) return 'medium';
    if (rate >= 40) return 'poor';
    return 'critical';
  }

  getRecommendationIcon(): string {
    const rate = this.data?.complianceRate || 0;
    if (rate >= 90) return 'emoji_events';
    if (rate >= 75) return 'thumb_up';
    if (rate >= 60) return 'info';
    if (rate >= 40) return 'warning';
    return 'error';
  }

  getRecommendation(): string {
    const rate = this.data?.complianceRate || 0;
    if (rate >= 90) {
      return 'Excellent ! Votre taux de conformité est exemplaire. Continuez ainsi !';
    }
    if (rate >= 75) {
      return 'Bon travail ! Quelques améliorations mineures permettraient d\'atteindre l\'excellence.';
    }
    if (rate >= 60) {
      return 'Performance moyenne. Identifiez les causes de retard et mettez en place des actions correctives.';
    }
    if (rate >= 40) {
      return 'Attention ! Le taux de conformité est faible. Une action urgente est nécessaire.';
    }
    return 'Situation critique ! Revoyez immédiatement vos processus de facturation et de recouvrement.';
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
