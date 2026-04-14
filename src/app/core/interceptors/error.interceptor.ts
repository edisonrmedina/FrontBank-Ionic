import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../interfaces/notification.interface';

/**
 * SRP: Solo se encarga de interceptar errores HTTP y delegar la notificación.
 * DIP: Depende de la abstracción NotificationService, no de una implementación concreta.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Ha ocurrido un error inesperado';

      if (error.status === 0) {
        message = 'No se pudo conectar con el servidor';
      } else if (error.status === 404) {
        message = 'Producto no encontrado';
      } else if (error.status === 400) {
        message = error.error?.message || 'Datos inválidos, verifique el formulario';
      }

      notification.showError(message);
      return throwError(() => error);
    })
  );
};
