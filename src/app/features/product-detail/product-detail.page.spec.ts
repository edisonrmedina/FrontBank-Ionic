import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ProductDetailPage } from './product-detail.page';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { Product } from '../../core/models/product.model';

describe('ProductDetailPage', () => {
  let component: ProductDetailPage;
  let fixture: ComponentFixture<ProductDetailPage>;
  let mockFacade: jasmine.SpyObj<ProductFacadeService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: 'trj-001', name: 'Tarjeta de crédito', description: 'Visa Gold',
    logo: 'logo.png', date_release: '2025-01-01', date_revision: '2026-01-01',
  };

  beforeEach(async () => {
    mockFacade = jasmine.createSpyObj('ProductFacadeService',
      ['loadProductById', 'deleteProduct', 'clearSelectedProduct'],
      {
        selectedProduct$: new BehaviorSubject<Product | null>(mockProduct),
        isLoading$: new BehaviorSubject(false),
      }
    );
    mockFacade.loadProductById.and.returnValue(of(mockProduct));
    mockFacade.deleteProduct.and.returnValue(of(void 0));
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      providers: [
        { provide: ProductFacadeService, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'trj-001' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product by id on init', () => {
    expect(mockFacade.loadProductById).toHaveBeenCalledWith('trj-001');
  });

  it('should navigate to edit', () => {
    component.navigateToEdit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'trj-001', 'edit']);
  });

  it('should open delete modal', () => {
    component.openDeleteModal();
    expect(component.showDeleteModal).toBeTrue();
  });

  it('should close modal on cancel', () => {
    component.showDeleteModal = true;
    component.cancelDelete();
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should delete product and navigate to list', () => {
    component.confirmDelete();

    expect(mockFacade.deleteProduct).toHaveBeenCalledWith('trj-001');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should navigate to products on load error', () => {
    mockFacade.loadProductById.and.returnValue(throwError(() => new Error('Not found')));

    // Re-create component to trigger ngOnInit with error
    fixture = TestBed.createComponent(ProductDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should clear selected product on destroy', () => {
    component.ngOnDestroy();
    expect(mockFacade.clearSelectedProduct).toHaveBeenCalled();
  });
});
