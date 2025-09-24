import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'echeance' | 'convention' | 'facture';
  status: 'pending' | 'overdue' | 'completed';
  color?: string;
  description?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <mat-card class="calendar-card">
      <mat-card-header>
        <mat-card-title>
          <button mat-icon-button (click)="previousMonth()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          {{ currentMonthYear }}
          <button mat-icon-button (click)="nextMonth()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </mat-card-title>
        <mat-card-subtitle>Calendrier des échéances</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- En-têtes des jours -->
        <div class="calendar-header">
          <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>
        </div>
        
        <!-- Grille du calendrier -->
        <div class="calendar-grid">
          <div 
            *ngFor="let day of calendarDays" 
            class="calendar-day"
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.has-events]="day.events.length > 0"
            (click)="selectDay(day)"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            <div class="events-indicators">
              <div 
                *ngFor="let event of day.events.slice(0, 3)" 
                class="event-dot"
                [class]="'event-' + event.status"
                [matTooltip]="event.title"
              ></div>
              <div *ngIf="day.events.length > 3" class="more-events">
                +{{ day.events.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
    
    <!-- Modal des événements du jour -->
    <div *ngIf="selectedDay" class="events-modal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Événements du {{ selectedDay.date | date:'fullDate' }}</h3>
        <div class="events-list">
          <div 
            *ngFor="let event of selectedDay.events" 
            class="event-item"
            [class]="'event-' + event.status"
            (click)="selectEvent(event)"
          >
            <div class="event-icon">
              <mat-icon>{{ getEventIcon(event.type) }}</mat-icon>
            </div>
            <div class="event-details">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-description">{{ event.description }}</div>
            </div>
            <div class="event-status">
              <span class="status-badge">{{ getStatusLabel(event.status) }}</span>
            </div>
          </div>
        </div>
        <button mat-button (click)="closeModal()">Fermer</button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-card {
      margin: 20px;
      max-width: 800px;
    }
    
    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    
    .day-header {
      padding: 10px;
      text-align: center;
      font-weight: bold;
      background-color: #e0e0e0;
    }
    
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .calendar-day {
      min-height: 80px;
      padding: 5px;
      background-color: white;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }
    
    .calendar-day:hover {
      background-color: #f0f0f0;
    }
    
    .calendar-day.other-month {
      background-color: #fafafa;
      color: #999;
    }
    
    .calendar-day.today {
      background-color: #e3f2fd;
      border: 2px solid #2196f3;
    }
    
    .calendar-day.has-events {
      background-color: #fff3e0;
    }
    
    .day-number {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .events-indicators {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
    }
    
    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ccc;
    }
    
    .event-dot.event-pending {
      background-color: #ff9800;
    }
    
    .event-dot.event-overdue {
      background-color: #f44336;
    }
    
    .event-dot.event-completed {
      background-color: #4caf50;
    }
    
    .more-events {
      font-size: 10px;
      color: #666;
      margin-left: 2px;
    }
    
    .events-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .events-list {
      margin: 15px 0;
    }
    
    .event-item {
      display: flex;
      align-items: center;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .event-item:hover {
      background-color: #f5f5f5;
    }
    
    .event-item.event-pending {
      border-left: 4px solid #ff9800;
    }
    
    .event-item.event-overdue {
      border-left: 4px solid #f44336;
    }
    
    .event-item.event-completed {
      border-left: 4px solid #4caf50;
    }
    
    .event-icon {
      margin-right: 10px;
    }
    
    .event-details {
      flex: 1;
    }
    
    .event-title {
      font-weight: bold;
    }
    
    .event-description {
      font-size: 12px;
      color: #666;
    }
    
    .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .event-pending .status-badge {
      background-color: #fff3e0;
      color: #ff9800;
    }
    
    .event-overdue .status-badge {
      background-color: #ffebee;
      color: #f44336;
    }
    
    .event-completed .status-badge {
      background-color: #e8f5e8;
      color: #4caf50;
    }
  `]
})
export class CalendarComponent implements OnInit {
  @Input() events: CalendarEvent[] = [];
  @Output() eventSelected = new EventEmitter<CalendarEvent>();
  @Output() daySelected = new EventEmitter<Date>();

  currentDate = new Date();
  calendarDays: any[] = [];
  selectedDay: any = null;
  
  weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  ngOnInit() {
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayEvents = this.events.filter(event => 
        event.date.toDateString() === currentDate.toDateString()
      );
      
      this.calendarDays.push({
        date: new Date(currentDate),
        dayNumber: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        events: dayEvents
      });
    }
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDay(day: any) {
    this.selectedDay = day;
    this.daySelected.emit(day.date);
  }

  selectEvent(event: CalendarEvent) {
    this.eventSelected.emit(event);
    this.closeModal();
  }

  closeModal() {
    this.selectedDay = null;
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'echeance': return 'schedule';
      case 'convention': return 'description';
      case 'facture': return 'receipt';
      default: return 'event';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'completed': return 'Terminé';
      default: return status;
    }
  }
} 