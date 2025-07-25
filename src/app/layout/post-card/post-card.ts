import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCard {
  @Input() postData: any;

  constructor(private router: Router) {}

  onCardClick() {
    if (this.postData?.id) {
      this.router.navigate(['/post', this.postData.id]);
    }
  }
}
