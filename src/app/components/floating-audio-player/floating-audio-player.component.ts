import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AudioPlayerService, AudioState } from '../../services/audio-player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-floating-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-audio-player.component.html',
  styleUrl: './floating-audio-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingAudioPlayerComponent implements OnInit, OnDestroy {
  audioState: AudioState = {
    isPlaying: false,
    currentTrack: null,
    currentPostId: null,
    currentTrackTitle: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    loading: false
  };

  isMinimized = true;
  isVisible = false;
  Math = Math;

  private subscription?: Subscription;

  constructor(
    private audioPlayerService: AudioPlayerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.audioPlayerService.audioState$.subscribe(
      state => {
        console.log('🎵 [FloatingPlayer] AudioState received:', state);
        this.audioState = state;
        const shouldBeVisible = !!(state.currentTrack && state.currentPostId);
        
        // If player is becoming visible for the first time, show it expanded
        if (!this.isVisible && shouldBeVisible) {
          this.isMinimized = false; // Start expanded when first appearing
        }
        
        this.isVisible = shouldBeVisible;
        console.log('🎵 [FloatingPlayer] isVisible:', this.isVisible, 'loading:', state.loading, 'isPlaying:', state.isPlaying);
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  togglePlay(): void {
    if (this.audioState.isPlaying) {
      this.audioPlayerService.pause();
    } else if (this.audioState.currentTrack) {
      this.audioPlayerService.play(this.audioState.currentTrack, this.audioState.currentPostId || '');
    }
  }

  stop(): void {
    this.audioPlayerService.stop();
  }

  setVolume(event: any): void {
    const volume = parseFloat(event.target.value);
    this.audioPlayerService.setVolume(volume);
  }

  seekTo(event: any): void {
    const time = parseFloat(event.target.value);
    this.audioPlayerService.seekTo(time);
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  goToPost(): void {
    if (this.audioState.currentPostId) {
      this.router.navigate(['/post', this.audioState.currentPostId]);
    }
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getCurrentTrackTitle(): string {
    return this.audioState.currentTrackTitle || 'Audio Track';
  }
}