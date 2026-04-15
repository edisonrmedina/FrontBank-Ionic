import { TestBed } from '@angular/core/testing';
import { ProductFacadeService } from './product-facade.service';
import { ProductRepository } from '../interfaces/product-repository.interface';
import { NotificationService } from '../interfaces/notification.interface';
import { ProductStatePort } from '../interfaces/product-state.interface';
import { ProductStateService } from '../state/product-state.service';
import { Product, ProductMutationResponse, ProductResponse, ProductDeleteResponse } from '../models/product.model';
import { of, throwError } from 'rxjs';

describe('ProductFacadeService', () => {
  let facade: ProductFacadeService;
  let mockRepo: jasmine.SpyObj<ProductRepository>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let state: ProductStateService;

  const mockProduct: Product = {
    id: 'trj-001',
    name: 'Tarjeta de crédito',
    description: 'Tarjeta Visa Gold',
    logo: 'https://example.com/logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  const mockResponse: ProductResponse = { data: [mockProduct] };
  const mockMutationResponse: ProductMutationResponse = {
    message: 'Producto creado',
    data: mockProduct,
  };
  const mockDeleteResponse: ProductDeleteResponse = { message: 'Producto eliminado' };

  beforeEach(() => {
    mockRepo = jasmine.createSpyObj('ProductRepository', [
      'getAll', 'getById', 'create', 'update', 'delete', 'verifyId',
    ]);
    mockNotification = jasmine.createSpyObj('NotificationService', [
      'showSuccess', 'showError', 'showWarning',
    ]);
    mockNotification.showSuccess.and.returnValue(Promise.resolve());
    mockNotification.showError.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        ProductFacadeService,
        ProductStateService,
        { provide: ProductStatePort, useExisting: ProductStateService },
        { provide: ProductRepository, useValue: mockRepo },
        { provide: NotificationService, useValue: mockNotification },
      ],
    });

    facade = TestBed.inject(ProductFacadeService);
    state = TestBed.inject(ProductStateService);
    state.reset();
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  // ─── loadProducts ───

  it('should load products and update state', () => {
    mockRepo.getAll.and.returnValue(of(mockResponse));

    facade.loadProducts();

    expect(mockRepo.getAll).toHaveBeenCalled();
    expect(state.snapshot.products.length).toBe(1);
    expect(state.snapshot.products[0].id).toBe('trj-001');
    expect(state.snapshot.isLoading).toBeFalse();
  });

  it('should set error on loadProducts failure', () => {
    mockRepo.getAll.and.returnValue(throwError(() => new Error('Network error')));

    facade.loadProducts();

    expect(state.snapshot.error).toBe('Error al cargar productos');
  });

  // ─── loadProductById ───

  it('should load product by id and select it in state', (done) => {
    mockRepo.getById.and.returnValue(of(mockProduct));

    facade.loadProductById('trj-001').subscribe({
      next: (product) => {
        expect(product.id).toBe('trj-001');
        expect(state.snapshot.selectedProduct).toEqual(mockProduct);
        done();
      },
    });
  });

  it('should set error on loadProductById failure', (done) => {
    mockRepo.getById.and.returnValue(throwError(() => new Error('Not found')));

    facade.loadProductById('xxx').subscribe({
      error: () => {
        expect(state.snapshot.error).toBe('Producto no encontrado');
        done();
      },
    });
  });

  // ─── createProduct ───

  it('should create product and update state', (done) => {
    mockRepo.create.and.returnValue(of(mockMutationResponse));

    facade.createProduct(mockProduct).subscribe(response => {
      expect(response.message).toBe('Producto creado');
      expect(state.snapshot.products).toContain(mockProduct);
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Producto creado');
      done();
    });
  });

  it('should set error on createProduct failure', (done) => {
    mockRepo.create.and.returnValue(throwError(() => new Error('Bad request')));

    facade.createProduct(mockProduct).subscribe({
      error: () => {
        expect(state.snapshot.error).toBe('Error al crear producto');
        done();
      },
    });
  });

  // ─── updateProduct ───

  it('should update product in state', (done) => {
    const updatedProduct = { ...mockProduct, name: 'Tarjeta Platinum' };
    const updateResponse: ProductMutationResponse = {
      message: 'Producto actualizado',
      data: updatedProduct,
    };
    mockRepo.update.and.returnValue(of(updateResponse));

    state.setProducts([mockProduct]);

    facade.updateProduct('trj-001', updatedProduct).subscribe(() => {
      expect(state.snapshot.products[0].name).toBe('Tarjeta Platinum');
      expect(state.snapshot.selectedProduct).toEqual(updatedProduct);
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Producto actualizado');
      done();
    });
  });

  // ─── deleteProduct ───

  it('should delete product and remove from state', (done) => {
    mockRepo.delete.and.returnValue(of(mockDeleteResponse));
    state.setProducts([mockProduct]);

    facade.deleteProduct('trj-001').subscribe(() => {
      expect(state.snapshot.products.length).toBe(0);
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Producto eliminado exitosamente');
      done();
    });
  });

  it('should set error on deleteProduct failure', (done) => {
    mockRepo.delete.and.returnValue(throwError(() => new Error('Server error')));

    facade.deleteProduct('trj-001').subscribe({
      error: () => {
        expect(state.snapshot.error).toBe('Error al eliminar producto');
        done();
      },
    });
  });

  // ─── search ───

  it('should update search term in state', () => {
    facade.search('tarjeta');
    expect(state.snapshot.searchTerm).toBe('tarjeta');
  });

  // ─── verifyId ───

  it('should delegate verifyId to repository', (done) => {
    mockRepo.verifyId.and.returnValue(of(true));

    facade.verifyId('trj-001').subscribe(exists => {
      expect(exists).toBeTrue();
      expect(mockRepo.verifyId).toHaveBeenCalledWith('trj-001');
      done();
    });
  });

  // ─── clearSelectedProduct ───

  it('should clear selected product', () => {
    state.setSelectedProduct(mockProduct);
    facade.clearSelectedProduct();
    expect(state.snapshot.selectedProduct).toBeNull();
  });
});
