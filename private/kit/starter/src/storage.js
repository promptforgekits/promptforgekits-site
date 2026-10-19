// Safe save helper. localStorage/sessionStorage can throw (private browsing, sandboxed iframes on
// Poki / CrazyGames, storage disabled). Every call is wrapped in try/catch and falls back to memory,
// so the game keeps playing (progress just isn't kept after the tab closes).
const memory = { local: new Map(), session: new Map() };

function make(kind, name) {
  const mem = memory[kind];
  const real = () => { try { return window[name]; } catch { return null; } }; // even touching it can throw
  return {
    get(key, fallback = null) {
      try { const v = real().getItem(key); if (v !== null && v !== undefined) return v; } catch { /* blocked */ }
      return mem.has(key) ? mem.get(key) : fallback;
    },
    set(key, value) {
      const s = String(value);
      mem.set(key, s);
      try { real().setItem(key, s); } catch { /* blocked: memory copy is enough */ }
    },
    remove(key) {
      mem.delete(key);
      try { real().removeItem(key); } catch { /* blocked */ }
    },
    getNumber(key, fallback = 0) { const n = Number(this.get(key)); return Number.isFinite(n) && this.get(key) !== null ? n : fallback; },
    getJSON(key, fallback = null) { try { const v = this.get(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    setJSON(key, value) { this.set(key, JSON.stringify(value)); },
  };
}

export const storage = make('local', 'localStorage');
export const session = make('session', 'sessionStorage');
