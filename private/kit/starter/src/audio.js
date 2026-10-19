// Sound settings + tiny Web Audio helper, shared by the whole game.
// Two separate switches, both ON by default and saved with storage.js (safe when storage is blocked):
//   Music    -> playMusic(key) / stopMusic()
//   Sound FX -> beep(...) and playSfx(scene, key)
// Browsers keep audio silent until the player clicks, taps or presses a key. The audio context is
// created and resumed INSIDE that first click/tap/key (the only place iPhone Safari allows it), so
// sounds work everywhere. Music asked for before that first gesture starts right after it.
import { storage } from './storage.js';

const SAVE_PREFIX = 'my-game'; // change per game, so two games on one website keep separate settings
const KEYS = { music: SAVE_PREFIX + '-music-on', sfx: SAVE_PREFIX + '-sfx-on' };
const settings = {
  music: storage.get(KEYS.music, '1') !== '0',
  sfx: storage.get(KEYS.sfx, '1') !== '0',
};
const listeners = new Set();

export const isMusicOn = () => settings.music;
export const isSfxOn = () => settings.sfx;
export function setMusicOn(on) {
  settings.music = !!on; storage.set(KEYS.music, on ? '1' : '0');
  if (on) startMusic(); else silenceMusic();
  listeners.forEach((f) => f(settings));
  return settings.music;
}
export function setSfxOn(on) {
  settings.sfx = !!on; storage.set(KEYS.sfx, on ? '1' : '0');
  listeners.forEach((f) => f(settings));
  return settings.sfx;
}
export const toggleMusic = () => setMusicOn(!settings.music);
export const toggleSfx = () => setSfxOn(!settings.sfx);
// onAudioChange(fn): fn({ music, sfx }) after any toggle. Returns an "unsubscribe" function.
export function onAudioChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// ---- audio context: created/resumed on the first user gesture ----
let ctx = null;
let unlocked = false;
const GESTURES = ['pointerdown', 'pointerup', 'mousedown', 'touchstart', 'touchend', 'keydown', 'click'];
function unlock() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state !== 'running') ctx.resume();
    const b = ctx.createBufferSource(); // one silent sample: fully unlocks older iPhones
    b.buffer = ctx.createBuffer(1, 1, 22050); b.connect(ctx.destination); b.start(0);
    if (ctx.state === 'running') onUnlocked();
    else ctx.onstatechange = () => ctx.state === 'running' && onUnlocked();
  } catch (e) { /* audio is optional: never crash the game */ }
}
function onUnlocked() {
  if (unlocked) return;
  unlocked = true;
  GESTURES.forEach((g) => window.removeEventListener(g, unlock, true));
  startMusic();
}
if (typeof window !== 'undefined') GESTURES.forEach((g) => window.addEventListener(g, unlock, true));
// After a tab comes back from the background some browsers suspend audio again: the next gesture fixes it.
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
  if (!document.hidden && ctx && ctx.state !== 'running') {
    unlocked = false; GESTURES.forEach((g) => window.addEventListener(g, unlock, true));
  }
});
export const getAudioContext = () => ctx;           // null until the first click/tap/key
export const isAudioUnlocked = () => unlocked && !!ctx && ctx.state === 'running';

// beep(freq, seconds, { type, vol, slideTo, delay }): one short synth sound effect (no audio files).
export function beep(freq, dur, { type = 'square', vol = 0.08, slideTo = null, delay = 0 } = {}) {
  if (!settings.sfx || !ctx) return false;
  try {
    if (ctx.state !== 'running') { ctx.resume(); return false; }
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
    return true;
  } catch (e) { return false; }
}
// playSfx(scene, key): play a LOADED sound file (this.load.audio in BootScene), respecting the Sound FX switch.
export function playSfx(scene, key, config) {
  if (!settings.sfx || !scene.cache.audio.exists(key)) return false;
  scene.sound.play(key, config); return true;
}

