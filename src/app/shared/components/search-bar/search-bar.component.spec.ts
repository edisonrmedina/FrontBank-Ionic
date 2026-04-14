import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an input with placeholder', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Search...');
  });

  it('should emit searchChanged on input', () => {
    spyOn(component.searchChanged, 'emit');

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Tarjeta';
    input.dispatchEvent(new Event('input'));

    expect(component.searchChanged.emit).toHaveBeenCalledWith('tarjeta');
  });

  it('should emit empty string for whitespace-only input', () => {
    spyOn(component.searchChanged, 'emit');

    const input = fixture.nativeElement.querySelector('input');
    input.value = '   ';
    input.dispatchEvent(new Event('input'));

    expect(component.searchChanged.emit).toHaveBeenCalledWith('');
  });

  it('should trim and lowercase the emitted value', () => {
    spyOn(component.searchChanged, 'emit');

    const input = fixture.nativeElement.querySelector('input');
    input.value = '  HELLO World  ';
    input.dispatchEvent(new Event('input'));

    expect(component.searchChanged.emit).toHaveBeenCalledWith('hello world');
  });

  it('should have data-testid attribute', () => {
    const input = fixture.nativeElement.querySelector('[data-testid="search-bar"]');
    expect(input).toBeTruthy();
  });
});
