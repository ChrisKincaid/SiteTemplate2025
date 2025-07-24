import { Component, OnInit } from '@angular/core';
import { PostCard } from '../../layout/post-card/post-card';
import { Posts } from '../../services/posts';

@Component({
  selector: 'app-home',
  imports: [PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  postsArray: any[] = [];

  constructor(private postService: Posts) { }

  ngOnInit() {
    this.postService.loadData().subscribe({
      next: (val: any) => {
        console.log('Posts loaded:', val);
        this.postsArray = val;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

}
