import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductState, ProductStatePort } from '../interfaces/product-state.interface';

/**
 * Implementación concreta del store de estado usando BehaviorSubject.
 *
 * ¿Por qué BehaviorSubject y no NgRx?
 * - BehaviorSubject es ideal para apps de tamaño pequeño-mediano.
 * - Evita el boilerplate de NgRx (actions, reducers, effects, selectors).
 * - Demuestra el mismo concepto: estado centralizado, inmutable, reactivo.
 *
 * SRP: Solo gestiona el estado de productos (no hace HTTP ni UI).
 * LSP: Extiende ProductStatePort — cualquier otra implementación (NgRx, Akita)
 *      puede sustituir esta clase sin afectar al Facade ni a los componentes.
 */

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  searchTerm: '',
};

@Injectable({ providedIn: 'root' })
export class ProductStateService extends ProductStatePort {
  private readonly state$ = new BehaviorSubject<ProductState>(initialState);

  /**
   * Selectores — Observables derivados del estado (equivalente a NgRx selectors).
   * Usan distinctUntilChanged para evitar emisiones duplicadas y shareReplay
   * para compartir la última emisión con nuevos suscriptores (multicasting).
   */
  readonly products$: Observable<Product[]> = this.state$.pipe(
    map(state => state.products),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly selectedProduct$: Observable<Product | null> = this.state$.pipe(
    map(state => state.selectedProduct),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map(state => state.isLoading),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly error$: Observable<string | null> = this.state$.pipe(
    map(state => state.error),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly searchTerm$: Observable<string> = this.state$.pipe(
    map(state => state.searchTerm),
    distinctUntilChanged(),
    shareReplay(1),
  );

  /**
   * Selector derivado: productos filtrados por el término de búsqueda.
   * Combina dos piezas del estado de forma reactiva.
   */
  readonly filteredProducts$: Observable<Product[]> = this.state$.pipe(
    map(state => {
      if (!state.searchTerm) return state.products;
      const term = state.searchTerm.toLowerCase();
      return state.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
      );
    }),
    distinctUntilChanged(),
    shareReplay(1),
  );

  /** Snapshot sincrónico del estado actual (útil para lógica imperativa). */
  get snapshot(): ProductState {
    return this.state$.getValue();
  }

  // ─── Mutadores (equivalente a NgRx reducers) ───

  setProducts(products: Product[]): void {
    this.updateState({ products, error: null });
  }

  setSelectedProduct(product: Product | null): void {
    this.updateState({ selectedProduct: product });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error, isLoading: false });
  }

  setSearchTerm(searchTerm: string): void {
    this.updateState({ searchTerm });
  }

  addProduct(product: Product): void {
    const current = this.snapshot.products;
    this.updateState({ products: [...current, product] });
  }

  updateProduct(updated: Product): void {
    const products = this.snapshot.products.map(p =>
      p.id === updated.id ? updated : p
    );
    this.updateState({ products });
  }

  removeProduct(id: string): void {
    const products = this.snapshot.products.filter(p => p.id !== id);
    this.updateState({ products, selectedProduct: null });
  }

  reset(): void {
    this.state$.next(initialState);
  }

  /**
   * Actualización parcial e inmutable del estado.
   * Siempre crea un nuevo objeto (inmutabilidad) para que Angular detecte el cambio.
   */
  private updateState(partial: Partial<ProductState>): void {
    const current = this.state$.getValue();
    this.state$.next({ ...current, ...partial });
  }
}
