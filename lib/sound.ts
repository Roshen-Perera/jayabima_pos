/**
 * Audio feedback utility for POS system using Web Audio API.
 * Synthesizes crisp, authentic barcode scanner beep tones without relying on external audio files.
 */

const STORAGE_KEY = "pos_sound_muted";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
      // Ignored if browser blocks resume without active gesture
    });
  }

  return audioCtx;
}

// Pre-warm the AudioContext on first user interaction anywhere
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };

  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
}

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("pos_sound_change", { detail: { muted } })
    );
  } catch {
    // localStorage unavailable
  }
}

export function toggleSoundMuted(): boolean {
  const next = !isSoundMuted();
  setSoundMuted(next);
  return next;
}

/**
 * Plays the authentic high-pitch barcode scanner beep when an item is added to cart.
 * Frequency: 2050 Hz (standard Honeywell / Zebra / Symbol scanner tone)
 * Duration: ~80ms with clean attack and decay envelopes
 */
export function playPosBeep(volume: number = 0.25): void {
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Standard POS barcode scanner tone: crisp 2050Hz sine
    osc.type = "sine";
    osc.frequency.setValueAtTime(2050, now);

    // Smooth envelope: 4ms attack, sustain, exponential release to prevent clicking
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.004);
    gain.gain.setValueAtTime(volume, now + 0.065);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // cleanup ignore
      }
    };
  } catch (err) {
    console.debug("Unable to play POS beep sound:", err);
  }
}

/**
 * Plays a double low-tone error buzz when a barcode/SKU scan fails.
 */
export function playErrorBeep(): void {
  if (isSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const tones = [
      { start: 0, duration: 0.07 },
      { start: 0.1, duration: 0.07 },
    ];

    tones.forEach(({ start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(320, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // cleanup ignore
        }
      };
    });
  } catch (err) {
    console.debug("Unable to play POS error sound:", err);
  }
}
