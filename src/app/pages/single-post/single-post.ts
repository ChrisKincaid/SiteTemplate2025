import { Component } from '@angular/core';
import { PostCard } from '../../layout/post-card/post-card';
import { CommentForm } from '../../comments/comment-form/comment-form';
import { CommentList } from '../../comments/comment-list/comment-list';

@Component({
  selector: 'app-single-post',
  imports: [PostCard, CommentForm, CommentList], 
  templateUrl: './single-post.html',
  styleUrl: './single-post.css'
})
export class SinglePost {
 
}
