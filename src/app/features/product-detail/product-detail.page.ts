import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { Product } from '../../core/models/product.model';
import { SkeletonListComponent } from '../../shared/components/skeleton-list/skeleton-list.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

/**
 * SRP: Solo se encarga de mostrar el detalle de un producto.
 * DIP: Depende del Facade, no de servicios HTTP ni State directamente.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, SkeletonListComponent, ConfirmModalComponent],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  /** Observables del estado — consumidos con async pipe */
  selectedProduct$ = this.facade.selectedProduct$;
  isLoading$ = this.facade.isLoading$;

  showDeleteModal = false;
  private productId: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly facade: ProductFacadeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.facade.loadProductById(this.productId).pipe(
        takeUntil(this.destroy$),
      ).subscribe({
        error: () => this.router.navigate(['/products']),
      });
    }
  }

  navigateToEdit(): void {
    if (this.productId) {
      this.router.navigate(['/products', this.productId, 'edit']);
    }
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.productId) return;
    this.facade.deleteProduct(this.productId).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.router.navigate(['/products']);
      },
      error: () => {
        this.showDeleteModal = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  ngOnDestroy(): void {
    this.facade.clearSelectedProduct();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
