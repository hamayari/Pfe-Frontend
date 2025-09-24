import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  avatar?: string;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTimelineComponent {
  @Input() activities: Activity[] = [];
  @Input() maxItems: number | null = 5;
  
  get displayedActivities(): Activity[] {
    if (this.maxItems && this.activities.length > this.maxItems) {
      return this.activities.slice(0, this.maxItems);
    }
    return this.activities;
  }
  
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 an' : `il y a ${interval} ans`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 mois' : `il y a ${interval} mois`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? 'hier' : `il y a ${interval} jours`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 heure' : `il y a ${interval} heures`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? 'il y a 1 minute' : `il y a ${interval} minutes`;
    }
    
    return 'à l\'instant';
  }
  
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  getRandomColor(seed: string): string {
    // Generate a consistent color based on the user's name
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 65%)`;
  }
  
  trackByActivity(index: number, activity: Activity): string {
    return activity.id;
  }
}
