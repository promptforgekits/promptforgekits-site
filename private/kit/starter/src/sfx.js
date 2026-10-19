// Tiny sound effects generated with the Web Audio API (no audio files needed).
// The ON/OFF switch lives in audio.js (Options menu, and M during play); it is saved with storage.js.
// Add a sound: one new line here, then call sfx.name() where it happens in a scene.
import { beep } from './audio.js';

export const sfx = {
  jump: () => beep(300, 0.12, { slideTo: 600, vol: 0.12 }),
  coin: () => beep(880, 0.1, { type: 'triangle', slideTo: 1320, vol: 0.12 }),
  hurt: () => beep(400, 0.4, { type: 'sawtooth', slideTo: 60, vol: 0.12 }),
  win: () => { beep(523, 0.12, { vol: 0.08 }); beep(659, 0.12, { vol: 0.08, delay: 0.1 }); beep(784, 0.2, { vol: 0.08, delay: 0.2 }); },
};
