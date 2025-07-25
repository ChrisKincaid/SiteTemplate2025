import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PostCard } from '../../layout/post-card/post-card';
import { Posts } from '../../services/posts';
import { Categories } from '../../services/categories';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-category',
  imports: [CommonModule, PostCard],
  templateUrl: './single-category.html',
  styleUrl: './single-category.css'
})
export class SingleCategory implements OnInit, OnDestroy {
  
  categoryId: string = '';
  categoryName: string = 'Loading...';
  subcategoryName: string = ''; // Add subcategory support
  isSubcategoryMode: boolean = false; // Track if we're showing subcategory
  postsArray: any[] = [];
  categoryPosts: any[] = [];
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: Posts,
    private categoryService: Categories,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Check if this is a subcategory route
    if (this.route.snapshot.url[1]?.path === 'subcategory') {
      this.isSubcategoryMode = true;
      this.route.queryParams.subscribe(params => {
        this.subcategoryName = params['name'] || '';
        this.categoryName = this.subcategoryName;
        this.loadSubcategoryPosts();
      });
    } else {
      // Regular category mode
      this.isSubcategoryMode = false;
      this.route.paramMap.subscribe(params => {
        this.categoryId = params.get('id') || '';
        this.loadCategoryData();
        this.loadCategoryPosts();
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadCategoryData() {
    this.categoryService.loadData().subscribe({
      next: (categories: any) => {
        const category = categories.find((cat: any) => cat.id === this.categoryId);
        this.categoryName = category?.data?.category || 'Category Not Found';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.categoryName = 'Category Not Found';
      }
    });
  }

  loadCategoryPosts() {
    this.subscription = this.postService.loadData().subscribe({
      next: (posts: any) => {
        // Filter posts that belong to this category
        this.categoryPosts = posts.filter((post: any) => 
          post.data.category.categoryId === this.categoryId
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  loadSubcategoryPosts() {
    this.subscription = this.postService.loadData().subscribe({
      next: (posts: any) => {
        // Filter posts that contain this subcategory
        this.categoryPosts = posts.filter((post: any) => 
          post.data.subcategories && 
          post.data.subcategories.includes(this.subcategoryName)
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subcategory posts:', error);
      }
    });
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }
}
