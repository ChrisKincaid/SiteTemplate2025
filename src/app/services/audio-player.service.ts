import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AudioState {
  isPlaying: boolean;
  currentTrack: string | null;
  currentPostId: string | null;
  currentTrackTitle: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  
  private audioStateSubject = new BehaviorSubject<AudioState>({
    isPlaying: false,
    currentTrack: null,
    currentPostId: null,
    currentTrackTitle: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    loading: false
  });

  public audioState$: Observable<AudioState> = this.audioStateSubject.asObservable();

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.volume = 0.7;
    this.audio.preload = 'metadata';
    
    // Audio event listeners
    this.audio.addEventListener('loadstart', () => {
      console.log('🎵 Audio loadstart');
      this.updateState({ loading: true });
    });
    
    this.audio.addEventListener('canplay', () => {
      console.log('🎵 Audio canplay');
      this.updateState({ loading: false });
    });
    
    this.audio.addEventListener('loadedmetadata', () => {
      console.log('🎵 Audio metadata loaded');
      this.updateState({ 
        duration: this.audio?.duration || 0,
        loading: false 
      });
    });
    
    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ 
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0
      });
    });
    
    this.audio.addEventListener('ended', () => {
      console.log('🎵 Audio ended');
      this.stop();
    });
    
    this.audio.addEventListener('error', (e) => {
      console.error('🎵 Audio playback error:', e);
      this.updateState({ 
        loading: false, 
        isPlaying: false 
      });
    });
    
    this.audio.addEventListener('abort', () => {
      console.log('🎵 Audio aborted');
      this.updateState({ loading: false });
    });
  }

  async play(audioUrl: string, postId: string, trackTitle?: string): Promise<void> {
    if (!this.audio) return;

    const currentState = this.audioStateSubject.value;
    
    console.log('🎵 Play requested for:', postId, audioUrl);
    
    // If same track is playing, pause it
    if (currentState.isPlaying && currentState.currentPostId === postId) {
      console.log('🎵 Same track playing, pausing...');
      this.pause();
      return;
    }

    // Stop any currently playing audio
    if (currentState.isPlaying) {
      console.log('🎵 Stopping current track...');
      this.stop();
    }

    try {
      const finalTrackTitle = trackTitle || 'Audio Track';
      console.log('🎵 AudioService play() - trackTitle received:', trackTitle, 'using:', finalTrackTitle);
      
      this.updateState({ 
        loading: true, 
        currentTrack: audioUrl, 
        currentPostId: postId,
        currentTrackTitle: finalTrackTitle,
        isPlaying: false
      });

      console.log('🎵 Setting audio source:', audioUrl);
      this.audio.src = audioUrl;
      this.audio.volume = currentState.volume; // Ensure volume is maintained
      this.audio.load(); // Explicitly load the audio
      
      console.log('🎵 Attempting to play...');
      await this.audio.play();
      
      console.log('🎵 Play successful');
      this.updateState({ 
        isPlaying: true, 
        loading: false 
      });
      console.log('🎵 Updated state after successful play:', this.audioStateSubject.value);
    } catch (error) {
      console.error('🎵 Error playing audio:', error);
      this.updateState({ 
        loading: false, 
        isPlaying: false,
        currentTrack: null,
        currentPostId: null
      });
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    }
  }

  stop(): void {
    console.log('🎵 Stop requested');
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = ''; // Clear the source
      this.updateState({
        isPlaying: false,
        currentTrack: null,
        currentPostId: null,
        currentTrackTitle: null,
        currentTime: 0,
        duration: 0,
        loading: false
      });
      console.log('🎵 Audio stopped');
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audio.volume = clampedVolume;
      console.log('🎵 Volume set to:', clampedVolume, 'Audio element volume:', this.audio.volume);
      this.updateState({ volume: this.audio.volume });
    } else {
      console.log('🎵 No audio element to set volume on');
    }
  }

  seekTo(time: number): void {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, time));
    }
  }

  private updateState(partialState: Partial<AudioState>): void {
    const currentState = this.audioStateSubject.value;
    const newState = { ...currentState, ...partialState };
    
    // Use setTimeout to prevent ExpressionChangedAfterItHasBeenChecked errors
    setTimeout(() => {
      this.audioStateSubject.next(newState);
      console.log('🎵 AudioState updated:', newState);
    }, 0);
  }

  getCurrentState(): AudioState {
    return this.audioStateSubject.value;
  }

  isCurrentTrack(postId: string): boolean {
    const currentPostId = this.audioStateSubject.value.currentPostId;
    const result = currentPostId === postId;
    console.log(`🔍 [Service] isCurrentTrack check:`, {
      postId,
      currentPostId,
      result,
      comparison: `"${currentPostId}" === "${postId}"`
    });
    return result;
  }
}