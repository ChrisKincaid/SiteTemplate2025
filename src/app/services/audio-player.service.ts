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
  floatingPlayerVisible: boolean;
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
    loading: false,
    floatingPlayerVisible: false
  });

  public audioState$: Observable<AudioState> = this.audioStateSubject.asObservable();

  constructor() {
    console.log('🎵 AudioPlayerService constructor called at:', new Date().toISOString());
    this.initializeAudio();
    
    // Delay localStorage restoration to avoid hydration conflicts
    setTimeout(() => {
      this.restoreFromLocalStorage();
    }, 100);
  }

  private saveToLocalStorage(): void {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const state = this.audioStateSubject.value;
      if (state.currentTrack) {
        const stateToSave = {
          currentTrack: state.currentTrack,
          currentPostId: state.currentPostId,
          currentTrackTitle: state.currentTrackTitle,
          currentTime: state.currentTime,
          duration: state.duration,
          volume: state.volume,
          isPlaying: state.isPlaying
        };
        localStorage.setItem('audioPlayerState', JSON.stringify(stateToSave));
        console.log('🎵 Saved audio state to localStorage:', stateToSave);
      } else {
        // Clear localStorage if no track
        localStorage.removeItem('audioPlayerState');
      }
    } catch (error) {
      console.error('Error saving audio state to localStorage:', error);
    }
  }

  private restoreFromLocalStorage(): void {
    try {
      // Check if we're in the browser (not during SSR)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const savedState = localStorage.getItem('audioPlayerState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('🎵 Restoring audio state from localStorage:', parsedState);
        
        // Load the audio file first
        if (this.audio && parsedState.currentTrack) {
          this.audio.src = parsedState.currentTrack;
          this.audio.load();
          
          // Set the time when metadata loads
          this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio && parsedState.currentTime) {
              this.audio.currentTime = parsedState.currentTime;
              console.log('🎵 Audio restored to position:', parsedState.currentTime);
            }
          }, { once: true });
        }

        // Restore state - always start paused due to browser autoplay policy
        this.updateState({
          ...parsedState,
          isPlaying: false, // Always start paused due to browser policy
          loading: false,
          floatingPlayerVisible: true
        });
        
        // Log a helpful message for the user
        if (parsedState.isPlaying) {
          console.log('🎵 Audio restored! Click the play button to resume from', Math.floor(parsedState.currentTime), 'seconds');
        }
      }
    } catch (error) {
      console.error('Error restoring audio state from localStorage:', error);
    }
  }

  private initializeAudio(): void {
    console.log('🎵 AudioPlayerService.initializeAudio() called');
    this.audio = new Audio();
    this.audio.volume = 0.7;
    this.audio.preload = 'metadata';
    
    // Audio event listeners with detailed logging
    this.audio.addEventListener('loadstart', () => {
      console.log('🎵 Audio event: loadstart');
      this.updateState({ loading: true });
    });

    this.audio.addEventListener('play', () => {
      console.log('🎵 Audio event: play - Audio started playing');
    });

    this.audio.addEventListener('pause', () => {
      console.log('🎵 Audio event: pause - Audio was paused');
      console.trace('🎵 Stack trace for audio pause:');
    });

    this.audio.addEventListener('ended', () => {
      console.log('🎵 Audio event: ended - Audio finished playing');
    });
    
    this.audio.addEventListener('canplay', () => {
      this.updateState({ loading: false });
    });
    
    this.audio.addEventListener('loadedmetadata', () => {
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
      this.stop();
    });
    
    this.audio.addEventListener('error', (e) => {
      this.updateState({ 
        loading: false, 
        isPlaying: false 
      });
    });
    
    this.audio.addEventListener('abort', () => {
      this.updateState({ loading: false });
    });
  }

  async play(audioUrl: string, postId: string, trackTitle?: string): Promise<void> {
    console.log('🎵 AudioPlayerService.play() called with:', { audioUrl: audioUrl.substring(0, 50) + '...', postId, trackTitle });
    if (!this.audio) return;

    const currentState = this.audioStateSubject.value;
    
    // If same track is playing, pause it
    if (currentState.isPlaying && currentState.currentPostId === postId) {
      console.log('🎵 Same track playing, pausing...');
      this.pause();
      return;
    }

    // Stop any currently playing audio
    if (currentState.isPlaying) {
      console.log('🎵 Different track playing, stopping current...');
      this.stop();
    }

    try {
      const finalTrackTitle = trackTitle || 'Audio Track';
      
      this.updateState({ 
        loading: true, 
        currentTrack: audioUrl, 
        currentPostId: postId,
        currentTrackTitle: finalTrackTitle,
        isPlaying: false
      });

      this.audio.src = audioUrl;
      this.audio.volume = currentState.volume; // Ensure volume is maintained
      this.audio.load(); // Explicitly load the audio
      
      await this.audio.play();
      
      this.updateState({ 
        isPlaying: true, 
        loading: false,
        floatingPlayerVisible: true
      });
    } catch (error) {
      this.updateState({ 
        loading: false, 
        isPlaying: false,
        currentTrack: null,
        currentPostId: null
      });
    }
  }

  pause(): void {
    console.log('🎵 AudioPlayerService.pause() called');
    console.trace('🎵 Stack trace for pause() call:');
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = ''; // Clear the source
      localStorage.removeItem('audioPlayerState'); // Clear persisted state
      this.updateState({
        isPlaying: false,
        currentTrack: null,
        currentPostId: null,
        currentTrackTitle: null,
        currentTime: 0,
        duration: 0,
        loading: false,
        floatingPlayerVisible: false
      });
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audio.volume = clampedVolume;
      this.updateState({ volume: this.audio.volume });
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
    
    // Log when currentTrack is being cleared
    if (partialState.currentTrack === null && currentState.currentTrack !== null) {
      console.log('🎵 AudioPlayerService: currentTrack being cleared!');
      console.log('🎵 Previous state:', currentState);
      console.log('🎵 Update being applied:', partialState);
      console.trace('🎵 Stack trace for currentTrack clearing:');
    }
    
    // Log all state updates for debugging
    if (partialState.currentTrack || currentState.currentTrack) {
      console.log('🎵 State update:', {
        from: currentState.currentTrack ? 'HAS_TRACK' : 'NO_TRACK',
        to: newState.currentTrack ? 'HAS_TRACK' : 'NO_TRACK',
        playing: newState.isPlaying,
        url: newState.currentTrack?.substring(0, 50) + '...'
      });
    }
    
    // Use setTimeout to prevent ExpressionChangedAfterItHasBeenChecked errors
    setTimeout(() => {
      this.audioStateSubject.next(newState);
      this.saveToLocalStorage();
    }, 0);
  }

  getCurrentState(): AudioState {
    return this.audioStateSubject.value;
  }

  isCurrentTrack(postId: string): boolean {
    const currentPostId = this.audioStateSubject.value.currentPostId;
    return currentPostId === postId;
  }

  resume(): void {
    if (this.audio && this.audioStateSubject.value.currentTrack) {
      this.audio.play().then(() => {
        this.updateState({ isPlaying: true });
      }).catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
  }



  // Methods to manage floating player visibility
  setFloatingPlayerVisible(visible: boolean): void {
    this.updateState({ floatingPlayerVisible: visible });
  }

  isFloatingPlayerVisible(): boolean {
    return this.audioStateSubject.value.floatingPlayerVisible;
  }



}