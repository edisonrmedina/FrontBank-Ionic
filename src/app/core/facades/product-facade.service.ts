import { Injectable } from '@angular/core';
import { Observable, tap, finalize, catchError, throwError, switchMap, of } from 'rxjs';
import { ProductRepository } from '../interfaces/product-repository.interface';
import { NotificationService } from '../interfaces/notification.interface';
import { ProductStateService } from '../state/product-state.service';
import { Product, ProductMutationResponse } from '../models/product.model';

/**
 * Facade Pattern: Coordina la interacción entre State y Repository.
 *
 * ¿Por qué un Facade?
 * - Los componentes NO deben conocer la lógica de "cargar datos → guardar en estado → notificar".
 * - Un Facade expone métodos simples (loadProducts, createProduct) que orquestan todo internamente.
 * - Facilita testing: los componentes solo dependen del Facade, que se puede mockear fácilmente.
 *
 * RxJS avanzado usado aquí:
 * - tap: efectos secundarios sin modificar el stream
 * - finalize: se ejecuta siempre al final (loading = false)
 * - switchMap: cancela peticiones anteriores cuando llega una nueva
 * - catchError: manejo de errores dentro del pipe
 *
 * SRP: Solo orquesta flujos de datos (no hace UI ni HTTP directo).
 * DIP: Depende de abstracciones (ProductRepository, NotificationService).
 */
@Injectable({ providedIn: 'root' })
export class ProductFacadeService {

  readonly products$ = this.state.products$;
  readonly filteredProducts$ = this.state.filteredProducts$;
  readonly selectedProduct$ = this.state.selectedProduct$;
  readonly isLoading$ = this.state.isLoading$;
  readonly error$ = this.state.error$;

  constructor(
    private readonly productRepo: ProductRepository,
    private readonly notification: NotificationService,
    private readonly state: ProductStateService,
  ) {}

  loadProducts(): void {
    this.state.setLoading(true);
    this.productRepo.getAll().pipe(
      tap(response => this.state.setProducts(response.data)),
      finalize(() => this.state.setLoading(false)),
    ).subscribe({
      error: (error) => {
        this.state.setError('Error al cargar productos');
      },
    });
  }

  loadProductById(id: string): Observable<Product> {
    this.state.setLoading(true);
    return this.productRepo.getById(id).pipe(
      tap(product => this.state.setSelectedProduct(product)),
      catchError(error => {
        this.state.setError('Producto no encontrado');
        return throwError(() => error);
      }),
      finalize(() => this.state.setLoading(false)),
    );
  }

  createProduct(product: Product): Observable<ProductMutationResponse> {
    this.state.setLoading(true);
    return this.productRepo.create(product).pipe(
      tap(response => {
        this.state.addProduct(response.data);
        this.notification.showSuccess(response.message);
      }),
      catchError(error => {
        this.state.setError('Error al crear producto');
        return throwError(() => error);
      }),
      finalize(() => this.state.setLoading(false)),
    );
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ProductMutationResponse> {
    this.state.setLoading(true);
    return this.productRepo.update(id, product).pipe(
      tap(response => {
        this.state.updateProduct(response.data);
        this.state.setSelectedProduct(response.data);
        this.notification.showSuccess(response.message);
      }),
      catchError(error => {
        this.state.setError('Error al actualizar producto');
        return throwError(() => error);
      }),
      finalize(() => this.state.setLoading(false)),
    );
  }

  deleteProduct(id: string): Observable<void> {
    this.state.setLoading(true);
    return this.productRepo.delete(id).pipe(
      tap(() => {
        this.state.removeProduct(id);
        this.notification.showSuccess('Producto eliminado exitosamente');
      }),
      switchMap(() => of(void 0)),
      catchError(error => {
        this.state.setError('Error al eliminar producto');
        return throwError(() => error);
      }),
      finalize(() => this.state.setLoading(false)),
    );
  }

  search(term: string): void {
    this.state.setSearchTerm(term);
  }

  verifyId(id: string): Observable<boolean> {
    return this.productRepo.verifyId(id);
  }

  clearSelectedProduct(): void {
    this.state.setSelectedProduct(null);
  }
}
