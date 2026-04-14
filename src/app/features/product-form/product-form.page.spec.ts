import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductFormPage } from './product-form.page';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { Product, ProductMutationResponse } from '../../core/models/product.model';

describe('ProductFormPage', () => {
  let component: ProductFormPage;
  let fixture: ComponentFixture<ProductFormPage>;
  let mockFacade: jasmine.SpyObj<ProductFacadeService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: 'trj-001', name: 'Tarjeta de crédito', description: 'Tarjeta Visa Gold para clientes',
    logo: 'https://example.com/logo.png', date_release: '2025-06-01', date_revision: '2026-06-01',
  };

  function setupComponent(routeId: string | null = null) {
    mockFacade = jasmine.createSpyObj('ProductFacadeService', [
      'createProduct', 'updateProduct', 'loadProductById', 'verifyId', 'clearSelectedProduct',
    ]);
    mockFacade.createProduct.and.returnValue(of({ message: 'Creado', data: mockProduct } as ProductMutationResponse));
    mockFacade.updateProduct.and.returnValue(of({ message: 'Actualizado', data: mockProduct } as ProductMutationResponse));
    mockFacade.loadProductById.and.returnValue(of(mockProduct));
    mockFacade.verifyId.and.returnValue(of(false));
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        { provide: ProductFacadeService, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // ─── Create Mode ───

  describe('Create mode', () => {
    beforeEach(() => setupComponent(null));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.pageTitle).toBe('Agregar Producto');
    });

    it('should have an invalid form initially', () => {
      expect(component.form.valid).toBeFalse();
    });

    it('should validate required fields', () => {
      component.form.get('id')?.markAsTouched();
      expect(component.hasError('id')).toBeTrue();
      expect(component.getErrorMessage('id')).toBe('Este campo es requerido');
    });

    it('should validate min length on id', () => {
      component.form.get('id')?.setValue('ab');
      component.form.get('id')?.markAsTouched();
      expect(component.hasError('id')).toBeTrue();
      expect(component.getErrorMessage('id')).toContain('Mínimo 3');
    });

    it('should validate max length on id', () => {
      component.form.get('id')?.setValue('abcdefghijk');
      component.form.get('id')?.markAsTouched();
      expect(component.hasError('id')).toBeTrue();
      expect(component.getErrorMessage('id')).toContain('Máximo 10');
    });

    it('should auto-calculate date_revision from date_release', () => {
      component.form.get('date_release')?.setValue('2025-06-15');

      const revision = component.form.get('date_revision')?.value;
      expect(revision).toBe('2026-06-15');
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(mockFacade.createProduct).not.toHaveBeenCalled();
    });

    it('should submit valid form in create mode', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];

      component.form.patchValue({
        id: 'trj-001',
        name: 'Tarjeta de crédito',
        description: 'Tarjeta Visa Gold para clientes premium',
        logo: 'https://example.com/logo.png',
        date_release: dateStr,
      });
      // Remove async validators so form is not PENDING
      const idCtrl = component.form.get('id')!;
      idCtrl.clearAsyncValidators();
      idCtrl.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.form.valid).toBeTrue();
      component.onSubmit();

      expect(mockFacade.createProduct).toHaveBeenCalled();
    });

    it('should reset form on onReset()', () => {
      component.form.get('id')?.setValue('test');
      component.onReset();
      expect(component.form.get('id')?.value).toBeNull();
    });
  });

  // ─── Edit Mode ───

  describe('Edit mode', () => {
    beforeEach(() => setupComponent('trj-001'));

    it('should be in edit mode', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.pageTitle).toBe('Editar Producto');
    });

    it('should load product data', () => {
      expect(mockFacade.loadProductById).toHaveBeenCalledWith('trj-001');
    });

    it('should disable id field in edit mode', () => {
      expect(component.form.get('id')?.disabled).toBeTrue();
    });

    it('should submit valid form in edit mode', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];

      component.form.get('date_release')?.clearValidators();
      component.form.get('date_release')?.setValue(dateStr);
      component.form.get('date_release')?.updateValueAndValidity();
      component.form.get('name')?.setValue('Tarjeta Platinum actualizada');
      fixture.detectChanges();

      component.onSubmit();

      expect(mockFacade.updateProduct).toHaveBeenCalled();
    });
  });

  // ─── Error Messages ───

  describe('Error messages', () => {
    beforeEach(() => setupComponent(null));

    it('should return empty string for valid field', () => {
      // Set a valid value on name (5+ chars) so it has no errors
      component.form.get('name')?.setValue('Tarjeta Visa');
      expect(component.getErrorMessage('name')).toBe('');
    });

    it('should not show error for untouched fields', () => {
      expect(component.hasError('id')).toBeFalse();
    });
  });
});
