import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProductListPage } from './product-list.page';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { Product } from '../../core/models/product.model';

describe('ProductListPage', () => {
  let component: ProductListPage;
  let fixture: ComponentFixture<ProductListPage>;
  let mockFacade: jasmine.SpyObj<ProductFacadeService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProducts: Product[] = [
    {
      id: 'trj-001', name: 'Tarjeta de crédito', description: 'Visa Gold',
      logo: 'logo.png', date_release: '2025-01-01', date_revision: '2026-01-01',
    },
    {
      id: 'cta-002', name: 'Cuenta de ahorros', description: 'Premium',
      logo: 'logo2.png', date_release: '2025-06-01', date_revision: '2026-06-01',
    },
  ];

  beforeEach(async () => {
    mockFacade = jasmine.createSpyObj('ProductFacadeService',
      ['loadProducts', 'search', 'deleteProduct', 'clearSelectedProduct'],
      {
        filteredProducts$: new BehaviorSubject(mockProducts),
        isLoading$: new BehaviorSubject(false),
        error$: new BehaviorSubject(null),
      }
    );
    mockFacade.deleteProduct.and.returnValue(of(void 0));
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        { provide: ProductFacadeService, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadProducts on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(mockFacade.loadProducts).toHaveBeenCalled();
  });

  it('should navigate to create on navigateToCreate()', () => {
    component.navigateToCreate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('should navigate to detail on navigateToDetail()', () => {
    component.navigateToDetail(mockProducts[0]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'trj-001']);
  });

  it('should navigate to edit on navigateToEdit()', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.navigateToEdit(mockProducts[0], event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'trj-001', 'edit']);
  });

  it('should open delete modal', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.openDeleteModal(mockProducts[0], event);

    expect(component.showDeleteModal).toBeTrue();
    expect(component.productToDelete).toEqual(mockProducts[0]);
  });

  it('should close modal on cancelDelete', () => {
    component.showDeleteModal = true;
    component.productToDelete = mockProducts[0];

    component.cancelDelete();

    expect(component.showDeleteModal).toBeFalse();
    expect(component.productToDelete).toBeNull();
  });

  it('should call facade.deleteProduct on confirmDelete', () => {
    component.productToDelete = mockProducts[0];
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(mockFacade.deleteProduct).toHaveBeenCalledWith('trj-001');
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should not delete if productToDelete is null', () => {
    component.productToDelete = null;
    component.confirmDelete();

    expect(mockFacade.deleteProduct).not.toHaveBeenCalled();
  });

  it('should debounce search input', fakeAsync(() => {
    component.onSearch('tar');
    component.onSearch('tarj');
    component.onSearch('tarje');

    tick(300); // debounceTime

    // Only the last value should be sent to facade
    expect(mockFacade.search).toHaveBeenCalledTimes(1);
    expect(mockFacade.search).toHaveBeenCalledWith('tarje');
  }));
});
