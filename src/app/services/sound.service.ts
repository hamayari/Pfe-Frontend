import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    // Sons simples générés programmatiquement au lieu de base64 cassé
    try {
      // Créer un son de notification simple
      const sampleRate = 44100;
      const duration = 0.1; // 100ms
      const samples = sampleRate * duration;
      
      const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Générer un bip simple
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.3;
      }
      
      this.sounds.set('reaction', buffer);
      this.sounds.set('message', buffer);
      this.sounds.set('notification', buffer);
      this.sounds.set('success', buffer);
      
    } catch (error) {
      console.warn('Failed to generate sounds, using fallback:', error);
      // Fallback : pas de sons
      this.isEnabled = false;
    }
  }

  playSound(soundName: string, volume: number = 0.3) {
    if (!this.isEnabled || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.get(soundName)!;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  playReactionSound() {
    this.playSound('reaction', 0.2);
  }

  playMessageSound() {
    this.playSound('message', 0.15);
  }

  playNotificationSound() {
    this.playSound('notification', 0.25);
  }

  playSuccessSound() {
    this.playSound('success', 0.3);
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }
}
