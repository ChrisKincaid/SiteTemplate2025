import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerService, AudioState } from '../../services/audio-player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  @Input() audioUrl!: string;
  @Input() postId!: string;
  @Input() trackTitle?: string;

  Math = Math; // Make Math available in template

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

  private subscription?: Subscription;

  constructor(
    private audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.audioPlayerService.audioState$.subscribe(
      state => {
        console.log(`🎵 [${this.postId}] AudioState updated:`, state);
        this.audioState = state;
        this.cdr.detectChanges(); // Force change detection
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get isCurrentTrack(): boolean {
    return this.audioPlayerService.isCurrentTrack(this.postId);
  }

  togglePlay(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log('🎵 Toggle play clicked');
    this.audioPlayerService.play(this.audioUrl, this.postId, this.trackTitle);
  }

  stop(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    console.log('🎵 Stop clicked');
    this.audioPlayerService.stop();
  }

  seekTo(event: any): void {
    event.stopPropagation();
    const time = parseFloat(event.target.value);
    this.audioPlayerService.seekTo(time);
  }

  setVolume(event: any): void {
    event.stopPropagation();
    const volume = parseFloat(event.target.value);
    this.audioPlayerService.setVolume(volume);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // New single button toggle method
  togglePlayStop(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (this.isCurrentTrack && this.audioState.isPlaying) {
      // If this track is playing, stop it
      console.log('🎵 Stop clicked');
      this.audioPlayerService.stop();
    } else {
      // If not playing (or different track), start playing
      console.log('🎵 Play clicked - trackTitle:', this.trackTitle);
      this.audioPlayerService.play(this.audioUrl, this.postId, this.trackTitle);
    }
  }

  // Debug methods to understand what's happening
  shouldShowLoading(): boolean {
    const result = this.audioState.loading && this.isCurrentTrack;
    console.log(`🎵 [${this.postId}] shouldShowLoading:`, result, {
      loading: this.audioState.loading,
      isCurrentTrack: this.isCurrentTrack
    });
    return result;
  }

  shouldShowPlay(): boolean {
    // Show play button if:
    // 1. This track is NOT the current track (regardless of loading state)
    // 2. OR this IS the current track but not playing and not loading
    const result = !this.isCurrentTrack || (!this.audioState.isPlaying && !this.audioState.loading);
    console.log(`🎵 [${this.postId}] shouldShowPlay:`, result, {
      loading: this.audioState.loading,
      isCurrentTrack: this.isCurrentTrack,
      isPlaying: this.audioState.isPlaying,
      currentPostId: this.audioState.currentPostId
    });
    return result;
  }

  shouldShowPause(): boolean {
    const result = this.isCurrentTrack && this.audioState.isPlaying && !this.audioState.loading;
    console.log(`🎵 [${this.postId}] shouldShowPause:`, result, {
      loading: this.audioState.loading,
      isCurrentTrack: this.isCurrentTrack,
      isPlaying: this.audioState.isPlaying
    });
    return result;
  }

  shouldShowStop(): boolean {
    // Show stop button when this track is currently playing
    const result = this.isCurrentTrack && this.audioState.isPlaying && !this.audioState.loading;
    console.log(`🎵 [${this.postId}] shouldShowStop:`, result, {
      loading: this.audioState.loading,
      isCurrentTrack: this.isCurrentTrack,
      isPlaying: this.audioState.isPlaying,
      allConditions: `isCurrentTrack: ${this.isCurrentTrack}, isPlaying: ${this.audioState.isPlaying}, notLoading: ${!this.audioState.loading}`
    });
    return result;
  }

  shouldShowVolumeControl(): boolean {
    const result = this.isCurrentTrack;
    console.log(`🎵 [${this.postId}] shouldShowVolumeControl:`, result, {
      isCurrentTrack: this.isCurrentTrack,
      currentPostId: this.audioState.currentPostId
    });
    return result;
  }
}