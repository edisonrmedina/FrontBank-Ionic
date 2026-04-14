import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ViewWillEnter } from '@ionic/angular';
import { IonContent } from '@ionic/angular/standalone';
import { Product } from '../../core/models/product.model';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { SkeletonListComponent } from '../../shared/components/skeleton-list/skeleton-list.component';

/**
 * SRP: Se encarga exclusivamente de la presentación del listado de productos.
 * DIP: Depende del Facade (abstracción), no de servicios HTTP ni State directamente.
 *
 * RxJS avanzado:
 * - async pipe en el template para suscribirse/desuscribirse automáticamente
 * - debounceTime + distinctUntilChanged para optimizar la búsqueda
 * - Subject + takeUntil para cleanup de suscripciones (evita memory leaks)
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, IonContent,
    SearchBarComponent, ConfirmModalComponent, SkeletonListComponent,
  ],
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit, OnDestroy, ViewWillEnter {
  /** Observables del estado — se consumen con async pipe en el template */
  filteredProducts$ = this.facade.filteredProducts$;
  isLoading$ = this.facade.isLoading$;

  /** Subject para debounce de búsqueda */
  private readonly searchSubject$ = new Subject<string>();

  /** Subject para destruir suscripciones al salir del componente */
  private readonly destroy$ = new Subject<void>();

  showDeleteModal = false;
  productToDelete: Product | null = null;

  constructor(
    private readonly facade: ProductFacadeService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
  }

  /** Ionic lifecycle: se ejecuta cada vez que se entra a la vista */
  ionViewWillEnter(): void {
    this.facade.loadProducts();
  }

  /**
   * RxJS avanzado: debounceTime + distinctUntilChanged.
   * - debounceTime(300): Espera 300ms después de que el usuario deja de escribir
   *   antes de ejecutar la búsqueda (evita llamar en cada tecla).
   * - distinctUntilChanged: No busca si el término es igual al anterior.
   * - takeUntil(destroy$): Se desuscribe automáticamente al destruir el componente.
   */
  private setupSearchDebounce(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(term => this.facade.search(term));
  }

  onSearch(term: string): void {
    this.searchSubject$.next(term);
  }

  navigateToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  navigateToDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  navigateToEdit(product: Product, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products', product.id, 'edit']);
  }

  openDeleteModal(product: Product, event: Event): void {
    event.stopPropagation();
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.facade.deleteProduct(this.productToDelete.id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.productToDelete = null;
      },
      error: () => {
        this.showDeleteModal = false;
        this.productToDelete = null;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  /**
   * Cleanup: completa el Subject para desuscribir todos los observables.
   * Esto previene memory leaks — patrón estándar en Angular.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
