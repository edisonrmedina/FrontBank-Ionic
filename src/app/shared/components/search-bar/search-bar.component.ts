import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * SRP: Solo se encarga de capturar y emitir el término de búsqueda.
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        class="search-input"
        placeholder="Search..."
        (input)="onSearch($event)"
        data-testid="search-bar"
      />
    </div>
  `,
  styles: [`
    .search-container {
      padding: 16px 0;
    }

    .search-input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      background: #fff;
      box-sizing: border-box;
      outline: none;
    }

    .search-input::placeholder {
      color: #aaa;
    }

    .search-input:focus {
      border-color: #999;
    }
  `],
})
export class SearchBarComponent {
  @Output() searchChanged = new EventEmitter<string>();

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value?.toLowerCase().trim() || '';
    this.searchChanged.emit(value);
  }
}
