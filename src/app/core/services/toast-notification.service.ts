import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { NotificationService } from '../interfaces/notification.interface';

/**
 * SRP: Solo se encarga de mostrar notificaciones tipo toast.
 * DIP: Implementa la abstracción NotificationService.
 */
@Injectable({ providedIn: 'root' })
export class ToastNotificationService extends NotificationService {
  constructor(private readonly toastCtrl: ToastController) {
    super();
  }

  async showSuccess(message: string): Promise<void> {
    await this.presentToast(message, 'success');
  }

  async showError(message: string): Promise<void> {
    await this.presentToast(message, 'danger');
  }

  async showWarning(message: string): Promise<void> {
    await this.presentToast(message, 'warning');
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
