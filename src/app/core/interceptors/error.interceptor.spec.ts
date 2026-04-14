import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../interfaces/notification.interface';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let mockNotification: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    mockNotification = jasmine.createSpyObj('NotificationService', [
      'showSuccess', 'showError', 'showWarning',
    ]);
    mockNotification.showError.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: mockNotification },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    http.get('/test').subscribe(response => {
      expect(response).toEqual({ ok: true });
    });

    const req = httpMock.expectOne('/test');
    req.flush({ ok: true });

    expect(mockNotification.showError).not.toHaveBeenCalled();
  });

  it('should show error notification on 404', () => {
    http.get('/test').subscribe({
      error: () => {
        expect(mockNotification.showError).toHaveBeenCalledWith('Producto no encontrado');
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should show error notification on 400', () => {
    http.get('/test').subscribe({
      error: () => {
        expect(mockNotification.showError).toHaveBeenCalledWith('Datos inválidos, verifique el formulario');
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should show custom message from 400 response body', () => {
    http.get('/test').subscribe({
      error: () => {
        expect(mockNotification.showError).toHaveBeenCalledWith('ID ya registrado');
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush({ message: 'ID ya registrado' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should show generic error on 500', () => {
    http.get('/test').subscribe({
      error: () => {
        expect(mockNotification.showError).toHaveBeenCalledWith('Ha ocurrido un error inesperado');
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should re-throw the error after notification', (done) => {
    http.get('/test').subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
