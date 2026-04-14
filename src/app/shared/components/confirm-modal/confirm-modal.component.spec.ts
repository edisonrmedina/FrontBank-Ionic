import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should render when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should display the message', () => {
    component.isOpen = true;
    component.message = '¿Eliminar producto X?';
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.modal-message');
    expect(message.textContent).toContain('¿Eliminar producto X?');
  });

  it('should emit confirmed when confirm button clicked', () => {
    spyOn(component.confirmed, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="btn-confirm"]');
    btn.click();

    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit cancelled when cancel button clicked', () => {
    spyOn(component.cancelled, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="btn-cancel"]');
    btn.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit cancelled when close button clicked', () => {
    spyOn(component.cancelled, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="btn-close"]');
    btn.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit cancelled when overlay clicked', () => {
    spyOn(component.cancelled, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('[data-testid="modal-overlay"]');
    overlay.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should have default message', () => {
    expect(component.message).toBe('¿Está seguro?');
  });
});
