/**
 * Professional Enterprise CRM Audio & Alert Sound Engine
 * Dilip Enterprises TMS & CRM Platform
 * 
 * Delivers zero-latency, high-impact acoustic feedback across all user actions:
 * 1. Deep Alert: 85-140Hz sub-bass punch with resonant gong harmonics for owner/high alerts.
 * 2. Action Success: Upward melodic chime (C5-E5-G5) on save, task create, lead convert.
 * 3. Status Change: 2-tone energetic pulse on task/kanban status transitions.
 * 4. Warning & Delete: Descending cautionary tone on deletions and complaints.
 * 5. Micro Action Click: Subtle 8ms tactile feedback on button presses, tabs, and filters.
 * 6. Bulk Action Pulse: 3-step rapid chime on multi-select batch updates.
 */

// Global AudioContext Singleton
let globalAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Persistent User Preferences
const SOUND_ENABLED_KEY = 'dilip_crm_sound_enabled';
const SOUND_VOLUME_KEY = 'dilip_crm_sound_volume';
const ACTION_CLICKS_KEY = 'dilip_crm_action_clicks_enabled';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(SOUND_ENABLED_KEY);
  return saved === null ? true : saved === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    unlockAudioContext();
  }
}

export function getMasterVolume(): number {
  if (typeof window === 'undefined') return 0.9;
  const saved = localStorage.getItem(SOUND_VOLUME_KEY);
  if (!saved) return 0.9;
  const num = parseFloat(saved);
  return isNaN(num) ? 0.9 : Math.max(0.1, Math.min(1.0, num));
}

export function setMasterVolume(vol: number): void {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0.1, Math.min(1.0, vol));
  localStorage.setItem(SOUND_VOLUME_KEY, clamped.toString());
}

export function isActionClicksEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(ACTION_CLICKS_KEY);
  return saved === null ? true : saved === 'true';
}

export function setActionClicksEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTION_CLICKS_KEY, enabled ? 'true' : 'false');
}

/**
 * Initializes and resumes AudioContext safely across all browser environments
 */
export function getAudioContext(): AudioContext | null {
  try {
    if (!globalAudioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioCtx = new AudioContextClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (err) {
    console.warn('AudioContext initialization notice:', err);
    return null;
  }
}

/**
 * Ensures the Web Audio API is unlocked on user interaction (clicks, touches, keys)
 */
export function unlockAudioContext(): boolean {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      isAudioUnlocked = true;
      return true;
    }
  } catch (e) {
    console.warn('Could not unlock audio context:', e);
  }
  return false;
}

export function isAudioContextUnlocked(): boolean {
  if (!globalAudioCtx) return false;
  return globalAudioCtx.state === 'running';
}

// Global auto-unlock listeners on standard user gestures
if (typeof window !== 'undefined') {
  const handleGesture = () => {
    unlockAudioContext();
  };
  window.addEventListener('pointerdown', handleGesture, { passive: true });
  window.addEventListener('keydown', handleGesture, { passive: true });
  window.addEventListener('touchstart', handleGesture, { passive: true });
  window.addEventListener('click', handleGesture, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      unlockAudioContext();
    }
  });
}

/**
 * High-performance, self-contained WAV audio fallback generator for Deep Alert
 */
