/**
 * ISP: Interfaz segregada solo para notificaciones.
 * Permite cambiar la implementación de notificaciones sin afectar el resto.
 */
export abstract class NotificationService {
  abstract showSuccess(message: string): Promise<void>;
  abstract showError(message: string): Promise<void>;
  abstract showWarning(message: string): Promise<void>;
}
