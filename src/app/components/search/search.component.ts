import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  isExpanded = false;
  isDropdownOpen = false;
  activeTab: 'search' | 'advanced' = 'search';
  
  // Basic search
  searchTerm = '';
  
  // Advanced search
  author = '';
  subcategory = '';
  dateRangeStart = '';
  dateRangeEnd = '';
  sortBy: 'relevance' | 'mostPopular' | 'newest' | 'oldest' = 'relevance';
  
  // Data
  authors: string[] = [];
  subcategories: string[] = [];
  
  private searchService = inject(SearchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Load authors for dropdown
    this.searchService.getAuthors().subscribe(authors => {
      this.authors = authors;
      this.cdr.detectChanges();
    });

    // Load subcategories for dropdown
    this.searchService.getSubcategories().subscribe(subcategories => {
      this.subcategories = subcategories;
      this.cdr.detectChanges();
    });
  }

  toggleSearch() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.isDropdownOpen = true;
      this.activeTab = 'search';
    } else {
      this.isDropdownOpen = false;
      this.resetForm();
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
    this.isExpanded = false;
    this.resetForm();
  }

  switchTab(tab: 'search' | 'advanced') {
    this.activeTab = tab;
  }

  performBasicSearch() {
    if (!this.searchTerm.trim()) return;
    
    const searchParams = new URLSearchParams();
    searchParams.set('q', this.searchTerm);
    
    this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
    this.closeDropdown();
  }

  performAdvancedSearch() {
    // For advanced search, allow search without search term if other filters are provided
    const hasFilters = this.author || this.subcategory || this.dateRangeStart || this.dateRangeEnd;
    
    if (!this.searchTerm.trim() && !hasFilters) {
      return; // Need at least a search term OR some filters
    }

    const queryParams: any = {};
    
    // Only add search term if it exists
    if (this.searchTerm.trim()) {
      queryParams.q = this.searchTerm;
    }
    
    if (this.author) {
      queryParams.author = this.author;
    }
    
    if (this.subcategory) {
      queryParams.subcategory = this.subcategory;
    }
    
    if (this.dateRangeStart) {
      queryParams.dateStart = this.dateRangeStart;
    }
    
    if (this.dateRangeEnd) {
      queryParams.dateEnd = this.dateRangeEnd;
    }
    
    if (this.sortBy !== 'relevance') {
      queryParams.sort = this.sortBy;
    }

    this.router.navigate(['/search'], { queryParams });
    this.closeDropdown();
  }

  private resetForm() {
    this.searchTerm = '';
    this.author = '';
    this.subcategory = '';
    this.dateRangeStart = '';
    this.dateRangeEnd = '';
    this.sortBy = 'relevance';
    this.activeTab = 'search';
  }

  // Handle click outside to close dropdown
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-container');
    if (!searchContainer) {
      this.closeDropdown();
    }
  }

  // Check if advanced search can be performed
  get canPerformAdvancedSearch(): boolean {
    const hasSearchTerm = this.searchTerm.trim().length > 0;
    const hasFilters = !!(this.author || this.subcategory || this.dateRangeStart || this.dateRangeEnd);
    return hasSearchTerm || hasFilters;
  }
}
