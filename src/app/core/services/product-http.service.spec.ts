import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductHttpService } from './product-http.service';
import { ProductRepository } from '../interfaces/product-repository.interface';
import { Product } from '../models/product.model';

describe('ProductHttpService', () => {
  let service: ProductHttpService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3002/bp/products';

  const mockProduct: Product = {
    id: 'trj-001',
    name: 'Tarjeta de crédito',
    description: 'Tarjeta Visa Gold',
    logo: 'https://example.com/logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductHttpService,
        { provide: ProductRepository, useClass: ProductHttpService },
      ],
    });

    service = TestBed.inject(ProductHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no queden peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be an instance of ProductRepository (LSP)', () => {
    expect(service instanceof ProductRepository).toBeTrue();
  });

  // ─── getAll ───

  it('should GET all products', () => {
    const mockResponse = { data: [mockProduct] };

    service.getAll().subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].id).toBe('trj-001');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ─── getById ───

  it('should GET product by id', () => {
    service.getById('trj-001').subscribe(product => {
      expect(product.id).toBe('trj-001');
      expect(product.name).toBe('Tarjeta de crédito');
    });

    const req = httpMock.expectOne(`${baseUrl}/trj-001`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  // ─── create ───

  it('should POST to create a product', () => {
    const mockResponse = { message: 'Creado', data: mockProduct };

    service.create(mockProduct).subscribe(response => {
      expect(response.message).toBe('Creado');
      expect(response.data.id).toBe('trj-001');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProduct);
    req.flush(mockResponse);
  });

  // ─── update ───

  it('should PUT to update a product', () => {
    const partial = { name: 'Tarjeta Platinum' };
    const mockResponse = { message: 'Actualizado', data: { ...mockProduct, ...partial } };

    service.update('trj-001', partial).subscribe(response => {
      expect(response.message).toBe('Actualizado');
      expect(response.data.name).toBe('Tarjeta Platinum');
    });

    const req = httpMock.expectOne(`${baseUrl}/trj-001`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(partial);
    req.flush(mockResponse);
  });

  // ─── delete ───

  it('should DELETE a product', () => {
    const mockResponse = { message: 'Eliminado' };

    service.delete('trj-001').subscribe(response => {
      expect(response.message).toBe('Eliminado');
    });

    const req = httpMock.expectOne(`${baseUrl}/trj-001`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  // ─── verifyId ───

  it('should GET verification for existing id', () => {
    service.verifyId('trj-001').subscribe(exists => {
      expect(exists).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/verification/trj-001`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should GET verification for non-existing id', () => {
    service.verifyId('new-001').subscribe(exists => {
      expect(exists).toBeFalse();
    });

    const req = httpMock.expectOne(`${baseUrl}/verification/new-001`);
    expect(req.request.method).toBe('GET');
    req.flush(false);
  });

  // ─── Error handling ───

  it('should handle HTTP error on getAll', () => {
    service.getAll().subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });
});