let cachedWavDataUri: string | null = null;
function getAlertWavDataUri(): string {
  if (cachedWavDataUri) return cachedWavDataUri;
  try {
    const sampleRate = 22050;
    const duration = 1.1;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const env1 = Math.min(1, t / 0.015) * Math.exp(-t * 3.5);
      const f1 = 120 * Math.exp(-t * 0.25);
      const strike1 =
        Math.sin(2 * Math.PI * f1 * t) * 0.65 +
        Math.sin(2 * Math.PI * (f1 * 1.5) * t) * 0.35 +
        Math.sin(2 * Math.PI * 240 * t) * 0.4 +
        Math.sin(2 * Math.PI * 360 * t) * 0.3;

      let strike2 = 0;
      if (t >= 0.24) {
        const t2 = t - 0.24;
        const env2 = Math.min(1, t2 / 0.012) * Math.exp(-t2 * 4.2);
        const f2 = 105 * Math.exp(-t2 * 0.2);
        strike2 =
          env2 *
          (Math.sin(2 * Math.PI * f2 * t2) * 0.7 +
            Math.sin(2 * Math.PI * (f2 * 2) * t2) * 0.4 +
            Math.sin(2 * Math.PI * 315 * t2) * 0.35);
      }

      const combined = strike1 * env1 + strike2;
      const val = Math.max(-0.99, Math.min(0.99, combined * 1.35));
      const intSample = val < 0 ? val * 0x8000 : val * 0x7fff;
      view.setInt16(44 + i * 2, intSample, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    cachedWavDataUri = `data:audio/wav;base64,${btoa(binary)}`;
    return cachedWavDataUri;
  } catch (err) {
    console.warn('WAV Data URI generation warning:', err);
    return '';
  }
}

// -------------------------------------------------------------------------------- //
// 1. LOUD DEEP SOUND ALERT
// -------------------------------------------------------------------------------- //
/**
 * Authoritative Deep Alert Sound (Gong Chime & Sub-Bass Punch)
 * Triggered on Owner Alerts, New Project Notifications, and High-Priority Task actions.
 */
export function playOwnerDeepAlertSound(): void {
  if (!isSoundEnabled()) return;

  // 1. Instant HTMLAudio Fallback (guarantees sound even if AudioContext was in cold state)
  try {
    const uri = getAlertWavDataUri();
    if (uri && typeof window !== 'undefined') {
      const audio = new Audio(uri);
      audio.volume = getMasterVolume();
      const p = audio.play();
      if (p) {
        p.catch(() => {});
      }
    }
  } catch {}

  // 2. High-Fidelity Web Audio API Resonant Gong Synthesis
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playSynthesis = () => {
      try {
        const volume = getMasterVolume();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-14, ctx.currentTime);
        compressor.knee.setValueAtTime(8, ctx.currentTime);
        compressor.ratio.setValueAtTime(12, ctx.currentTime);
        compressor.attack.setValueAtTime(0.002, ctx.currentTime);
        compressor.release.setValueAtTime(0.22, ctx.currentTime);
        compressor.connect(ctx.destination);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(1.3 * volume, ctx.currentTime);
        masterGain.connect(compressor);

        const playDeepStrike = (
          baseFreq: number,
          harmonicFreq: number,
          startTime: number,
          duration: number
        ) => {
          // Punchy sub-bass oscillator
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(baseFreq, startTime);
          subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.76, startTime + duration);

          subGain.gain.setValueAtTime(0.001, startTime);
          subGain.gain.exponentialRampToValueAtTime(1.0, startTime + 0.015);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          subOsc.connect(subGain);
          subGain.connect(masterGain);
          subOsc.start(startTime);
          subOsc.stop(startTime + duration);

          // Acoustic warm body oscillator
          const midOsc = ctx.createOscillator();
          const midGain = ctx.createGain();
          midOsc.type = 'triangle';
          midOsc.frequency.setValueAtTime(baseFreq * 1.5, startTime);
          midOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, startTime + duration * 0.8);

          midGain.gain.setValueAtTime(0.001, startTime);
          midGain.gain.exponentialRampToValueAtTime(0.85, startTime + 0.02);
          midGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

          midOsc.connect(midGain);
          midGain.connect(masterGain);
          midOsc.start(startTime);
          midOsc.stop(startTime + duration);

          // Penetrating resonant gong chime
          const gongOsc = ctx.createOscillator();
          const gongGain = ctx.createGain();
          gongOsc.type = 'sine';
          gongOsc.frequency.setValueAtTime(harmonicFreq, startTime);

          gongGain.gain.setValueAtTime(0.001, startTime);
          gongGain.gain.exponentialRampToValueAtTime(0.75, startTime + 0.01);
          gongGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);

          gongOsc.connect(gongGain);
          gongGain.connect(masterGain);
          gongOsc.start(startTime);
          gongOsc.stop(startTime + duration);
        };

        const now = ctx.currentTime;
        // Strike 1: Heavy deep gong (120Hz fundamental + 360Hz chime)
        playDeepStrike(120, 360, now, 0.55);

        // Strike 2: Second deep authoritative boom at +0.24s
        playDeepStrike(100, 300, now + 0.24, 0.75);

        // Strike 3: Sustained deep reverberation ping at +0.50s
        playDeepStrike(90, 270, now + 0.5, 0.85);
      } catch (e) {
        console.warn('WebAudio deep alert execution notice:', e);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(playSynthesis).catch(() => {});
    } else {
      playSynthesis();
    }
  } catch (err) {
    console.warn('Deep alert sound trigger notice:', err);
  }
}

