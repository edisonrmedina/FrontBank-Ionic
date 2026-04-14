import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SRP: Solo se encarga de mostrar un modal de confirmación y emitir la acción.
 * OCP: Se puede reutilizar para cualquier confirmación cambiando los inputs.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()" data-testid="modal-overlay">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="onCancel()" data-testid="btn-close">✕</button>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-confirm" (click)="onConfirm()" data-testid="btn-confirm">Confirmar</button>
          <button class="btn btn-cancel" (click)="onCancel()" data-testid="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: #fff;
      border-radius: 16px 16px 0 0;
      padding: 24px 20px;
      width: 100%;
      max-width: 480px;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 18px;
      color: #999;
      cursor: pointer;
    }

    .modal-message {
      font-size: 15px;
      color: #333;
      text-align: center;
      margin: 8px 0 24px;
      padding: 0 20px;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn {
      width: 100%;
      padding: 14px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }

    .btn-confirm {
      background: #ffc107;
      color: #1a1a2e;
      border: none;
    }

    .btn-cancel {
      background: #fff;
      color: #1a1a2e;
      border: 1px solid #ddd;
    }
  `],
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() message = '¿Está seguro?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
