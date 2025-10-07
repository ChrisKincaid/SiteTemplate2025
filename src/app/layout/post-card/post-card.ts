import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AudioPlayerComponent } from '../../components/audio-player/audio-player.component';
import { AudioPlayerService } from '../../services/audio-player.service';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, AudioPlayerComponent],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css'
})
export class PostCard {
  @Input() postData: any;
  Math = Math; // Make Math available in template

  constructor(
    private router: Router,
    private audioPlayerService: AudioPlayerService
  ) {}

  onCardClick() {
    if (this.postData?.id) {
      this.router.navigate(['/post', this.postData.id]);
    }
  }

  // Check if post has audio
  hasAudio(): boolean {
    return this.postData?.data?.media?.type === 'audio' && 
           this.postData?.data?.media?.audio?.previewUrl;
  }

  // Get audio URL for playback
  getAudioUrl(): string | null {
    if (this.hasAudio()) {
      return this.postData.data.media.audio.previewUrl;
    }
    return null;
  }

  // Get audio title
  getAudioTitle(): string {
    if (this.hasAudio()) {
      const title = this.postData.data.media.audio.title || 'Audio Track';
      console.log('🎵 PostCard getAudioTitle:', title, 'Full audio data:', this.postData.data.media.audio);
      return title;
    }
    return '';
  }

  // Handle volume change from side volume control
  onVolumeChange(event: any): void {
    event.stopPropagation();
    const volume = parseFloat(event.target.value);
    console.log('🎵 PostCard volume change:', volume);
    this.audioPlayerService.setVolume(volume);
  }

  // Get current volume from audio service
  getCurrentVolume(): number {
    return this.audioPlayerService.getCurrentState().volume;
  }
}