// -------------------------------------------------------------------------------- //
// 2. ACTION SUCCESS SOUND
// -------------------------------------------------------------------------------- //
/**
 * Modern, uplifting 3-note melodic acoustic chime (C5 -> E5 -> G5)
 * Triggered when a project is saved, new task created, lead converted, or PDF/Excel exported.
 */
export function playSuccessSound(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const play = () => {
      try {
        const volume = getMasterVolume();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const stepTime = 0.08;

        notes.forEach((freq, idx) => {
          const startTime = now + idx * stepTime;
          const duration = 0.35;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.45 * volume, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          // Subtle overtone for sparkle
          const overtone = ctx.createOscillator();
          const overtoneGain = ctx.createGain();
          overtone.type = 'triangle';
          overtone.frequency.setValueAtTime(freq * 2, startTime);
          overtoneGain.gain.setValueAtTime(0.001, startTime);
          overtoneGain.gain.exponentialRampToValueAtTime(0.12 * volume, startTime + 0.01);
          overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          overtone.connect(overtoneGain);
          overtoneGain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
          overtone.start(startTime);
          overtone.stop(startTime + duration * 0.6);
        });
      } catch (e) {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {
    console.warn('Success sound notice:', err);
  }
}

// -------------------------------------------------------------------------------- //
// 3. TASK STATUS CHANGE SOUND
// -------------------------------------------------------------------------------- //
/**
 * Punchy 2-tone acoustic pulse (440Hz -> 587Hz / A4 -> D5)
 * Triggered on task status updates, Kanban card movement, and stage advancements.
 */
export function playStatusChangeSound(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const play = () => {
      try {
        const volume = getMasterVolume();
        const now = ctx.currentTime;
        const freqs = [440, 587.33];
        const step = 0.09;

        freqs.forEach((f, i) => {
          const t = now + i * step;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = i === 1 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.55 * volume, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.28);
        });
      } catch (e) {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {
    console.warn('Status change sound notice:', err);
  }
}

// -------------------------------------------------------------------------------- //
// 4. WARNING & DELETION ALERT
// -------------------------------------------------------------------------------- //
/**
 * Descending 2-tone cautionary note (520Hz -> 330Hz)
 * Triggered on task deletion, user removal, complaint tickets, or destructive warnings.
 */
export function playWarningSound(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const play = () => {
      try {
        const volume = getMasterVolume();
        const now = ctx.currentTime;
        const freqs = [520, 330];
        const step = 0.12;

        freqs.forEach((f, i) => {
          const t = now + i * step;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, t);

          // Low pass filter to warm up the sawtooth
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(900, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.38 * volume, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.32);
        });
      } catch (e) {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {
    console.warn('Warning sound notice:', err);
  }
}

// -------------------------------------------------------------------------------- //
// 5. MICRO ACTION CLICK
// -------------------------------------------------------------------------------- //
/**
 * Ultra-subtle, clean tactile micro-click (1200Hz 10ms acoustic blip)
 * Triggered on tab switches, filter selections, modal toggles, and UI interactions.
 */
export function playActionClickSound(): void {
  if (!isSoundEnabled() || !isActionClicksEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const play = () => {
      try {
        const volume = getMasterVolume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.014);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18 * volume, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.015);
      } catch (e) {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {}
}

// -------------------------------------------------------------------------------- //
// 6. BULK ACTION PULSE
// -------------------------------------------------------------------------------- //
/**
 * 3-step rapid cascading pulse on bulk status changes, mass reassigns, and batch operations.
 */
export function playBulkActionSound(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const play = () => {
      try {
        const volume = getMasterVolume();
        const now = ctx.currentTime;
        const freqs = [392.0, 523.25, 659.25]; // G4, C5, E5
        const step = 0.06;

        freqs.forEach((f, i) => {
          const t = now + i * step;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.exponentialRampToValueAtTime(0.48 * volume, t + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.22);
        });
      } catch (e) {}
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (err) {}
}

// Aliases for compatibility
export const playDeepAlertSound = playOwnerDeepAlertSound;
export const playOwnerLoudAlertBeep = playOwnerDeepAlertSound;
export const playLoudNotificationBeep = playOwnerDeepAlertSound;
