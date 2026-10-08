// =============================================================
// sound.js — BGM と効果音（Web Audio でファミコン風の音をつくる。音声ファイルなし）
// ブラウザの決まりで、最初のクリックかキー入力のあとから鳴る。
// =============================================================
const Sound = (() => {
  const MUTE_KEY = 'carbonrpg-mute';
  let ac = null, master = null, bgmGain = null;
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* 何もしない */ }

  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function freq(n) {
    const m = /^([A-G][#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  }

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.22; master.connect(ac.destination);
    bgmGain = ac.createGain(); bgmGain.gain.value = 0.55; bgmGain.connect(master);
    if (pending) { const p = pending; pending = null; bgm(p); }
  }

  function tone(f, t, dur, { type = 'square', vol = 0.25, slide = 0, out = master } = {}) {
    if (!ac || !f) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol = 0.2) {
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(), g = ac.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(master); s.start(t);
  }
  const seq = (notes, step, opt) => { const t0 = ac.currentTime; notes.forEach((n, i) => n && tone(freq(n), t0 + i * step, step * 1.6, opt)); };

  // ---- 効果音 ----
  const SE = {
    blip: () => tone(1320, ac.currentTime, 0.05, { vol: 0.12 }),
    ok: () => seq(['C6', 'E6', 'G6', 'C7'], 0.06, { vol: 0.18 }),
    ng: () => { tone(220, ac.currentTime, 0.32, { type: 'sawtooth', vol: 0.18, slide: 0.5 }); },
    hit: () => { noise(ac.currentTime, 0.12, 0.25); tone(180, ac.currentTime, 0.12, { vol: 0.2, slide: 0.4 }); },
    hurt: () => { noise(ac.currentTime, 0.25, 0.3); tone(120, ac.currentTime, 0.25, { type: 'triangle', vol: 0.3, slide: 0.5 }); },
    chest: () => seq(['G5', 'C6', 'E6', 'G6', null, 'C7'], 0.07, { vol: 0.16 }),
    coin: () => seq(['B5', 'E6'], 0.06, { vol: 0.16 }),
    level: () => seq(['C5', 'E5', 'G5', 'C6', null, 'G5', 'C6', 'E6', 'G6'], 0.08, { vol: 0.18 }),
    encounter: () => { const t = ac.currentTime; for (let i = 0; i < 6; i++) tone(880 - i * 90, t + i * 0.04, 0.05, { vol: 0.12 }); },
    transform: () => { const t = ac.currentTime; tone(110, t, 0.9, { type: 'sawtooth', vol: 0.2, slide: 4 }); noise(t + 0.6, 0.4, 0.2); },
    heal: () => seq(['E6', 'G6', 'B6', 'E7'], 0.07, { type: 'triangle', vol: 0.2 }),
    win: () => seq(['G5', 'G5', 'G5', 'C6', null, null, 'B5', 'C6'], 0.11, { vol: 0.18 }),
    lose: () => seq(['E5', 'D5', 'C5', 'B4', 'A4'], 0.18, { type: 'triangle', vol: 0.22 }),
    clear: () => seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', null, 'E6', 'G6', 'C7'], 0.12, { vol: 0.18 }),
  };
  function se(name) { if (ac && !muted && SE[name]) SE[name](); }

  // ---- BGM（8 分音符の並び。'.' は休符） ----
  const T = s => s.trim().split(/\s+/).map(x => x === '.' ? null : x);
  const TRACKS = {
    town: { bpm: 104, lead: T(`
      E5 . G5 . C6 . G5 .  A5 . G5 . E5 . D5 .  C5 . E5 . G5 . A5 .  G5 . . . . . . .
      F5 . A5 . C6 . A5 .  G5 . E5 . C5 . D5 .  E5 . D5 . C5 . B4 .  C5 . . . . . . .`),
      bass: T(`
      C3 . G3 . C3 . G3 .  F3 . C4 . F3 . C4 .  A2 . E3 . A2 . E3 .  G2 . D3 . G2 . D3 .
      F2 . C3 . F2 . C3 .  C3 . G3 . C3 . G3 .  G2 . D3 . G2 . B2 .  C3 . G3 . C3 . . .`) },
    forest: { bpm: 88, lead: T(`
      A4 . C5 . E5 . D5 .  C5 . B4 . A4 . . .  F4 . A4 . C5 . B4 .  G#4 . . . E4 . . .
      A4 . C5 . E5 . G5 .  F5 . E5 . D5 . . .  C5 . B4 . A4 . G#4 .  A4 . . . . . . .`),
      bass: T(`
      A2 . . . E3 . . .  F2 . . . C3 . . .  D2 . . . A2 . . .  E2 . . . B2 . . .
      A2 . . . E3 . . .  D2 . . . A2 . . .  E2 . . . E2 . . .  A2 . . . E3 . . .`) },
    port: { bpm: 112, lead: T(`
      D5 . F#5 A5 . F#5 D5 .  E5 . G5 B5 . G5 E5 .  F#5 . A5 D6 . A5 F#5 .  E5 . C#5 E5 . . . .
      D5 . F#5 A5 . B5 A5 .  G5 . E5 G5 . F#5 E5 .  D5 . E5 F#5 . E5 C#5 .  D5 . . . . . . .`),
      bass: T(`
      D3 . A3 . D3 . A3 .  E3 . B3 . E3 . B3 .  D3 . A3 . D3 . A3 .  A2 . E3 . A2 . E3 .
      D3 . A3 . G3 . D3 .  E3 . B3 . A2 . E3 .  B2 . F#3 . A2 . E3 .  D3 . A3 . D3 . . .`) },
    night: { bpm: 76, lead: T(`
      B4 . . D5 . . F#5 .  E5 . . D5 . . C#5 .  B4 . . . . . . .  A4 . . C#5 . . E5 .
      D5 . . C#5 . . B4 .  A4 . . F#4 . . . .  G4 . . B4 . . A#4 .  B4 . . . . . . .`),
      bass: T(`
      B2 . . . F#3 . . .  G2 . . . D3 . . .  B2 . . . F#3 . . .  A2 . . . E3 . . .
      G2 . . . D3 . . .  D2 . . . A2 . . .  E2 . . . F#2 . . .  B1 . . . F#2 . . .`) },
    // 第 3 章：芳香族の王国（おごそかで、少し古風）
    kingdom: { bpm: 96, lead: T(`
      G5 . D5 . G5 . B5 .  A5 . G5 . F#5 . E5 .  D5 . E5 . F#5 . G5 .  A5 . . . . . . .
      B5 . A5 . G5 . E5 .  C6 . B5 . A5 . F#5 .  G5 . A5 . B5 . D5 .  G5 . . . . . . .`),
      bass: T(`
      G2 . D3 . G3 . D3 .  C3 . G3 . C3 . G3 .  B2 . F#3 . B2 . F#3 .  D3 . A3 . D3 . A3 .
      E3 . B3 . E3 . B3 .  A2 . E3 . D3 . A3 .  C3 . G3 . D3 . A3 .  G2 . D3 . G2 . . .`) },
    // 光の塔（止まらない連鎖のように、せき立てる）
    tower: { bpm: 132, lead: T(`
      E5 . B4 . E5 F5 E5 .  D5 . A4 . D5 Eb5 D5 .  C5 . G4 . C5 D5 Eb5 .  D5 . . . B4 . . .`),
      bass: T(`
      E2 E2 E3 E2 E2 E2 E3 E2  D2 D2 D3 D2 D2 D2 D3 D2  C2 C2 C3 C2 C2 C2 C3 C2  B1 B1 B2 B1 B1 B1 B2 B1`) },
    battle: { bpm: 152, lead: T(`
      E5 E5 G5 E5 B5 . A5 G5  F#5 F#5 A5 F#5 D6 . B5 A5  E5 E5 G5 E5 B5 . C6 B5  A5 G5 F#5 D5 E5 . . .`),
      bass: T(`
      E2 E3 E2 E3 E2 E3 E2 E3  D2 D3 D2 D3 D2 D3 D2 D3  C2 C3 C2 C3 C2 C3 C2 C3  B1 B2 B1 B2 B1 B2 B1 B2`) },
    boss: { bpm: 164, lead: T(`
      D5 . F5 D5 G#5 . A5 .  D5 . F5 D5 C#6 . A5 .  Bb5 . A5 G5 F5 . E5 .  F5 E5 D5 C#5 D5 . . .`),
      bass: T(`
      D2 D3 D2 D3 D2 D3 D2 D3  D2 D3 D2 D3 D2 D3 D2 D3  Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2  A1 A2 A1 A2 A1 A2 A1 A2`) },
  };

  let current = null, pending = null, stepI = 0, nextT = 0, timer = null;
  function schedule() {
    if (!ac || !current) return;
    const tr = TRACKS[current], dt = 60 / tr.bpm / 2;
    while (nextT < ac.currentTime + 0.25) {
      const n = tr.lead[stepI % tr.lead.length], b = tr.bass[stepI % tr.bass.length];
      if (n) tone(freq(n), nextT, dt * 0.9, { vol: 0.13, out: bgmGain });
      if (b) tone(freq(b), nextT, dt * 0.95, { type: 'triangle', vol: 0.3, out: bgmGain });
      nextT += dt; stepI++;
    }
  }
  function bgm(name) {
    if (!ac) { pending = name; return; }
    if (current === name) return;
    current = name;
    if (timer) { clearInterval(timer); timer = null; }
    if (!name) return;
    stepI = 0; nextT = ac.currentTime + 0.05;
    timer = setInterval(schedule, 60);
    schedule();
  }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (e) { /* 何もしない */ }
    if (master) master.gain.value = m ? 0 : 0.22;
  }

  return { init, se, bgm, setMuted, isMuted: () => muted, TRACKS };
})();
