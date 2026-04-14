import { TestBed } from '@angular/core/testing';
import { ProductStateService, ProductState } from './product-state.service';
import { Product } from '../models/product.model';
import { take } from 'rxjs';

describe('ProductStateService', () => {
  let service: ProductStateService;

  const mockProduct: Product = {
    id: 'trj-001',
    name: 'Tarjeta de crédito',
    description: 'Tarjeta de crédito Visa Gold',
    logo: 'https://example.com/logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  const mockProduct2: Product = {
    id: 'cta-002',
    name: 'Cuenta de ahorros',
    description: 'Cuenta de ahorros premium',
    logo: 'https://example.com/logo2.png',
    date_release: '2025-06-01',
    date_revision: '2026-06-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductStateService);
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state', () => {
    const snapshot = service.snapshot;
    expect(snapshot.products).toEqual([]);
    expect(snapshot.selectedProduct).toBeNull();
    expect(snapshot.isLoading).toBeFalse();
    expect(snapshot.error).toBeNull();
    expect(snapshot.searchTerm).toBe('');
  });

  // ─── Mutadores ───

  it('should set products', (done) => {
    service.setProducts([mockProduct, mockProduct2]);

    service.products$.pipe(take(1)).subscribe(products => {
      expect(products.length).toBe(2);
      expect(products[0].id).toBe('trj-001');
      done();
    });
  });

  it('should set selected product', (done) => {
    service.setSelectedProduct(mockProduct);

    service.selectedProduct$.pipe(take(1)).subscribe(product => {
      expect(product).toEqual(mockProduct);
      done();
    });
  });

  it('should set loading state', (done) => {
    service.setLoading(true);

    service.isLoading$.pipe(take(1)).subscribe(isLoading => {
      expect(isLoading).toBeTrue();
      done();
    });
  });

  it('should set error and clear loading', (done) => {
    service.setLoading(true);
    service.setError('Something went wrong');

    expect(service.snapshot.isLoading).toBeFalse();
    service.error$.pipe(take(1)).subscribe(error => {
      expect(error).toBe('Something went wrong');
      done();
    });
  });

  it('should set search term', (done) => {
    service.setSearchTerm('tarjeta');

    service.searchTerm$.pipe(take(1)).subscribe(term => {
      expect(term).toBe('tarjeta');
      done();
    });
  });

  // ─── Operaciones CRUD en estado ───

  it('should add a product', () => {
    service.setProducts([mockProduct]);
    service.addProduct(mockProduct2);

    expect(service.snapshot.products.length).toBe(2);
    expect(service.snapshot.products[1].id).toBe('cta-002');
  });

  it('should update a product', () => {
    service.setProducts([mockProduct]);
    const updated = { ...mockProduct, name: 'Tarjeta Platinum' };
    service.updateProduct(updated);

    expect(service.snapshot.products[0].name).toBe('Tarjeta Platinum');
  });

  it('should remove a product', () => {
    service.setProducts([mockProduct, mockProduct2]);
    service.removeProduct('trj-001');

    expect(service.snapshot.products.length).toBe(1);
    expect(service.snapshot.products[0].id).toBe('cta-002');
  });

  it('should clear selected product on remove', () => {
    service.setSelectedProduct(mockProduct);
    service.setProducts([mockProduct]);
    service.removeProduct('trj-001');

    expect(service.snapshot.selectedProduct).toBeNull();
  });

  // ─── Selector derivado: filteredProducts$ ───

  it('should return all products when search term is empty', (done) => {
    service.setProducts([mockProduct, mockProduct2]);
    service.setSearchTerm('');

    service.filteredProducts$.pipe(take(1)).subscribe(products => {
      expect(products.length).toBe(2);
      done();
    });
  });

  it('should filter products by name', (done) => {
    service.setProducts([mockProduct, mockProduct2]);
    service.setSearchTerm('tarjeta');

    service.filteredProducts$.pipe(take(1)).subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('trj-001');
      done();
    });
  });

  it('should filter products by id', (done) => {
    service.setProducts([mockProduct, mockProduct2]);
    service.setSearchTerm('cta');

    service.filteredProducts$.pipe(take(1)).subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('cta-002');
      done();
    });
  });

  it('should filter products by description', (done) => {
    service.setProducts([mockProduct, mockProduct2]);
    service.setSearchTerm('premium');

    service.filteredProducts$.pipe(take(1)).subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('cta-002');
      done();
    });
  });

  // ─── Reset ───

  it('should reset to initial state', () => {
    service.setProducts([mockProduct]);
    service.setSelectedProduct(mockProduct);
    service.setLoading(true);
    service.setError('error');
    service.setSearchTerm('test');

    service.reset();

    const snapshot = service.snapshot;
    expect(snapshot.products).toEqual([]);
    expect(snapshot.selectedProduct).toBeNull();
    expect(snapshot.isLoading).toBeFalse();
    expect(snapshot.error).toBeNull();
    expect(snapshot.searchTerm).toBe('');
  });

  // ─── Inmutabilidad ───

  it('should maintain immutability when updating state', () => {
    service.setProducts([mockProduct]);
    const first = service.snapshot;

    service.setSearchTerm('test');
    const second = service.snapshot;

    expect(first).not.toBe(second); // Objetos diferentes (inmutable)
    expect(first.searchTerm).toBe(''); // El primer snapshot no cambió
    expect(second.searchTerm).toBe('test');
  });
});
