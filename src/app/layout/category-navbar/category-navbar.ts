import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Categories } from '../../services/categories';
import { UserAuthComponent } from '../../components/user-auth/user-auth.component';

@Component({
  selector: 'app-category-navbar',
  imports: [CommonModule, UserAuthComponent],
  templateUrl: './category-navbar.html',
  styleUrl: './category-navbar.css'
})
export class CategoryNavbar implements OnInit, AfterViewInit {

  categoryArray: Array<any> = [];
  showHamburger: boolean = false;

  constructor( 
    private categoryService: Categories,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.categoryService.loadData().subscribe({
      next: (val) => {
        this.categoryArray = val;
        // Force change detection
        this.cdr.detectChanges();
        // Check layout after categories load
        setTimeout(() => this.checkLayout(), 100);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  ngAfterViewInit() {
    // Initial layout check
    this.checkLayout();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkLayout();
  }

  private checkLayout() {
    // Check if categories and profile button would overlap
    const navbar = this.elementRef.nativeElement.querySelector('.navbar-nav');
    const categoriesContainer = this.elementRef.nativeElement.querySelector('.categories-container');
    const profileContainer = this.elementRef.nativeElement.querySelector('.profile-container');
    
    if (navbar && categoriesContainer && profileContainer) {
      const navbarWidth = navbar.offsetWidth;
      const categoriesWidth = categoriesContainer.offsetWidth;
      const profileWidth = profileContainer.offsetWidth;
      
      // Add some buffer space (50px) to prevent crowding
      const totalNeededWidth = categoriesWidth + profileWidth + 50;
      
      this.showHamburger = totalNeededWidth > navbarWidth;
      this.cdr.detectChanges();
    }
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onCategoryClick(category: any) {
    this.router.navigate(['/category', category.id]);
  }

}
