import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewMessageDialogComponent, NewMessageDialogData, NewMessageDialogResult } from '../components/new-message-dialog/new-message-dialog.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly SNOOZE_KEY = 'notifySnoozeUntil';

  constructor(private dialog: MatDialog, private snack: MatSnackBar) {}

  isSnoozed(): boolean {
    const until = Number(localStorage.getItem(this.SNOOZE_KEY) || '0');
    return !isNaN(until) && Date.now() < until;
  }

  snooze(minutes: number): void {
    const until = Date.now() + minutes * 60_000;
    localStorage.setItem(this.SNOOZE_KEY, String(until));
  }

  clearSnooze(): void {
    localStorage.removeItem(this.SNOOZE_KEY);
  }

  async notifyNewMessage(data: NewMessageDialogData, onOpen?: () => void): Promise<void> {
    if (this.isSnoozed()) return;
    const ref = this.dialog.open(NewMessageDialogComponent, {
      data,
      width: '360px',
      panelClass: 'gp-new-message-dialog'
    });
    const result = await ref.afterClosed().toPromise();
    if (result === 'open' && onOpen) onOpen();
    if (result === 'snooze_15') this.snooze(15);
    if (result === 'snooze_60') this.snooze(60);
  }

  notifyNewMessageToast(senderName: string, preview: string, onOpen?: () => void) {
    const ref = this.snack.open(`${senderName}: ${preview}`, 'Ouvrir', { duration: 6000 });
    ref.onAction().subscribe(() => onOpen && onOpen());
  }
}


