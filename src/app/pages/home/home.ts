import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCard } from '../../layout/post-card/post-card';
import { Posts } from '../../services/posts';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  postsArray: any[] = [];
  featuredPosts: any[] = [];
  latestPosts: any[] = [];

  constructor(private postService: Posts) { }

  ngOnInit() {
    this.postService.loadData().subscribe({
      next: (val: any) => {
        console.log('Posts loaded:', val);
        this.postsArray = val;
        
        // Filter featured posts
        this.featuredPosts = val.filter((post: any) => post.data.isFeatured === true);
        
        // Get latest posts (non-featured, sorted by creation date)
        this.latestPosts = val
          .filter((post: any) => post.data.isFeatured !== true)
          .sort((a: any, b: any) => b.data.createdAt.seconds - a.data.createdAt.seconds);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

}
