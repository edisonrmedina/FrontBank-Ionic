import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { ProductRepository } from './app/core/interfaces/product-repository.interface';
import { ProductHttpService } from './app/core/services/product-http.service';
import { NotificationService } from './app/core/interfaces/notification.interface';
import { ToastNotificationService } from './app/core/services/toast-notification.service';
import { ProductStatePort } from './app/core/interfaces/product-state.interface';
import { ProductStateService } from './app/core/state/product-state.service';

/**
 * DIP: Aquí se configura la inyección de dependencias.
 * Los componentes dependen de abstracciones (ProductRepository, NotificationService, ProductStatePort)
 * y aquí se resuelven con sus implementaciones concretas.
 *
 * Para cambiar la implementación del estado (ej: NgRx, SignalStore),
 * solo se modifica esta línea: { provide: ProductStatePort, useClass: NgrxStateService }
 */
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([errorInterceptor])),
    { provide: ProductRepository, useClass: ProductHttpService },
    { provide: NotificationService, useClass: ToastNotificationService },
    { provide: ProductStatePort, useClass: ProductStateService },
  ],
});
