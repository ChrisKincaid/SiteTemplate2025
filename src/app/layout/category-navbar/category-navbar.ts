import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class CategoryNavbar implements OnInit {

  categoryArray: Array<any> = [];

  constructor( 
    private categoryService: Categories,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.categoryService.loadData().subscribe({
      next: (val) => {
        this.categoryArray = val;
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onCategoryClick(category: any) {
    this.router.navigate(['/category', category.id]);
  }

}
