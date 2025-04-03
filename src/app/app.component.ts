import { JsonPipe } from '@angular/common';
import { Component, signal, effect, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Visit } from './models/visit.model';
import { TrackService } from './services/track.service';

interface ComparisonResult {
  [key: string]: {
    old: any;
    new: any;
  };
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'json-compare-app';
  private destroyRef = inject(DestroyRef);
  currentYear = signal<number>(new Date().getFullYear());

  // Using signals for reactive state management
  json1 = signal<string>('');
  json2 = signal<string>('');
  result = signal<ComparisonResult | null>(null);
  error = signal<string | null>(null);
  darkMode = signal<boolean>(false);

  private trackService = inject(TrackService);

  // Visitor count state
  visitorCount = signal<number>(0);
  isVisitorCountLoading = signal<boolean>(false);
  visitorCountError = signal<string | null>(null);

  // Make JSON available to the template
  readonly JSON = JSON;

  constructor() {
    // Apply the theme whenever darkMode changes - this is the proper way to use effect()
    effect(() => {
      this.applyTheme(this.darkMode());
    });
  }

  ngOnInit(): void {
    this.trackVisit();
    // Check if user has a stored preference
    const storedThemePreference = localStorage.getItem('darkMode');

    // Check if user prefers dark mode in their OS settings
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Set initial theme based on stored preference or OS preference
    if (storedThemePreference !== null) {
      this.darkMode.set(storedThemePreference === 'true');
    } else {
      this.darkMode.set(prefersDarkMode);
    }

    // Listen for changes to user's system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only change if user hasn't explicitly set a preference
      if (!localStorage.getItem('darkMode')) {
        this.darkMode.set(e.matches);
      }
    };

    // Modern approach using addEventListener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up when component is destroyed
    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  }

  private trackVisit(): void {
    this.isVisitorCountLoading.set(true);
    this.visitorCountError.set(null);

    this.trackService.trackProjectVisit(this.title).subscribe({
      next: (response: Visit) => {
        this.visitorCount.set(response.uniqueVisitors);
        this.isVisitorCountLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Failed to track visit:', err);
        this.visitorCountError.set('Failed to load visitor count');
        this.isVisitorCountLoading.set(false);
      },
    });
  }

  toggleTheme(): void {
    const newMode = !this.darkMode();
    this.darkMode.set(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  }

  applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updateJson1(value: string): void {
    this.json1.set(value);
    this.error.set(null);
  }

  updateJson2(value: string): void {
    this.json2.set(value);
    this.error.set(null);
  }

  formatJson1(): void {
    try {
      const parsed = JSON.parse(this.json1());
      this.json1.set(JSON.stringify(parsed, null, 2));
      this.error.set(null);
    } catch (e) {
      this.error.set('Invalid JSON in Source field! Unable to format.');
    }
  }

  formatJson2(): void {
    try {
      const parsed = JSON.parse(this.json2());
      this.json2.set(JSON.stringify(parsed, null, 2));
      this.error.set(null);
    } catch (e) {
      this.error.set('Invalid JSON in Target field! Unable to format.');
    }
  }

  compareJSON(): void {
    try {
      const obj1 = JSON.parse(this.json1());
      const obj2 = JSON.parse(this.json2());
      this.result.set(this.diff(obj1, obj2));
      this.error.set(null);
    } catch (e) {
      this.error.set('Invalid JSON! Please check your input.');
      this.result.set(null);
    }
  }

  diff(obj1: any, obj2: any): ComparisonResult {
    const changes: ComparisonResult = {};

    // First pass: check keys in obj1
    for (const key of Object.keys(obj1)) {
      if (!obj2.hasOwnProperty(key)) {
        changes[key] = { old: obj1[key], new: 'Removed' };
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        // Check if both values are objects and not arrays
        if (
          typeof obj1[key] === 'object' &&
          typeof obj2[key] === 'object' &&
          !Array.isArray(obj1[key]) &&
          !Array.isArray(obj2[key]) &&
          obj1[key] !== null &&
          obj2[key] !== null
        ) {
          // Recursive diff for nested objects
          const nestedDiff = this.diff(obj1[key], obj2[key]);
          if (Object.keys(nestedDiff).length > 0) {
            changes[key] = { old: obj1[key], new: obj2[key] };
          }
        } else {
          changes[key] = { old: obj1[key], new: obj2[key] };
        }
      }
    }

    // Second pass: find keys in obj2 that aren't in obj1
    for (const key of Object.keys(obj2)) {
      if (!obj1.hasOwnProperty(key)) {
        changes[key] = { old: 'Added', new: obj2[key] };
      }
    }

    return changes;
  }

  clearCompare(): void {
    this.json1.set('');
    this.json2.set('');
    this.result.set(null);
    this.error.set(null);
  }

  onTextareaInput1(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.updateJson1(value);
  }

  onTextareaInput2(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.updateJson2(value);
  }
}