// ---- music ----
// Music volume, under the sound effects (1 = full). Change this one number to make all music louder/quieter.
export const MUSIC_VOLUME = 0.35;
// Three kinds of music plug in here:
//  1) a music FILE that loops with no gap (best):
//       registerMusic('theme', fileMusic(['assets/audio/theme.ogg', 'assets/audio/theme.m4a', 'assets/audio/theme.mp3']))
//       playMusic('theme')
//  2) a file loaded by Phaser: this.load.audio('theme', 'assets/audio/theme.mp3') then playMusic('theme', this)
//  3) synth music: registerMusic('theme', (ctx, out) => { ...start nodes into out...; return () => stop }) then playMusic('theme')
const synthMusic = {};
let wanted = null;   // { key, scene } the game asked for
let current = null;  // { key, stop() } what is actually playing
export function registerMusic(key, start) { synthMusic[key] = start; }
export function playMusic(key, scene = null) {
  if (wanted && wanted.key === key && current) return; // already playing: keep going across scenes
  silenceMusic();
  wanted = { key, scene };
  startMusic();
}
export function stopMusic() { silenceMusic(); wanted = null; }
export const currentMusic = () => (current ? current.key : null);
function startMusic() {
  if (!wanted || current || !settings.music || !isAudioUnlocked()) return;
  const { key, scene } = wanted;
  try {
    if (scene && scene.cache && scene.cache.audio.exists(key)) {
      const snd = scene.sound.add(key, { loop: true, volume: MUSIC_VOLUME });
      snd.play();
      current = { key, stop: () => { snd.stop(); snd.destroy(); } };
    } else if (synthMusic[key]) {
      const out = ctx.createGain(); out.gain.value = MUSIC_VOLUME; out.connect(ctx.destination);
      const stop = synthMusic[key](ctx, out);
      current = { key, stop: () => { try { if (typeof stop === 'function') stop(); } finally { out.disconnect(); } } };
    }
  } catch (e) { current = null; }
}
function silenceMusic() { if (current) { try { current.stop(); } catch (e) { /* ignore */ } current = null; } }

// fileMusic(urls, { loopEnd }): music from a file, played with Web Audio so it loops with no gap.
// List the same song in several formats, best first. The first one this browser can play is used:
// .ogg loops perfectly; older iPhones/Macs (Safari before 18.4) can't play .ogg and get .m4a; .mp3 is the last resort.
// The file is downloaded when the page loads but only plays after the first click / tap / key.
// loopEnd (seconds, optional): exact song length, so encoder padding at the end of an .m4a/.mp3 never adds a gap.
const MIME = { ogg: 'audio/ogg; codecs="vorbis"', oga: 'audio/ogg', opus: 'audio/ogg; codecs="opus"', webm: 'audio/webm',
  m4a: 'audio/mp4; codecs="mp4a.40.2"', mp4: 'audio/mp4', aac: 'audio/aac', mp3: 'audio/mpeg', wav: 'audio/wav' };
function canPlay(url) {
  try {
    const type = MIME[String(url).split(/[?#]/)[0].split('.').pop().toLowerCase()];
    return !type || document.createElement('audio').canPlayType(type) !== '';
  } catch (e) { return true; }
}
export function fileMusic(urls, { loopEnd = 0 } = {}) {
  const list = [].concat(urls).filter(canPlay);
  const download = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); });
  const early = typeof fetch === 'function' && list.length ? download(list[0]).catch(() => null) : Promise.resolve(null);
  const decode = (c, data) => new Promise((ok, fail) => { // callback form too: older Safari has no promise version
    try { const p = c.decodeAudioData(data, ok, fail); if (p && p.then) p.then(ok, fail); } catch (e) { fail(e); }
  });
  let loading = null;
  const load = async (c) => {
    for (let i = 0; i < list.length; i++) {
      try { const data = (i === 0 && (await early)) || (await download(list[i])); return await decode(c, data); }
      catch (e) { /* this format failed: try the next one */ }
    }
    return null;
  };
  return (c, out) => {
    let stopped = false; let src = null;
    if (!loading) loading = load(c).then((b) => { if (!b) loading = null; return b; });
    loading.then((buffer) => {
      if (stopped || !buffer) return;
      src = c.createBufferSource(); src.buffer = buffer; src.loop = true;
      if (loopEnd > 0 && loopEnd < buffer.duration) { src.loopStart = 0; src.loopEnd = loopEnd; }
      src.connect(out); src.start();
    });
    return () => { stopped = true; if (src) { try { src.stop(); } catch (e) { /* ignore */ } src.disconnect(); src = null; } };
  };
}

// Test hook: window.__audio lets automated tests read the switches and count sounds.
if (typeof window !== 'undefined') window.__audio = { isMusicOn, isSfxOn, toggleMusic, toggleSfx, getAudioContext, currentMusic, registerMusic, playMusic, stopMusic, isAudioUnlocked, fileMusic, MUSIC_VOLUME };
