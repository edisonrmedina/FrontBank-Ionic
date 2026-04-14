import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductFacadeService } from '../../core/facades/product-facade.service';
import { Product } from '../../core/models/product.model';
import { Observable, Subject, map, of, takeUntil, debounceTime, switchMap } from 'rxjs';

/**
 * OCP: Un solo componente que se adapta a modo "crear" o "editar" sin modificar su lógica interna.
 * SRP: Se encarga exclusivamente de la lógica del formulario de producto.
 * DIP: Depende del Facade (abstracción), no de servicios concretos.
 *
 * RxJS avanzado:
 * - debounceTime en el async validator para no saturar el backend
 * - switchMap para cancelar verificaciones anteriores al escribir nuevo ID
 * - takeUntil para cleanup de suscripciones
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
})
export class ProductFormPage implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  isSubmitting = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly facade: ProductFacadeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }

    this.setupIdAsyncValidator();
    this.setupDateRevisionAutoCalc();
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Producto' : 'Agregar Producto';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Actualizar' : 'Agregar';
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const product: Product = this.form.getRawValue();

    const operation$ = this.isEditMode
      ? this.facade.updateProduct(this.productId!, product)
      : this.facade.createProduct(product);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/products']);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  onReset(): void {
    this.form.reset();
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['dateMinToday']) return 'La fecha debe ser igual o mayor a hoy';
    if (control.errors['idExists']) return 'Este ID ya existe';
    return 'Campo inválido';
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required, this.dateMinTodayValidator]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  private setupDateRevisionAutoCalc(): void {
    this.form.get('date_release')?.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe((dateRelease: string) => {
      if (dateRelease) {
        const release = new Date(dateRelease);
        release.setFullYear(release.getFullYear() + 1);
        const revision = release.toISOString().split('T')[0];
        this.form.get('date_revision')?.setValue(revision);
      }
    });
  }

  private loadProduct(id: string): void {
    this.facade.loadProductById(id).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (product) => {
        this.form.patchValue(product);
        this.form.get('id')?.disable();
      },
      error: () => {
        this.router.navigate(['/products']);
      },
    });
  }

  private dateMinTodayValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(control.value);
    return date >= today ? null : { dateMinToday: true };
  }

  /**
   * Validador asíncrono con RxJS avanzado:
   * - debounceTime(500): Espera 500ms para no saturar el backend en cada tecla
   * - switchMap: Cancela la verificación anterior si el usuario sigue escribiendo
   *   (evita race conditions donde una respuesta lenta sobrescribe una rápida)
   */
  setupIdAsyncValidator(): void {
    if (this.isEditMode) return;

    const idControl = this.form.get('id');
    if (!idControl) return;

    idControl.setAsyncValidators((control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(value => this.facade.verifyId(value)),
        map((exists: boolean) => (exists ? { idExists: true } : null))
      );
    });

    idControl.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
