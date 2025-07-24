import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categories } from '../../services/categories';

@Component({
  selector: 'app-category-navbar',
  imports: [CommonModule],
  templateUrl: './category-navbar.html',
  styleUrl: './category-navbar.css'
})
export class CategoryNavbar implements OnInit {

  categoryArray: Array<any> = [];

  constructor( 
    private categoryService: Categories,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('CategoryNavbar ngOnInit called');
    this.categoryService.loadData().subscribe({
      next: (val) => {
        console.log('Categories loaded:', val);
        console.log('Number of categories:', val?.length);
        console.log('First category structure:', JSON.stringify(val[0], null, 2));
        this.categoryArray = val;
        console.log('categoryArray after assignment:', this.categoryArray);
        // Force change detection
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

}
