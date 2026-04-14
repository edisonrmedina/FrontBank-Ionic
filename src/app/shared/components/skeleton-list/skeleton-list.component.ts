import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SRP: Solo se encarga de mostrar un skeleton placeholder mientras se carga data.
 */
@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <div class="skeleton-row" *ngFor="let item of skeletonItems">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-line long"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container { padding: 8px 0; }

    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-text { flex: 1; }

    .skeleton-line {
      height: 12px;
      border-radius: 4px;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 6px;
    }

    .skeleton-line.long { width: 80%; }
    .skeleton-line.short { width: 50%; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `],
})
export class SkeletonListComponent {
  @Input() rows = 5;

  get skeletonItems(): number[] {
    return Array.from({ length: this.rows });
  }
}
