import { Observable } from 'rxjs';
import { Product, } from '../models/product.model';

/**
 * ISP + DIP: Abstracción del store de estado de productos.
 *
 * ¿Por qué una abstract class y no una interface?
 * - Angular DI necesita un token en tiempo de ejecución.
 * - Las interfaces de TypeScript se borran en compilación (erasure).
 * - Una abstract class sirve como token DI y contrato al mismo tiempo.
 *
 * Esto permite sustituir ProductStateService por otra implementación
 * (ej: NgRx, Akita, SignalStore) sin cambiar el Facade ni los componentes.
 */

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
}

export abstract class ProductStatePort {
  // ─── Selectores (observables de solo lectura) ───
  abstract readonly products$: Observable<Product[]>;
  abstract readonly selectedProduct$: Observable<Product | null>;
  abstract readonly isLoading$: Observable<boolean>;
  abstract readonly error$: Observable<string | null>;
  abstract readonly searchTerm$: Observable<string>;
  abstract readonly filteredProducts$: Observable<Product[]>;

  // ─── Snapshot sincrónico ───
  abstract get snapshot(): ProductState;

  // ─── Mutadores ───
  abstract setProducts(products: Product[]): void;
  abstract setSelectedProduct(product: Product | null): void;
  abstract setLoading(isLoading: boolean): void;
  abstract setError(error: string | null): void;
  abstract setSearchTerm(searchTerm: string): void;
  abstract addProduct(product: Product): void;
  abstract updateProduct(updated: Product): void;
  abstract removeProduct(id: string): void;
  abstract reset(): void;
}
