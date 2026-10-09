// =============================================================
// sprites.js — タイルとキャラクターをコードだけで描く（画像ファイルなし）
// 1 タイル = 16×16 の「ドット」。s はタイルの実寸ピクセル。
// =============================================================
const Sprites = (() => {
  const hash = (x, y, k = 0) => {
    let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  // ドット単位で四角を塗る
  function dot(ctx, ox, oy, s, gx, gy, gw, gh, color) {
    const u = s / 16;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(ox + gx * u), Math.round(oy + gy * u), Math.ceil(gw * u), Math.ceil(gh * u));
  }
  function circle(ctx, ox, oy, s, gx, gy, r, fill, stroke) {
    const u = s / 16;
    ctx.beginPath();
    ctx.arc(ox + gx * u, oy + gy * u, r * u, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, u); ctx.stroke(); }
  }
  function poly(ctx, ox, oy, s, pts, fill, stroke) {
    const u = s / 16;
    ctx.beginPath();
    pts.forEach(([x, y], i) => i ? ctx.lineTo(ox + x * u, oy + y * u) : ctx.moveTo(ox + x * u, oy + y * u));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, u); ctx.stroke(); }
  }

  // ---- タイル --------------------------------------------------
  const GRASS = '#3f8f3f';
  const PATHLIKE = new Set([',', '=', 'D', 'E', 'o', 'Q']);
  const WATERLIKE = new Set(['~', '=', 'p']);
  function grassBase(ctx, x, y, s, tx, ty, base = GRASS) {
    dot(ctx, x, y, s, 0, 0, 16, 16, base);
    for (let i = 0; i < 5; i++) {
      const gx = Math.floor(hash(tx, ty, i) * 15), gy = Math.floor(hash(tx, ty, i + 9) * 15);
      dot(ctx, x, y, s, gx, gy, 1, 1, '#357a36');
    }
  }

  const TILE = {
    '.': (c, x, y, s, tx, ty) => grassBase(c, x, y, s, tx, ty),
    'g': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2f7a35');
      for (let i = 0; i < 6; i++) {
        const gx = 1 + Math.floor(hash(tx, ty, i) * 13), gy = 3 + Math.floor(hash(tx, ty, i + 5) * 9);
        dot(c, x, y, s, gx, gy, 1, 4, '#5cb85c');
        dot(c, x, y, s, gx + 1, gy + 1, 1, 3, '#256b2c');
      }
    },
    ',': (c, x, y, s, tx, ty, nb) => {
      grassBase(c, x, y, s, tx, ty);
      const road = d => PATHLIKE.has(nb(...d));
      const N = road([0, -1]), S = road([0, 1]), W = road([-1, 0]), E = road([1, 0]);
      // 道の本体（つながっていない辺は 2 ドット内側に寄せる）
      const l = W ? 0 : 2, r = E ? 16 : 14, t = N ? 0 : 2, b = S ? 16 : 14;
      dot(c, x, y, s, l, t, r - l, b - t, '#c8a96b');
      // 角を丸める
      if (!N && !W) dot(c, x, y, s, l, t, 1, 1, GRASS);
      if (!N && !E) dot(c, x, y, s, r - 1, t, 1, 1, GRASS);
      if (!S && !W) dot(c, x, y, s, l, b - 1, 1, 1, GRASS);
      if (!S && !E) dot(c, x, y, s, r - 1, b - 1, 1, 1, GRASS);
      // ふちの影と、ところどころの小石
      if (!N) dot(c, x, y, s, l + 1, t, r - l - 2, 1, '#b39457');
      if (!W) dot(c, x, y, s, l, t + 1, 1, b - t - 2, '#b39457');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 3 + Math.floor(hash(tx, ty, i) * 10), 3 + Math.floor(hash(tx, ty, i + 3) * 10), 2, 1, '#a88a50');
      // 草がはみ出したふち
      for (const [side, on] of [['N', !N], ['S', !S], ['W', !W], ['E', !E]]) {
        if (!on) continue;
        for (let i = 0; i < 3; i++) {
          const k = 3 + Math.floor(hash(tx, ty, i + 20 + side.charCodeAt(0)) * 10);
          if (side === 'N') dot(c, x, y, s, k, t, 1, 1, '#4f9d4f');
          if (side === 'S') dot(c, x, y, s, k, b - 1, 1, 1, '#4f9d4f');
          if (side === 'W') dot(c, x, y, s, l, k, 1, 1, '#4f9d4f');
          if (side === 'E') dot(c, x, y, s, r - 1, k, 1, 1, '#4f9d4f');
        }
      }
    },
    'T': (c, x, y, s, tx, ty) => {
      grassBase(c, x, y, s, tx, ty);
      const ox = (hash(tx, ty, 31) - 0.5) * 2, r = 6.3 + hash(tx, ty, 32) * 1.4;
      const dark = hash(tx, ty, 33) < 0.5 ? '#1f5c2b' : '#1b5427';
      dot(c, x, y, s, 7 + ox, 11, 3, 5, '#6b4423');
      circle(c, x, y, s, 8 + ox, 7.2, r, dark);
      circle(c, x, y, s, 6 + ox, 5.4, r * 0.42, '#2e7d3a');
      circle(c, x, y, s, 10.5 + ox, 9, r * 0.25, '#246b31');
    },
    '~': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2f6fbf');
      const o = Math.floor(hash(tx, ty) * 6);
      dot(c, x, y, s, 2 + o, 6, 5, 1, '#7fb2ee');
      dot(c, x, y, s, 8 - o / 2, 11, 5, 1, '#7fb2ee');
      const land = d => !WATERLIKE.has(nb(...d));
      if (land([0, -1])) { dot(c, x, y, s, 0, 0, 16, 2, '#2a5fa6'); dot(c, x, y, s, 0, 2, 16, 1, '#cfe6ff'); }
      if (land([0, 1])) { dot(c, x, y, s, 0, 13, 16, 1, '#cfe6ff'); dot(c, x, y, s, 0, 14, 16, 2, '#5a8a4a'); }
      if (land([-1, 0])) dot(c, x, y, s, 0, 0, 1, 16, '#cfe6ff');
      if (land([1, 0])) dot(c, x, y, s, 15, 0, 1, 16, '#cfe6ff');
    },
    '=': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2f6fbf');
      for (let i = 0; i < 4; i++) { dot(c, x, y, s, 2, i * 4, 12, 3, '#a8763f'); dot(c, x, y, s, 2, i * 4 + 3, 12, 1, '#7a5230'); }
      dot(c, x, y, s, 1, 0, 1, 16, '#5e3d1f'); dot(c, x, y, s, 14, 0, 1, 16, '#5e3d1f');
      for (const yy of [1, 7, 13]) { dot(c, x, y, s, 0, yy, 2, 2, '#4a2f16'); dot(c, x, y, s, 14, yy, 2, 2, '#4a2f16'); }
    },
    'f': (c, x, y, s, tx, ty) => {
      grassBase(c, x, y, s, tx, ty);
      const cols = ['#ff9ecb', '#ffe066', '#ffffff', '#c3a6ff'];
      for (let i = 0; i < 4; i++) {
        const gx = 1 + Math.floor(hash(tx, ty, i) * 12), gy = 1 + Math.floor(hash(tx, ty, i + 4) * 12);
        dot(c, x, y, s, gx, gy, 2, 2, cols[Math.floor(hash(tx, ty, i + 8) * 4)]);
      }
    },
    'm': (c, x, y, s, tx, ty) => {
      grassBase(c, x, y, s, tx, ty, '#4c6b55');
      c.fillStyle = 'rgba(200,205,215,0.35)'; c.fillRect(x, y, s, s);
    },
    'M': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#8d939e');
      circle(c, x, y, s, 5 + hash(tx, ty) * 6, 6, 4, '#b4bac4');
      circle(c, x, y, s, 10, 11, 3.5, '#a3a9b4');
    },
    'r': (c, x, y, s, tx, ty) => {
      grassBase(c, x, y, s, tx, ty);
      circle(c, x, y, s, 8, 9, 6, '#8a8f99');
      circle(c, x, y, s, 6, 7, 2.5, '#a9aeb7');
    },
    '#': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3c4256');
      dot(c, x, y, s, 0, 0, 16, 3, '#555d78');
    },
    '_': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#cfd4de');
      dot(c, x, y, s, 0, 15, 16, 1, '#b5bbc8'); dot(c, x, y, s, 15, 0, 1, 16, '#b5bbc8');
    },
    'B': (c, x, y, s) => {
      TILE['_'](c, x, y, s);
      dot(c, x, y, s, 1, 2, 14, 13, '#6b4a2f');
      dot(c, x, y, s, 2, 3, 12, 11, '#f4f4f4');
      dot(c, x, y, s, 3, 4, 10, 3, '#cfd8ff');
    },
    'S': (c, x, y, s, tx, ty) => {
      TILE['_'](c, x, y, s);
      dot(c, x, y, s, 1, 1, 14, 14, '#7a5230');
      for (let r = 0; r < 3; r++) {
        dot(c, x, y, s, 2, 2 + r * 4.5, 12, 1, '#5a3a1e');
        for (let i = 0; i < 4; i++) {
          const col = ['#79c0ff', '#ff7b72', '#f2cc60', '#7ee787', '#d2a8ff'][Math.floor(hash(tx, ty, r * 4 + i) * 5)];
          dot(c, x, y, s, 2.5 + i * 3, 3 + r * 4.5, 2, 3, col);
        }
      }
    },
    'F': (c, x, y, s) => {
      TILE['_'](c, x, y, s);
      dot(c, x, y, s, 1, 1, 14, 14, '#8b93a3');
      dot(c, x, y, s, 2, 3, 12, 8, '#a8d8f0');
      dot(c, x, y, s, 2, 7, 12, 1, '#6e7686');
      dot(c, x, y, s, 2, 12, 12, 2, '#5d6474');
    },
    'W': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#d9c7a3');
      for (let r = 0; r < 4; r++) dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#b9a47c');
      dot(c, x, y, s, 5, 5, 6, 5, '#7fb2ee'); dot(c, x, y, s, 5, 5, 6, 1, '#5b88c4');
    },
    'R': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#9c3b2f');
      for (let r = 0; r < 4; r++) dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#7a2c22');
    },
    'h': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#a2763f');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, i * 4 + 3, 0, 1, 16, '#80592c');
    },
    'D': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3c4256');
      dot(c, x, y, s, 2, 1, 12, 15, '#7a4b25');
      dot(c, x, y, s, 3, 2, 10, 13, '#94602f');
      dot(c, x, y, s, 11, 9, 1, 2, '#f2cc60');
    },
    'E': (c, x, y, s) => {
      TILE['h'](c, x, y, s);
      dot(c, x, y, s, 3, 3, 10, 13, '#5a3a1e');
      dot(c, x, y, s, 10, 9, 1, 2, '#f2cc60');
    },

    // ---- 第 2 章（港） ----
    'o': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#9a958c');
      for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) {
        const ox = (r % 2) * 4 + k * 8;
        dot(c, x, y, s, ox + 0.5, r * 4 + 0.5, 7, 3, hash(tx * 3 + k, ty * 5 + r) < 0.5 ? '#aaa59b' : '#b3ada2');
      }
    },
    's': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#e3cf9a');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, Math.floor(hash(tx, ty, i) * 15), Math.floor(hash(tx, ty, i + 4) * 15), 1, 1, '#c9b27a');
    },
    'p': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2f6fbf');
      for (let i = 0; i < 4; i++) { dot(c, x, y, s, 0, i * 4, 16, 3, '#a8763f'); dot(c, x, y, s, 0, i * 4 + 3, 16, 1, '#7a5230'); }
      dot(c, x, y, s, 3, 0, 1, 16, '#8a5f33'); dot(c, x, y, s, 12, 0, 1, 16, '#8a5f33');
    },
    'O': (c, x, y, s) => {
      TILE['o'](c, x, y, s, 0, 0);
      circle(c, x, y, s, 8, 8, 7, '#8b93a3', '#555');
      circle(c, x, y, s, 8, 8, 5, '#5fa8e8');
      dot(c, x, y, s, 7, 3, 2, 6, '#cfe6ff');
    },
    'K': (c, x, y, s, tx, ty) => {
      TILE['o'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 6, 14, 9, '#7a5230');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, i * 4, 1, 4, 5, i % 2 ? '#f4f4f4' : '#d9534f');
      const cols = ['#f2cc60', '#7ee787', '#ff9b6a', '#d2a8ff'];
      for (let i = 0; i < 3; i++) circle(c, x, y, s, 4 + i * 4, 9, 1.6, cols[Math.floor(hash(tx, ty, i) * 4)]);
    },
    'G': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#5a4a3a');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, 1 + i * 4, 1, 2, 15, '#8a8f99');
      dot(c, x, y, s, 0, 6, 16, 2, '#6e7686');
    },
    'w': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#6d6a66');
      dot(c, x, y, s, 0, 15, 16, 1, '#5d5a56'); dot(c, x, y, s, 15, 0, 1, 16, '#5d5a56');
      if (hash(tx, ty) < 0.3) dot(c, x, y, s, 4, 6, 3, 1, '#5d5a56');
    },
    'X': (c, x, y, s, tx, ty) => {
      TILE['w'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 2, 14, 13, '#9a6a3a');
      dot(c, x, y, s, 1, 2, 14, 1, '#b98a52'); dot(c, x, y, s, 1, 8, 14, 1, '#6b4423');
      dot(c, x, y, s, 7, 2, 1, 13, '#6b4423');
    },
    'L': (c, x, y, s, tx, ty, nb) => {
      TILE['s'](c, x, y, s, tx, ty);
      const top = nb(0, -1) !== 'L';
      dot(c, x, y, s, 3, 0, 10, 16, '#f4f4f4');
      dot(c, x, y, s, 3, 5, 10, 3, '#d9534f'); dot(c, x, y, s, 3, 12, 10, 3, '#d9534f');
      if (top) { dot(c, x, y, s, 2, 0, 12, 4, '#3c4256'); dot(c, x, y, s, 5, 1, 6, 3, '#ffe066'); }
    },
    '>': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3c3a37');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, 2 + i, 2 + i * 3, 12 - i * 2, 2, i % 2 ? '#7a756e' : '#8f8a82');
    },
    '<': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3c3a37');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, 5 - i, 2 + i * 3, 6 + i * 2, 2, i % 2 ? '#8f8a82' : '#a6a199');
    },
    'c': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#7a2c3a');
      dot(c, x, y, s, 1, 1, 14, 14, '#923a4a');
      dot(c, x, y, s, 7, 7, 2, 2, '#f2cc60');
    },
    'k': (c, x, y, s) => {
      TILE['_'](c, x, y, s);
      dot(c, x, y, s, 1, 4, 14, 9, '#6b4423');
      dot(c, x, y, s, 1, 4, 14, 2, '#8a5f33');
      dot(c, x, y, s, 3, 2, 4, 3, '#f4f4f4'); dot(c, x, y, s, 10, 1, 2, 4, '#2a2a2a');
    },
    'd': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#5a4a3a');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, Math.floor(hash(tx, ty, i) * 15), Math.floor(hash(tx, ty, i + 4) * 15), 2, 1, '#4a3c2e');
    },
    'q': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#8b93a3');
      dot(c, x, y, s, 0, 0, 16, 1, '#a3abba'); dot(c, x, y, s, 0, 0, 1, 16, '#a3abba');
    },
    '|': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#1d2a4a');
      dot(c, x, y, s, 0, 6, 16, 2, '#c9ced8'); dot(c, x, y, s, 0, 12, 16, 2, '#c9ced8');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 1 + i * 6, 6, 2, 10, '#c9ced8');
    },
    'Y': (c, x, y, s) => {
      TILE['q'](c, x, y, s);
      circle(c, x, y, s, 8, 8, 6.5, '#3c4256', '#222');
      circle(c, x, y, s, 8, 8, 4, '#ffe066');
      circle(c, x, y, s, 8, 8, 2, '#fff8c8');
    },

    // ---- 第 3 章（芳香族の王国） ----
    'Z': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#d8d3c4');
      for (let r = 0; r < 4; r++) {
        dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#b7b09d');
        const off = (r + ty) % 2 ? 4 : 10;
        dot(c, x, y, s, off, r * 4, 1, 3, '#b7b09d');
      }
      dot(c, x, y, s, 0, 0, 16, 1, '#ece8dc');
      void tx;
    },
    'Q': (c, x, y, s, tx, ty, nb) => {
      TILE['b'](c, x, y, s, tx, ty);
      const wallL = nb(-1, 0) === 'Z', wallR = nb(1, 0) === 'Z';
      if (wallL) dot(c, x, y, s, 0, 0, 3, 16, '#c9c3b2');
      if (wallR) dot(c, x, y, s, 13, 0, 3, 16, '#c9c3b2');
      if (nb(0, -1) !== 'Q') { dot(c, x, y, s, 0, 0, 16, 3, '#c9c3b2'); for (let i = 0; i < 4; i++) dot(c, x, y, s, 1 + i * 4, 1, 2, 2, '#8a8f99'); }
    },
    'I': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#8d909c');
      for (let r = 0; r < 4; r++) dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#757885');
      if (nb(0, -1) !== 'I' && nb(0, -1) !== 'D') { dot(c, x, y, s, 0, 0, 16, 3, '#3a3d48'); for (let i = 0; i < 4; i++) dot(c, x, y, s, 1 + i * 4, 0, 2, 3, '#a5a8b3'); }
      if ((tx + ty) % 2) { dot(c, x, y, s, 6, 6, 4, 5, '#2a2c36'); dot(c, x, y, s, 7, 7, 2, 3, '#c9a7ff'); }
    },
    'l': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#b49a6a');
      for (let i = 0; i < 3; i++) {
        const gx = Math.floor(hash(tx, ty, i) * 12), gy = Math.floor(hash(tx, ty, i + 3) * 14);
        dot(c, x, y, s, gx, gy, 3, 1, '#957c4f'); dot(c, x, y, s, gx + 2, gy + 1, 1, 1, '#957c4f');
      }
    },
    // 王都の石畳は、六角形の敷石
    'b': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#e3ded0');
      const pts = [...Array(6)].map((_, i) => [8 + 6.2 * Math.cos(i * Math.PI / 3), 8 + 6.2 * Math.sin(i * Math.PI / 3)]);
      poly(c, x, y, s, pts, '#ebe7db', '#cfc8b6');
    },
    // ベンジル通り：環から側鎖が 1 本のびた敷石
    'n': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#bdb5a2');
      const pts = [...Array(6)].map((_, i) => [7 + 5 * Math.cos(i * Math.PI / 3), 8 + 5 * Math.sin(i * Math.PI / 3)]);
      poly(c, x, y, s, pts, '#c8c0ad', '#a39a85');
      dot(c, x, y, s, 12, 7.5, 4, 1, '#a39a85');
    },
    'J': (c, x, y, s) => gate(c, x, y, s, '#3d7dd8', 'o/p'),
    'V': (c, x, y, s) => gate(c, x, y, s, '#c0392b', 'm'),
    'N': (c, x, y, s) => gate(c, x, y, s, '#d4af37', 'p'),
    'i': (c, x, y, s, tx, ty, nb) => {
      TILE['b'](c, x, y, s, tx, ty);
      const vert = nb(0, -1) === 'Z' || nb(0, 1) === 'Z';
      if (vert) { dot(c, x, y, s, 0, 0, 2, 16, '#b7b09d'); dot(c, x, y, s, 14, 0, 2, 16, '#b7b09d'); }
      else { dot(c, x, y, s, 0, 0, 16, 2, '#b7b09d'); dot(c, x, y, s, 0, 14, 16, 2, '#b7b09d'); }
    },
    'U': (c, x, y, s) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3b5c9e');
      for (let r = 0; r < 4; r++) dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#2c4679');
    },
    'P': (c, x, y, s, tx) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#f4f1e8');
      dot(c, x, y, s, 0, 0, 16, 2, '#d4af37'); dot(c, x, y, s, 0, 14, 16, 2, '#c9b98f');
      if (tx % 2) { dot(c, x, y, s, 5, 4, 6, 8, '#7fb2ee'); dot(c, x, y, s, 5, 4, 6, 1, '#d4af37'); }
    },
    'A': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2f4a8a');
      for (let r = 0; r < 4; r++) dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#243a6d');
      if (nb(0, -1) !== 'A') dot(c, x, y, s, 0, 0, 16, 2, '#d4af37');
      if (tx === 16 && nb(0, -1) !== 'A') {
        const pts = [...Array(6)].map((_, i) => [8 + 5 * Math.cos(Math.PI / 6 + i * Math.PI / 3), 9 + 5 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
        poly(c, x, y, s, pts, null, '#d4af37'); circle(c, x, y, s, 8, 9, 2.6, null, '#d4af37');
      }
    },
    't': (c, x, y, s) => {
      TILE['_'](c, x, y, s);
      dot(c, x, y, s, 3, 1, 10, 14, '#3a3a44');
      dot(c, x, y, s, 4, 2, 8, 6, '#7a2c3a'); dot(c, x, y, s, 3, 9, 10, 3, '#5a5a66');
      dot(c, x, y, s, 3, 1, 10, 1, '#d4af37');
    },
    'u': (c, x, y, s, tx, ty) => {
      TILE['q'](c, x, y, s);
      c.fillStyle = 'rgba(180, 120, 255, 0.32)'; c.fillRect(x, y, s, s);
      if (hash(tx, ty) < 0.5) dot(c, x, y, s, 3 + Math.floor(hash(tx, ty, 2) * 9), 3 + Math.floor(hash(tx, ty, 3) * 9), 1, 1, '#f0e0ff');
    },
    'y': (c, x, y, s) => {
      TILE['q'](c, x, y, s);
      dot(c, x, y, s, 3, 9, 10, 6, '#3a3d48');
      c.save(); c.shadowColor = '#c08cff'; c.shadowBlur = s / 2;
      circle(c, x, y, s, 8, 7, 5.5, '#b48cff', '#6b3fb0');
      c.restore();
      circle(c, x, y, s, 8, 7, 2.5, '#f6eaff');
    },
    'e': (c, x, y, s, tx, ty) => {
      TILE['b'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 6, 14, 9, '#7a5230');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, i * 4, 1, 4, 5, i % 2 ? '#f4f4f4' : '#6b4fb0');
      const cols = ['#f2cc60', '#7ee787', '#ff9b6a'];
      for (let i = 0; i < 3; i++) {
        const pts = [...Array(6)].map((_, k) => [4 + i * 4 + 1.5 * Math.cos(k * Math.PI / 3), 9.5 + 1.5 * Math.sin(k * Math.PI / 3)]);
        poly(c, x, y, s, pts, cols[Math.floor(hash(tx, ty, i) * 3)]);
      }
    },
    'a': (c, x, y, s, tx, ty) => {
      TILE['b'](c, x, y, s, tx, ty);
      const hex = r => [...Array(6)].map((_, i) => [8 + r * Math.cos(Math.PI / 6 + i * Math.PI / 3), 8 + r * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
      poly(c, x, y, s, hex(7.5), '#a7adbb', '#6e7686');
      poly(c, x, y, s, hex(5.6), '#5fa8e8');
      circle(c, x, y, s, 8, 8, 3, null, '#cfe6ff');
      dot(c, x, y, s, 7.5, 2.5, 1, 5, '#e8f4ff');
    },

    // ---- 第 4 章（鏡の回廊） ----
    // 森の北の出口（第 4 章まで木でふさがっている。開くと道になる）
    'x': (c, x, y, s, tx, ty) => TILE['T'](c, x, y, s, tx, ty),
    // 山の岩肌
    'H': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#5f6472');
      for (let r = 0; r < 3; r++) dot(c, x, y, s, 0, 4 + r * 5 + Math.floor(hash(tx, ty, r) * 2), 16, 1, '#4d515e');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, Math.floor(hash(tx, ty, i + 4) * 13), Math.floor(hash(tx, ty, i + 7) * 13), 3, 2, '#727786');
      if (nb(0, -1) !== 'H') { dot(c, x, y, s, 0, 0, 16, 2, '#8a8f9c'); dot(c, x, y, s, 0, 2, 16, 1, '#4d515e'); }
    },
    // 夜空（星が散らばる）
    '`': (c, x, y, s, tx, ty) => {
      const g = c.createLinearGradient(0, y, 0, y + s);
      g.addColorStop(0, ty < 2 ? '#070920' : '#11123a'); g.addColorStop(1, ty < 2 ? '#0d0f2e' : '#1b1846');
      c.fillStyle = g; c.fillRect(x, y, s, s);
      for (let i = 0; i < 3; i++) if (hash(tx, ty, i + 20) < 0.5) dot(c, x, y, s, Math.floor(hash(tx, ty, i) * 15), Math.floor(hash(tx, ty, i + 3) * 15), 1, 1, i ? '#cfd6ff' : '#ffffff');
      if (hash(tx, ty, 31) < 0.12) { dot(c, x, y, s, 7, 5, 1, 5, '#e8ecff'); dot(c, x, y, s, 5, 7, 5, 1, '#e8ecff'); }
    },
    // 白い大理石の壁
    'C': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#e9e6dc');
      for (let r = 0; r < 4; r++) { dot(c, x, y, s, 0, r * 4 + 3, 16, 1, '#cfcabb'); dot(c, x, y, s, (r + ty) % 2 ? 3 : 11, r * 4, 1, 3, '#cfcabb'); }
      if (nb(0, 1) !== 'C' && nb(0, 1) !== '1') dot(c, x, y, s, 0, 14, 16, 2, '#b9b3a2');
      if (nb(0, -1) !== 'C') { dot(c, x, y, s, 0, 0, 16, 2, '#d4af37'); }
      void tx;
    },
    // 大理石の床（金の象眼）
    '9': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, (tx + ty) % 2 ? '#dcd8cc' : '#e6e2d7');
      dot(c, x, y, s, 0, 0, 16, 1, '#cbc6b7'); dot(c, x, y, s, 0, 0, 1, 16, '#cbc6b7');
      circle(c, x, y, s, 0, 0, 1.4, '#d4af37');
    },
    // 柱（縦溝つき）
    '1': (c, x, y, s, tx, ty) => {
      TILE['9'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 2, 0, 12, 2, '#d4af37'); dot(c, x, y, s, 3, 2, 10, 12, '#f7f5ef');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 5 + i * 2.5, 3, 1, 10, '#d9d4c6');
      dot(c, x, y, s, 3, 2, 2, 12, '#ffffff'); dot(c, x, y, s, 11, 2, 2, 12, '#cfc9b9');
      dot(c, x, y, s, 2, 14, 12, 2, '#b9b3a2');
    },
    // 柱廊の奥の暗がり
    '"': (c, x, y, s) => { const g = c.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, '#15162e'); g.addColorStop(1, '#262849'); c.fillStyle = g; c.fillRect(x, y, s, s); },
    // 正面の大扉（飾り）
    '7': (c, x, y, s, tx, ty, nb) => {
      TILE['"'](c, x, y, s);
      dot(c, x, y, s, 2, 0, 12, 16, '#c9d3e6'); dot(c, x, y, s, 7.5, 0, 1, 16, '#8a96b0');
      dot(c, x, y, s, 2, 0, 1, 16, '#d4af37'); dot(c, x, y, s, 13, 0, 1, 16, '#d4af37');
      if (nb(0, -1) !== '7') dot(c, x, y, s, 2, 0, 12, 2, '#d4af37');
      circle(c, x, y, s, 6, 9, 0.8, '#d4af37'); circle(c, x, y, s, 10, 9, 0.8, '#d4af37');
    },
    // 大理石の階段
    '8': (c, x, y, s) => {
      for (let i = 0; i < 4; i++) { dot(c, x, y, s, 0, i * 4, 16, 3, '#f1eee6'); dot(c, x, y, s, 0, i * 4 + 3, 16, 1, '#bdb7a7'); }
    },
    // 青い炎のかがり火
    '+': (c, x, y, s, tx, ty) => {
      TILE['9'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 6, 11, 4, 5, '#8a8f99'); poly(c, x, y, s, [[3, 8], [13, 8], [11, 12], [5, 12]], '#d4af37', '#8a6a1a');
      c.save(); c.shadowColor = '#7fd4ff'; c.shadowBlur = s / 2;
      poly(c, x, y, s, [[5, 8], [8, 0.5], [11, 8]], '#5fb8ff'); poly(c, x, y, s, [[6.5, 8], [8, 3.5], [9.5, 8]], '#e8f8ff');
      c.restore();
    },
    // 鏡の湖（波ひとつない水面。映り込みはマップの描画で重ねる）
    'v': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#0f1d3d');
      if (hash(tx, ty, 2) < 0.25) dot(c, x, y, s, Math.floor(hash(tx, ty) * 12), Math.floor(hash(tx, ty, 1) * 15), 4, 1, '#22386a');
    },
    // 湖に映った扉へ続く道（歩ける水面）
    'z': (c, x, y, s, tx, ty) => {
      TILE['v'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 7, 2 + (ty % 2) * 6, 2, 2, '#9fd0ff');
    },
    // 鏡が割れたあとの湖（さざ波）
    'j': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#1d3b6e');
      for (let i = 0; i < 2; i++) { const gx = Math.floor(hash(tx, ty, i) * 10), gy = 3 + i * 7; dot(c, x, y, s, gx, gy, 5, 1, '#6f9bd8'); dot(c, x, y, s, gx + 1, gy - 1, 3, 1, '#b8d4ff'); }
    },
    // 鏡の広間：鏡の床・ガラスの壁・スイッチ・閉じた格子
    '%': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, (tx + ty) % 2 ? '#c4d0e4' : '#ccd8ea');
      dot(c, x, y, s, 0, 0, 16, 1, '#a9b6cd'); dot(c, x, y, s, 0, 0, 1, 16, '#a9b6cd');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 9 + i, 3 + i * 2, 4 - i, 1, 'rgba(255,255,255,.7)');
    },
    '!': (c, x, y, s, tx, ty) => {
      TILE['%'](c, x, y, s, tx, ty);
      c.fillStyle = 'rgba(150, 220, 255, 0.45)'; c.fillRect(x + s * 0.2, y, s * 0.6, s);
      dot(c, x, y, s, 4, 0, 1, 16, '#eaf8ff'); dot(c, x, y, s, 11, 0, 1, 16, '#7fb0d8');
      dot(c, x, y, s, 6, (ty * 5) % 12, 2, 3, 'rgba(255,255,255,.8)');
    },
    '$': (c, x, y, s, tx, ty) => {
      TILE['%'](c, x, y, s, tx, ty);
      c.save(); c.shadowColor = '#ffe58a'; c.shadowBlur = s / 3;
      circle(c, x, y, s, 8, 8, 5.5, '#f6f1d0', '#d4af37'); c.restore();
      circle(c, x, y, s, 8, 8, 3, null, '#d4af37'); dot(c, x, y, s, 7.5, 4, 1, 8, '#d4af37');
    },
    '[': (c, x, y, s, tx, ty) => mirrorGate(c, x, y, s, tx, ty),
    ']': (c, x, y, s, tx, ty) => mirrorGate(c, x, y, s, tx, ty),
    '}': (c, x, y, s, tx, ty) => mirrorGate(c, x, y, s, tx, ty),
    // 婚礼の間：赤いじゅうたん・長いす・祭壇
    '&': (c, x, y, s, tx, ty) => {
      TILE['9'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 2, 0, 12, 16, '#9b1d2b'); dot(c, x, y, s, 2, 0, 1, 16, '#d4af37'); dot(c, x, y, s, 13, 0, 1, 16, '#d4af37');
      if (ty % 2) dot(c, x, y, s, 7, 7, 2, 2, '#d4af37');
    },
    ':': (c, x, y, s, tx, ty) => {
      TILE['9'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 0, 3, 16, 4, '#7a4b2a'); dot(c, x, y, s, 0, 8, 16, 4, '#8f5a33'); dot(c, x, y, s, 0, 3, 16, 1, '#a8703f');
      dot(c, x, y, s, 1, 12, 2, 3, '#5a3519'); dot(c, x, y, s, 13, 12, 2, 3, '#5a3519');
    },
    '^': (c, x, y, s, tx, ty) => {
      TILE['9'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 5, 14, 11, '#f4f1e8'); dot(c, x, y, s, 1, 5, 14, 3, '#d4af37'); dot(c, x, y, s, 6, 8, 4, 8, '#e3d9b8');
      c.save(); c.shadowColor = '#ffd27a'; c.shadowBlur = s / 4;
      dot(c, x, y, s, 3, 1, 1.5, 4, '#f4f4f4'); dot(c, x, y, s, 11.5, 1, 1.5, 4, '#f4f4f4');
      circle(c, x, y, s, 3.75, 0.8, 0.8, '#ffd27a'); circle(c, x, y, s, 12.25, 0.8, 0.8, '#ffd27a');
      c.restore();
    },
    // 奥の院の大鏡（割れると ? になる）
    '@': (c, x, y, s, tx, ty, nb) => bigMirror(c, x, y, s, tx, ty, nb, false),
    '?': (c, x, y, s, tx, ty, nb) => bigMirror(c, x, y, s, tx, ty, nb, true),

    // ---- 第 5 章：廃液街 ----
    // 研究所のドラフト（奥に階段が隠れている）。開くと '>' になる
    '(': (c, x, y, s, tx, ty, nb) => { TILE['F'](c, x, y, s, tx, ty, nb); dot(c, x, y, s, 2, 13, 12, 1, '#555'); },
    // 廃液街の壁（コンクリートと配管）
    '0': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#2b3436');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, Math.floor(hash(tx, ty, i) * 14), Math.floor(hash(tx, ty, i + 4) * 14), 2, 1, '#3a4547');
      if (ty % 3 === 0) { dot(c, x, y, s, 0, 5, 16, 3, '#5d6b63'); dot(c, x, y, s, 0, 5, 16, 1, '#7d8c82'); if (tx % 4 === 0) dot(c, x, y, s, 6, 4, 3, 5, '#8a7a4a'); }
      if (nb(0, 1) !== '0') dot(c, x, y, s, 0, 14, 16, 2, '#1a2022');
      if (hash(tx, ty, 9) < 0.15) dot(c, x, y, s, 9, 8, 1, 6, '#5fd4a0');   // したたる液
    },
    // ぬれたコンクリートの床
    '2': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, (tx + ty) % 2 ? '#4a5552' : '#4f5a57');
      if (hash(tx, ty, 3) < 0.3) { c.fillStyle = 'rgba(95, 212, 160, .18)'; c.beginPath(); c.ellipse(x + s * 0.5, y + s * 0.6, s * 0.3, s * 0.12, 0, 0, Math.PI * 2); c.fill(); }
      dot(c, x, y, s, 0, 0, 16, 1, '#3e4846');
    },
    // 配管の橋（金網）
    '3': (c, x, y, s, tx, ty) => {
      TILE['4'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 2, 14, 12, '#6e7778');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, 1, 3 + i * 3, 14, 1, '#4a5253');
      for (let i = 0; i < 4; i++) dot(c, x, y, s, 2 + i * 4, 2, 1, 12, '#4a5253');
      dot(c, x, y, s, 0, 1, 16, 1, '#a9b2b3'); dot(c, x, y, s, 0, 14, 16, 1, '#a9b2b3');
    },
    // うっすら光る液（通れない）
    '4': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#0f3b33');
      for (let i = 0; i < 2; i++) { const gx = Math.floor(hash(tx, ty, i) * 11), gy = 3 + i * 7; dot(c, x, y, s, gx, gy, 5, 1, '#2fae86'); }
      if (hash(tx, ty, 5) < 0.3) circle(c, x, y, s, 4 + hash(tx, ty, 6) * 8, 4 + hash(tx, ty, 7) * 8, 1, 'rgba(160, 255, 210, .6)');
    },
    // 古いタンク（さびた鉄）
    '5': (c, x, y, s, tx, ty, nb) => {
      TILE['2'](c, x, y, s, tx, ty);
      dot(c, x, y, s, 1, 0, 14, 16, '#6b5a48');
      dot(c, x, y, s, 1, 0, 3, 16, '#85705a'); dot(c, x, y, s, 12, 0, 3, 16, '#4e4235');
      if (nb(0, -1) !== '5') dot(c, x, y, s, 1, 0, 14, 2, '#9a8468');
      if (ty % 2) dot(c, x, y, s, 1, 8, 14, 1, '#3e342a');
      for (let i = 0; i < 3; i++) if (hash(tx, ty, i + 11) < 0.5) dot(c, x, y, s, 3 + i * 4, 3 + i * 3, 2, 2, '#a0522d');   // さび
    },
    // ホスフィンオキシドが結晶になる前の、液の切れ目（通れない）/ 結晶の足場
    '6': (c, x, y, s, tx, ty) => TILE['4'](c, x, y, s, tx, ty),
    '{': (c, x, y, s, tx, ty) => {
      TILE['4'](c, x, y, s, tx, ty);
      poly(c, x, y, s, [[1, 3], [15, 2], [14, 14], [2, 13]], '#e8f4ff', '#9ab4d0');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 3 + i * 4, 4 + i * 2, 3, 1, '#ffffff');
    },
    // 分液区：有機層（黄色がかった油）と水層（青い水）の床、漏斗のガラスの壁
    '*': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, (tx + ty) % 2 ? '#a08a3c' : '#a8913f');
      for (let i = 0; i < 2; i++) if (hash(tx, ty, i) < 0.5) circle(c, x, y, s, 3 + hash(tx, ty, i + 2) * 10, 3 + hash(tx, ty, i + 4) * 10, 1.4, 'rgba(255, 230, 140, .5)');
      dot(c, x, y, s, 0, 0, 16, 1, '#8a7632');
    },
    '-': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, (tx + ty) % 2 ? '#2f5f8f' : '#336697');
      dot(c, x, y, s, Math.floor(hash(tx, ty) * 10), 5 + Math.floor(hash(tx, ty, 1) * 6), 5, 1, '#5d93c7');
      dot(c, x, y, s, 0, 0, 16, 1, '#284f78');
    },
    '/': (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#9fb8c8');
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + s * 0.15, y, s * 0.15, s);
      dot(c, x, y, s, 0, 0, 16, 1, '#e8f4ff'); dot(c, x, y, s, 0, 15, 16, 1, '#6d8696');
      if (nb(0, 1) !== '/') dot(c, x, y, s, 0, 13, 16, 3, '#6d8696');
    },
    // 星の床（右にねじれた結晶と、左にねじれた結晶が、別々のまま並んで育っている）
    ')': (c, x, y, s, tx, ty) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#1c2a3e');
      const right = (tx + ty) % 2 === 0;
      c.save(); c.shadowColor = right ? '#9fe0ff' : '#ffc6f0'; c.shadowBlur = s / 6;
      poly(c, x, y, s, right ? [[5, 13], [8, 3], [11, 6], [9, 13]] : [[11, 13], [8, 3], [5, 6], [7, 13]], right ? '#cdeeff' : '#ffe0f6', right ? '#6fb8e0' : '#e08ac8');
      c.restore();
      dot(c, x, y, s, 0, 15, 16, 1, '#0f1826');
    },
    // 反応槽（大きな機械。通れない）
    "'": (c, x, y, s, tx, ty, nb) => {
      dot(c, x, y, s, 0, 0, 16, 16, '#3a4446');
      dot(c, x, y, s, 2, 0, 12, 16, '#56625f');
      if (nb(0, -1) !== "'") dot(c, x, y, s, 0, 0, 16, 2, '#8a9692');
      c.save(); c.shadowColor = '#5fd4a0'; c.shadowBlur = s / 4;
      if ((tx + ty) % 3 === 0) dot(c, x, y, s, 6, 6, 4, 4, '#5fd4a0');
      c.restore();
      dot(c, x, y, s, 2, 0, 1, 16, '#6e7a77'); dot(c, x, y, s, 13, 0, 1, 16, '#2a3234');
    },
  };
  // 鏡の広間の格子（閉じている）
  function mirrorGate(c, x, y, s, tx, ty) {
    TILE['C'](c, x, y, s, tx, ty, () => 'C');
    dot(c, x, y, s, 2, 1, 12, 15, '#20223f');
    for (let i = 0; i < 4; i++) dot(c, x, y, s, 3 + i * 3, 1, 1, 15, '#c4d0e4');
    dot(c, x, y, s, 2, 7, 12, 1, '#d4af37');
  }
  // 大きな鏡。となりのタイルを見て、金の縁を外側だけに描く
  function bigMirror(c, x, y, s, tx, ty, nb, broken) {
    const isM = d => nb(...d) === '@' || nb(...d) === '?';
    const g = c.createLinearGradient(x, y, x + s, y + s);
    g.addColorStop(0, broken ? '#6a7690' : '#e8f2ff'); g.addColorStop(1, broken ? '#3a4258' : '#8fa8cc');
    c.fillStyle = g; c.fillRect(x, y, s, s);
    if (!broken) { dot(c, x, y, s, (tx * 3) % 10, 2, 2, 12, 'rgba(255,255,255,.55)'); }
    else {
      c.strokeStyle = '#e8f2ff'; c.lineWidth = Math.max(1, s / 16);
      c.beginPath(); c.moveTo(x + s * 0.5, y); c.lineTo(x + s * 0.3, y + s * 0.45); c.lineTo(x + s * 0.7, y + s * 0.6); c.lineTo(x + s * 0.45, y + s);
      c.moveTo(x + s * 0.3, y + s * 0.45); c.lineTo(x, y + s * 0.35); c.moveTo(x + s * 0.7, y + s * 0.6); c.lineTo(x + s, y + s * 0.75); c.stroke();
    }
    if (!isM([0, -1])) dot(c, x, y, s, 0, 0, 16, 2, '#d4af37');
    if (!isM([0, 1])) dot(c, x, y, s, 0, 14, 16, 2, '#d4af37');
    if (!isM([-1, 0])) dot(c, x, y, s, 0, 0, 2, 16, '#d4af37');
    if (!isM([1, 0])) dot(c, x, y, s, 14, 0, 2, 16, '#d4af37');
  }
  // 配向性の門（閉じている）。色の旗で、どの紋章が要るかを示す
  function gate(c, x, y, s, color) {
    TILE['Z'](c, x, y, s, 0, 0);
    dot(c, x, y, s, 2, 2, 12, 14, '#4a3a2a');
    for (let i = 0; i < 3; i++) dot(c, x, y, s, 3 + i * 4, 2, 2, 14, '#8a8f99');
    dot(c, x, y, s, 2, 7, 12, 1, '#6e7686');
    dot(c, x, y, s, 5, 3, 6, 3, color);
  }
  const SOLID = new Set(['T', '~', 'M', 'r', '#', 'B', 'S', 'F', 'W', 'R', 'h', 'E', 'O', 'K', 'G', 'X', 'L', 'k', '|', 'Y',
    'Z', 'I', 'J', 'V', 'N', 'U', 'P', 'A', 't', 'y', 'e', 'a',
    'x', 'H', '`', 'C', '1', '"', '7', '+', 'v', 'j', '!', '[', ']', '}', ':', '^', '@', '?',
    '(', '0', '4', '5', '6', '/', "'"]);

  // nb(dx, dy) はとなりのタイルの文字を返す（マップの外は木とみなす）
  function drawTile(ctx, ch, x, y, s, tx, ty, nb = () => '.') { (TILE[ch] || TILE['.'])(ctx, x, y, s, tx, ty, nb); }

  // ---- キャラクター ---------------------------------------------
  // 人型の基本形
  function person(c, x, y, s, o) {
    dot(c, x, y, s, 5, 14, 2, 2, '#2a2a2a'); dot(c, x, y, s, 9, 14, 2, 2, '#2a2a2a');
    if (o.dress) poly(c, x, y, s, [[8, 7], [13, 15], [3, 15]], o.cloth);
    else dot(c, x, y, s, 4, 8, 8, 6, o.cloth);
    if (o.coat) { dot(c, x, y, s, 4, 8, 2, 7, o.coat); dot(c, x, y, s, 10, 8, 2, 7, o.coat); }
    dot(c, x, y, s, 5, 2, 6, 6, o.skin || '#f1c27d');
    if (o.hair) { dot(c, x, y, s, 5, 1, 6, 2, o.hair); if (o.long) { dot(c, x, y, s, 4, 2, 1, 7, o.hair); dot(c, x, y, s, 11, 2, 1, 7, o.hair); } }
    if (o.mask) {
      dot(c, x, y, s, 5, 2, 6, 6, '#f4f4f4');
      dot(c, x, y, s, 6, 4, 1, 2, '#111'); dot(c, x, y, s, 9, 4, 1, 2, '#111');
      dot(c, x, y, s, 8, 2, 0.5, 6, '#9a9a9a'); // 鏡面
      dot(c, x, y, s, 4, 0, 8, 2, o.cloth);
    } else {
      dot(c, x, y, s, 6, 4, 1, 1, '#222'); dot(c, x, y, s, 9, 4, 1, 1, '#222');
    }
    if (o.glasses) { dot(c, x, y, s, 5.5, 3.6, 2, 1.6, 'rgba(255,255,255,.6)'); dot(c, x, y, s, 8.5, 3.6, 2, 1.6, 'rgba(255,255,255,.6)'); dot(c, x, y, s, 7.5, 4, 1, .5, '#222'); }
    if (o.fan) poly(c, x, y, s, [[12, 9], [16, 6], [16, 12]], '#f2cc60', '#b08d2a');
    if (o.helmet) dot(c, x, y, s, 4, 0, 8, 3, '#8a8f99');
  }

  // 分子っぽい丸いキャラ
  function blob(c, x, y, s, fill, eyes = true, ry = 5.5) {
    const u = s / 16;
    c.beginPath(); c.ellipse(x + 8 * u, y + (15 - ry) * u, 6 * u, ry * u, 0, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = u; c.stroke();
    if (eyes) { dot(c, x, y, s, 6, 15 - ry - 1, 1, 2, '#111'); dot(c, x, y, s, 9, 15 - ry - 1, 1, 2, '#111'); }
  }

  const CHAR = {
    hero(c, x, y, s, o = {}) {
      const cols = o.colors || ['#888', '#888', '#888', '#888'];
      const u = s / 16;
      // 4 本の手（上・左下・右下・右）
      const hands = [[8, 1.6], [2.2, 13], [13.8, 13.2], [14.4, 6.5]];
      hands.forEach(([hx, hy], i) => {
        c.strokeStyle = '#ddd'; c.lineWidth = u; c.beginPath(); c.moveTo(x + 8 * u, y + 8.5 * u); c.lineTo(x + hx * u, y + hy * u); c.stroke();
        circle(c, x, y, s, hx, hy, 1.8, cols[i], '#111');
      });
      circle(c, x, y, s, 8, 8.5, 5, o.body || '#2b2f3a', o.rim || '#fff');
      const d = o.dir || 'down';
      const ex = d === 'left' ? -1.2 : d === 'right' ? 1.2 : 0, ey = d === 'up' ? -1.5 : 0;
      if (d !== 'up') { dot(c, x, y, s, 6 + ex, 7.5 + ey, 1, 2, o.eye || '#fff'); dot(c, x, y, s, 9 + ex, 7.5 + ey, 1, 2, o.eye || '#fff'); }
      else { c.fillStyle = '#fff'; c.font = `${Math.round(5 * u)}px sans-serif`; c.textAlign = 'center'; c.fillText('C', x + 8 * u, y + 10.3 * u); }
    },
    prof: (c, x, y, s) => person(c, x, y, s, { cloth: '#3b5ba5', coat: '#f0f0f0', hair: '#b8b8b8', glasses: true }),
    guard: (c, x, y, s) => person(c, x, y, s, { cloth: '#3f7d4a', helmet: true }),
    shop(c, x, y, s) {
      person(c, x, y, s, { cloth: '#d97b3f', hair: '#5a3a1e', long: true });
      dot(c, x, y, s, 5, 9, 6, 5, '#f4f4f4'); dot(c, x, y, s, 7, 10, 2, 1, '#d97b3f');
    },
    model(c, x, y, s) {
      // 球棒模型（中心の炭素と 4 本の結合）
      const u = s / 16;
      [[8, 2.5], [2.5, 12], [13.5, 12], [12.5, 5]].forEach(([gx, gy]) => {
        c.strokeStyle = '#bbb'; c.lineWidth = 1.4 * u; c.beginPath(); c.moveTo(x + 8 * u, y + 8.5 * u); c.lineTo(x + gx * u, y + gy * u); c.stroke();
        circle(c, x, y, s, gx, gy, 2, '#f4f4f4', '#777');
      });
      circle(c, x, y, s, 8, 8.5, 3.6, '#30343f', '#111');
      dot(c, x, y, s, 6.8, 7.6, 0.8, 1.2, '#fff'); dot(c, x, y, s, 8.6, 7.6, 0.8, 1.2, '#fff');
    },
    meso: (c, x, y, s) => person(c, x, y, s, { cloth: '#4b3a6b', mask: true }),
    mesoDuo(c, x, y, s) {
      CHAR.meso(c, x - s * 0.28, y, s);
      c.save(); c.translate(x + s * 1.28, y); c.scale(-1, 1); CHAR.meso(c, 0, 0, s); c.restore();
    },
    cation: (c, x, y, s) => person(c, x, y, s, { cloth: '#c0392b', dress: true, hair: '#7b1f1f', long: true, fan: true }),
    cation2(c, x, y, s) {
      [[2, 3], [14, 3], [8, -0.5]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 1.6, '#ffcc66', '#b07d1c'));
      person(c, x, y, s, { cloth: '#ff4d3d', dress: true, hair: '#a32020', long: true, fan: true });
    },
    elder(c, x, y, s) {
      const u = s / 16;
      const pts = [...Array(6)].map((_, i) => [8 + 6.5 * Math.cos(Math.PI / 6 + i * Math.PI / 3), 8 + 6.5 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
      poly(c, x, y, s, pts, '#e9e2c9', '#5a4a2a');
      circle(c, x, y, s, 8, 8, 3.6, null, '#5a4a2a');
      dot(c, x, y, s, 6, 6, 1, 1, '#222'); dot(c, x, y, s, 9, 6, 1, 1, '#222');
      poly(c, x, y, s, [[5.5, 9.5], [10.5, 9.5], [8, 15.5]], '#ffffff', '#bbb');
      void u;
    },
    carvoneR(c, x, y, s) { blob(c, x, y, s, '#6fcf7f'); circle(c, x, y, s, 8, 10, 2.4, null, '#2e6b37'); dot(c, x, y, s, 11, 2, 3, 2, '#2e9e45'); },
    carvoneS(c, x, y, s) { blob(c, x, y, s, '#c49a6c'); circle(c, x, y, s, 8, 10, 2.4, null, '#6b4a2a'); dot(c, x, y, s, 2, 2, 3, 2, '#8a6239'); },
    victim(c, x, y, s) { blob(c, x, y, s, '#9aa0aa', true, 2.6); },
    lumber(c, x, y, s) {
      [[3, 5], [13, 5], [8, 2]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 1.8, '#d6d6d6', '#555'));
      blob(c, x, y, s, '#c9a27a');
    },
    methane(c, x, y, s) {
      [[8, 3.5], [3.5, 9], [12.5, 9], [8, 14.8]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 1.6, '#f4f4f4', '#777'));
      circle(c, x, y, s, 8, 9, 3.6, '#4a4f5e', '#222');
      dot(c, x, y, s, 6.5, 8, 1, 1, '#fff'); dot(c, x, y, s, 8.5, 8, 1, 1, '#fff');
    },
    water(c, x, y, s) {
      circle(c, x, y, s, 3.5, 12.5, 2.4, '#f4f4f4', '#777'); circle(c, x, y, s, 12.5, 12.5, 2.4, '#f4f4f4', '#777');
      circle(c, x, y, s, 8, 8, 4.8, '#e05a50', '#7a1d18');
      dot(c, x, y, s, 6, 7, 1, 1.5, '#fff'); dot(c, x, y, s, 9, 7, 1, 1.5, '#fff');
    },
    sign(c, x, y, s) { dot(c, x, y, s, 7, 8, 2, 8, '#6b4423'); dot(c, x, y, s, 2, 3, 12, 6, '#a2763f'); dot(c, x, y, s, 3, 5, 10, 1, '#6b4423'); },
    chest(c, x, y, s) { dot(c, x, y, s, 2, 6, 12, 9, '#9a6a3a'); dot(c, x, y, s, 2, 6, 12, 3, '#7a4b25'); dot(c, x, y, s, 7, 8, 2, 3, '#f2cc60'); },
    chestOpen(c, x, y, s) { dot(c, x, y, s, 2, 9, 12, 6, '#9a6a3a'); dot(c, x, y, s, 2, 4, 12, 3, '#7a4b25'); dot(c, x, y, s, 3, 9, 10, 2, '#3a2412'); },

    // ---- 第 2 章 ----
    ketoh(c, x, y, s) {
      person(c, x, y, s, { cloth: '#6b4a2f', hair: '#3a2a1a' });
      dot(c, x, y, s, 4, 0, 8, 2, '#1a1a1a'); dot(c, x, y, s, 5, -2, 6, 2, '#1a1a1a'); // シルクハット
      circle(c, x, y, s, 9.5, 4.5, 1.4, null, '#f2cc60');                               // 片眼鏡
      dot(c, x, y, s, 7, 8, 2, 4, '#f4f4f4');
    },
    ketohNoMono(c, x, y, s) {
      person(c, x, y, s, { cloth: '#6b4a2f', hair: '#3a2a1a' });
      dot(c, x, y, s, 4, 0, 8, 2, '#1a1a1a'); dot(c, x, y, s, 5, -2, 6, 2, '#1a1a1a');
      dot(c, x, y, s, 7, 8, 2, 4, '#f4f4f4');
    },
    thief(c, x, y, s) {
      poly(c, x, y, s, [[3, 7], [13, 7], [15, 15], [1, 15]], '#1a1a2e');
      person(c, x, y, s, { cloth: '#2a2a40', hair: '#1a1a1a' });
      dot(c, x, y, s, 5, 3.5, 6, 2, '#111'); dot(c, x, y, s, 6, 4, 1, 1, '#ffe066'); dot(c, x, y, s, 9, 4, 1, 1, '#ffe066');
      dot(c, x, y, s, 4, 0, 8, 2, '#1a1a2e');
    },
    kidA(c, x, y, s) { c.save(); c.translate(x + s * 0.15, y + s * 0.3); person(c, 0, 0, s * 0.7, { cloth: '#f2cc60', hair: '#7a4b25', long: true }); c.restore(); },
    kidB(c, x, y, s) { c.save(); c.translate(x + s * 0.15, y + s * 0.3); person(c, 0, 0, s * 0.7, { cloth: '#79c0ff', hair: '#2a2a2a' }); c.restore(); },
    director: (c, x, y, s) => person(c, x, y, s, { cloth: '#6a7fb5', hair: '#9a9a9a', long: true, glasses: true }),
    grignard(c, x, y, s) {
      person(c, x, y, s, { cloth: '#f4f4f4', hair: '#3a2a1a' });
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 4, 8.5 + i * 2, 8, 1, '#2f6fbf');
      dot(c, x, y, s, 4, 0, 8, 2, '#2f6fbf');
    },
    granny: (c, x, y, s) => { person(c, x, y, s, { cloth: '#7a5aa0', hair: '#d0d0d0' }); dot(c, x, y, s, 5, 9, 6, 5, '#f4f4f4'); },
    twins(c, x, y, s) {
      c.save(); c.translate(x - s * 0.05, y + s * 0.25); person(c, 0, 0, s * 0.72, { cloth: '#7ee787', hair: '#5a3a1e' }); c.restore();
      c.save(); c.translate(x + s * 0.4, y + s * 0.25); person(c, 0, 0, s * 0.72, { cloth: '#7ee787', hair: '#5a3a1e' }); c.restore();
    },
    menthone: (c, x, y, s) => person(c, x, y, s, { cloth: '#4fa86a', dress: true, hair: '#c9a27a', long: true }),
    methylBoss: (c, x, y, s) => { person(c, x, y, s, { cloth: '#a0522d', hair: '#2a2a2a' }); dot(c, x, y, s, 3, 8, 10, 3, '#a0522d'); },
    keeper(c, x, y, s) {
      person(c, x, y, s, { cloth: '#3b4a6b', hair: '#f4f4f4' });
      poly(c, x, y, s, [[5.5, 6], [10.5, 6], [8, 9.5]], '#f4f4f4');
      dot(c, x, y, s, 12, 9, 3, 4, '#ffe066'); dot(c, x, y, s, 12, 8, 3, 1, '#555');
    },
    innkeeper: (c, x, y, s) => { person(c, x, y, s, { cloth: '#b5651d', hair: '#2a2a2a' }); dot(c, x, y, s, 5, 9, 6, 5, '#f4f4f4'); },
    iodo(c, x, y, s) {
      const u = s / 16;
      poly(c, x, y, s, [[8, 1], [14, 5], [14, 12], [8, 15.5], [2, 12], [2, 5]], '#f2d43c', '#b8961a');
      poly(c, x, y, s, [[8, 1], [14, 5], [8, 8], [2, 5]], '#fbe77a');
      dot(c, x, y, s, 5.5, 8.5, 1.2, 2, '#3a2a00'); dot(c, x, y, s, 9.5, 8.5, 1.2, 2, '#3a2a00');
      void u;
    },
    iodoTrio(c, x, y, s) {
      c.save(); c.translate(x - s * 0.35, y + s * 0.15); CHAR.iodo(c, 0, 0, s * 0.8); c.restore();
      c.save(); c.translate(x + s * 0.55, y + s * 0.15); CHAR.iodo(c, 0, 0, s * 0.8); c.restore();
      CHAR.iodo(c, x + s * 0.1, y - s * 0.05, s * 0.85);
    },
    achiral(c, x, y, s) {
      poly(c, x, y, s, [[8, 6], [13.5, 16], [2.5, 16]], '#f4f4f4', '#bbb');
      dot(c, x, y, s, 5, 2, 6, 6, '#f1e4d0');
      dot(c, x, y, s, 5, 1, 6, 2, '#e8e8e8');
      dot(c, x, y, s, 6, 4, 1, 1, '#222'); dot(c, x, y, s, 9, 4, 1, 1, '#222');
      dot(c, x, y, s, 7.75, 1, 0.5, 15, '#c8c8c8');                 // 鏡面
      dot(c, x, y, s, 6.5, 9, 3, 2.5, '#f1e4d0');                    // 合わせた両手
    },
    // 白い船（4×3 タイル分。原点は左上）。正面から見た、左右完全対称の船。灯りはひとつもない
    ship(c, x, y, s) {
      const u = s / 16, X = v => x + v * u, Y = v => y + v * u;
      const P = (pts, fill, stroke, lw = 1) => {
        c.beginPath(); pts.forEach(([a, b], i) => i ? c.lineTo(X(a), Y(b)) : c.moveTo(X(a), Y(b))); c.closePath();
        if (fill) { c.fillStyle = fill; c.fill(); }
        if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw * u; c.stroke(); }
      };
      // 水面の影と霧
      c.fillStyle = 'rgba(0, 0, 20, .35)'; c.beginPath(); c.ellipse(X(32), Y(46), 30 * u, 4 * u, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.shadowColor = 'rgba(200, 220, 255, .9)'; c.shadowBlur = 10 * u;
      // 3 本のマスト（中央と、鏡に映したような左右）
      for (const mx of [12, 32, 52]) { c.fillStyle = '#e8ecf4'; c.fillRect(X(mx - 0.8), Y(mx === 32 ? -14 : -4), 1.6 * u, (mx === 32 ? 44 : 34) * u); }
      // 帆（左右対称に広がる）
      P([[32, -12], [22, -2], [24, 14], [32, 12]], '#f7f9fc', '#b8c2d6');
      P([[32, -12], [42, -2], [40, 14], [32, 12]], '#f7f9fc', '#b8c2d6');
      P([[12, -2], [5, 6], [6, 18], [12, 16]], '#f2f5fa', '#b8c2d6');
      P([[52, -2], [59, 6], [58, 18], [52, 16]], '#f2f5fa', '#b8c2d6');
      // 船体（台形）と舷側の帯
      P([[2, 30], [62, 30], [50, 45], [14, 45]], '#f4f6fa', '#9aa6bd', 1.2);
      c.restore();
      P([[4, 31.5], [60, 31.5], [58.6, 34], [5.4, 34]], '#cfd6e4');
      c.fillStyle = '#b8c2d6'; c.fillRect(X(31.6), Y(34), 0.8 * u, 11 * u);                 // 竜骨（鏡面）
      // 神殿のような船室
      P([[20, 30], [44, 30], [44, 19], [20, 19]], '#fbfcff', '#9aa6bd');
      P([[18, 19], [46, 19], [32, 9]], '#fbfcff', '#9aa6bd');
      for (const wx of [23, 27, 35, 39]) {                                                       // 灯りのない窓
        P([[wx, 29], [wx + 2.4, 29], [wx + 2.4, 23], [wx + 1.2, 21.6], [wx, 23]], '#1b2133');
      }
      // 扉と、鏡面の紋章（円を縦の線が二分する）
      P([[30, 30], [34, 30], [34, 24], [32, 22.4], [30, 24]], '#2a3247');
      c.strokeStyle = '#7f8aa3'; c.lineWidth = 1 * u;
      c.beginPath(); c.arc(X(32), Y(15), 2.8 * u, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(X(32), Y(11.6)); c.lineTo(X(32), Y(18.4)); c.stroke();
      // 船べりの霧
      c.fillStyle = 'rgba(220, 230, 245, .35)';
      for (const [fx, fr] of [[10, 5], [22, 6], [42, 6], [54, 5]]) { c.beginPath(); c.ellipse(X(fx), Y(45), fr * u, 2 * u, 0, 0, Math.PI * 2); c.fill(); }
    },

    // ---- 第 3 章 ----
    // グリニャの小舟（2×2 タイル分）。帆に、グリニャの青い縞
    boat(c, x, y, s) {
      poly(c, x, y, s, [[1, 22], [31, 22], [27, 29], [5, 29]], '#8a5f33', '#5e3d1f');
      dot(c, x, y, s, 2, 22, 28, 1.5, '#a8763f');
      dot(c, x, y, s, 15.3, 2, 1.4, 20, '#5e3d1f');
      poly(c, x, y, s, [[16.5, 3], [28, 19], [16.5, 19]], '#f4f4f4', '#bbb');
      for (let i = 0; i < 3; i++) dot(c, x, y, s, 17, 9 + i * 3, 6 + i * 2.5, 1, '#2f6fbf');
    },
    // BHT の衛兵：両肩に、かさ高い t-ブチル基
    bht(c, x, y, s) {
      person(c, x, y, s, { cloth: '#c9a227', helmet: true });
      for (const gx of [3, 13]) { circle(c, x, y, s, gx, 8.5, 2.6, '#9aa0aa', '#555'); [[-1.4, -1.6], [1.6, -1.2], [0, 1.9]].forEach(([a, b]) => circle(c, x, y, s, gx + a, 8.5 + b, 0.9, '#f4f4f4')); }
      dot(c, x, y, s, 14, 2, 1, 13, '#6b4423'); poly(c, x, y, s, [[13, 2], [16, 2], [14.5, 0]], '#c9ced8');
    },
    naphtha(c, x, y, s) {
      CHAR.naphthaNoCrown(c, x, y, s);
      // 2 つの六角形が並んだ、鉄の冠
      for (const cx of [6, 10]) {
        const pts = [...Array(6)].map((_, i) => [cx + 2.2 * Math.cos(i * Math.PI / 3), 0.6 + 2.2 * Math.sin(i * Math.PI / 3)]);
        poly(c, x, y, s, pts, '#3a3a44', '#d4af37');
      }
    },
    naphthaNoCrown(c, x, y, s) {
      poly(c, x, y, s, [[3, 8], [13, 8], [15, 16], [1, 16]], '#2c3e8f');
      person(c, x, y, s, { cloth: '#f4f1e8', hair: '#c8c8c8' });
      dot(c, x, y, s, 5.5, 6.5, 5, 1.5, '#e0e0e0');
      dot(c, x, y, s, 7, 9, 2, 4, '#d4af37');
    },
    aniHead(c, x, y, s) {
      person(c, x, y, s, { cloth: '#3d7dd8', hair: '#2a2a2a' });
      dot(c, x, y, s, 5.5, 5.8, 5, 1, '#2a2a2a');                       // ひげ
      dot(c, x, y, s, 4, 8, 2, 2, '#9fd0ff'); dot(c, x, y, s, 10, 8, 2, 2, '#9fd0ff');
    },
    metaCount(c, x, y, s) {
      person(c, x, y, s, { cloth: '#7a1f2e', coat: '#3a1018', hair: '#5a5a5a' });
      dot(c, x, y, s, 5, -1, 6, 3, '#2a2a2a'); dot(c, x, y, s, 4, 1.5, 8, 1, '#2a2a2a');
      dot(c, x, y, s, 5, 8, 6, 1.5, '#f4f4f4');                            // 高い襟
    },
    nitra(c, x, y, s) {
      c.save(); c.translate(x + s * 0.15, y + s * 0.3);
      person(c, 0, 0, s * 0.7, { cloth: '#f2d43c', hair: '#5a3a1e', long: true, dress: true });
      c.restore();
      dot(c, x, y, s, 6, 4, 4, 2, '#ffe066'); circle(c, x, y, s, 8, 5, 1, '#f2b705');   // 黄色いリボン
    },
    aniBoy(c, x, y, s) { c.save(); c.translate(x + s * 0.15, y + s * 0.3); person(c, 0, 0, s * 0.7, { cloth: '#79c0ff', hair: '#2a2a2a' }); c.restore(); },
    aniBoyBr(c, x, y, s) {
      CHAR.aniBoy(c, x, y, s);
      [[4, 6], [12, 6], [8, 3.5]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 1.4, '#a5402a', '#5a1a10'));
    },
    pyridine(c, x, y, s) {
      person(c, x, y, s, { cloth: '#2a8a8a', hair: '#2a2a2a' });
      dot(c, x, y, s, 4, 0, 8, 3, '#f4f4f4'); circle(c, x, y, s, 8, 1.5, 1, '#79c0ff');   // ターバンと青い石（窒素）
    },
    ibu(c, x, y, s) {
      person(c, x, y, s, { cloth: '#f4f4f4', hair: '#3a2a1a', long: true });
      dot(c, x, y, s, 7, 9, 2, 2, '#d9534f'); dot(c, x, y, s, 7.5, 8.5, 1, 3, '#d9534f');   // 薬師の印
    },
    // オクタ：桶の形の家から抜け出してきたような、桶をはいた少女
    octa(c, x, y, s) {
      c.save(); c.translate(x + s * 0.15, y + s * 0.1);
      person(c, 0, 0, s * 0.7, { cloth: '#7ee787', hair: '#c9772a', long: true });
      c.restore();
      poly(c, x, y, s, [[2.5, 10], [13.5, 10], [12, 16], [4, 16]], '#a2763f', '#6b4423');
      dot(c, x, y, s, 2.5, 12, 11, 1, '#6b4423');
    },
    tempo(c, x, y, s) {
      person(c, x, y, s, { cloth: '#4a6b5a', hair: '#f4f4f4' });
      poly(c, x, y, s, [[5.5, 6], [10.5, 6], [8, 11]], '#f4f4f4');                    // ひげ
      c.save(); c.shadowColor = '#ff6b6b'; c.shadowBlur = s / 5; circle(c, x, y, s, 12.5, 9, 1.2, '#ff6b6b'); c.restore();   // 不対電子
    },
    methylGuard(c, x, y, s) {
      circle(c, x, y, s, 8, 10, 4.5, '#6e7480', '#333');
      [[4, 6], [12, 6], [8, 15]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 1.6, '#f4f4f4', '#777'));
      dot(c, x, y, s, 6.5, 9, 1, 1, '#fff'); dot(c, x, y, s, 8.5, 9, 1, 1, '#fff');
    },
    bromosuc(c, x, y, s) {
      person(c, x, y, s, { cloth: '#555c6b', coat: '#f0f0f0', hair: '#2a2a2a', glasses: true });
      dot(c, x, y, s, 12.5, 6, 1.2, 5, '#cfe6ff'); dot(c, x, y, s, 12.3, 5, 1.6, 1.4, '#3a3a44'); dot(c, x, y, s, 12.8, 11, 0.8, 1, '#a5402a');   // スポイトと臭素の 1 滴
    },
    radika(c, x, y, s, o = {}) {
      const glow = o.glow === undefined ? 1 : o.glow;
      c.save(); c.translate(x + s * 0.12, y + s * 0.22);
      person(c, 0, 0, s * 0.76, { cloth: '#e0663a', hair: '#ffb347' });
      c.restore();
      [[5, 1.5], [7.5, 0.6], [10, 1.5]].forEach(([gx, gy]) => poly(c, x, y, s, [[gx - 1.2, gy + 2.5], [gx + 1.2, gy + 2.5], [gx, gy - 1]], '#ffb347'));   // とがった髪
      if (glow > 0) { c.save(); c.shadowColor = '#ffe066'; c.shadowBlur = s / 3 * glow; circle(c, x, y, s, 14, 10, 1.4 + glow * 0.5, '#ffe066'); c.restore(); }   // 空いた片手の不対電子
      else circle(c, x, y, s, 14, 10, 1.2, '#a89a6a');
    },
    radika2(c, x, y, s) {
      c.fillStyle = 'rgba(180, 120, 255, .25)'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.55, 0, Math.PI * 2); c.fill();
      CHAR.radika(c, x, y, s, { glow: 2 });
    },
    radika3(c, x, y, s) { CHAR.radika(c, x, y, s, { glow: 0 }); },
    pillarOn(c, x, y, s) {
      c.save(); c.shadowColor = '#a8c8ff'; c.shadowBlur = s / 3;
      dot(c, x, y, s, 5, 2, 6, 13, '#f4f6fb');
      c.restore();
      dot(c, x, y, s, 4, 1, 8, 2, '#d4af37'); dot(c, x, y, s, 4, 14, 8, 2, '#c9b98f');
      c.strokeStyle = '#7fa6ff'; c.lineWidth = s / 16; c.beginPath(); c.ellipse(x + s / 2, y + s * 0.45, s * 0.36, s * 0.12, 0, 0, Math.PI * 2); c.stroke();
    },
    pillarOff(c, x, y, s) {
      dot(c, x, y, s, 5, 2, 6, 13, '#9a9da6');
      dot(c, x, y, s, 4, 1, 8, 2, '#7a7d86'); dot(c, x, y, s, 4, 14, 8, 2, '#6e7180');
      [[6, 5], [9, 8], [6.5, 11], [9.5, 3.5]].forEach(([gx, gy]) => circle(c, x, y, s, gx, gy, 0.9, '#8fd16a'));   // 付加した塩素
    },
    // 置換でクロロベンゼンになった長老（環の角に、緑の Cl）
    elderCl(c, x, y, s) {
      CHAR.elder(c, x, y, s);
      dot(c, x, y, s, 13.5, 2.5, 1.6, 1, '#555');
      circle(c, x, y, s, 15, 1.6, 1.8, '#8fd16a', '#3d7a2a');
    },
    fruit(c, x, y, s) { person(c, x, y, s, { cloth: '#e08a2e', hair: '#5a3a1e' }); dot(c, x, y, s, 5, 9, 6, 5, '#f4f4f4'); },
    butler(c, x, y, s) { person(c, x, y, s, { cloth: '#1f1f28', hair: '#9a9a9a' }); dot(c, x, y, s, 7, 8, 2, 3, '#f4f4f4'); dot(c, x, y, s, 7.3, 8, 1.4, 1, '#c0392b'); },
    student(c, x, y, s) { person(c, x, y, s, { cloth: '#6a7fb5', hair: '#3a2a1a', glasses: true }); dot(c, x, y, s, 10, 9, 4, 5, '#c0392b'); dot(c, x, y, s, 10.5, 9.5, 3, 4, '#f4f4f4'); },

    // ---- 第 4 章 ----
    // 影のカーボ：カーボを左右反転して、暗い色で描く（o.colors は仲間の色）
    shadow(c, x, y, s, o = {}) {
      const dark = (o.colors || ['#888', '#888', '#888', '#888']).map(col => col + '99');
      c.save(); c.translate(x + s, y); c.scale(-1, 1);
      c.shadowColor = '#b48cff'; c.shadowBlur = s / 5;
      CHAR.hero(c, 0, 0, s, { colors: dark, dir: 'down', body: '#120a1e', rim: '#b48cff', eye: '#ff5c8a' });
      c.restore();
    },
    // ブルバレン：会うたびに（時間とともに）形が変わる。3 つの形
    bull0(c, x, y, s) { bullvalene(c, x, y, s, 0); },
    bull1(c, x, y, s) { bullvalene(c, x, y, s, 1); },
    bull2(c, x, y, s) { bullvalene(c, x, y, s, 2); },
    priest(c, x, y, s) {
      person(c, x, y, s, { cloth: '#f4f1e8', mask: true, dress: true });
      poly(c, x, y, s, [[4.5, 2], [11.5, 2], [10, -2.5], [8, -4], [6, -2.5]], '#f4f1e8', '#d4af37');   // 高い帽子
      dot(c, x, y, s, 7.5, -3, 1, 5, '#d4af37');
      dot(c, x, y, s, 7.5, 8, 1, 7, '#d4af37');
    },
    // 花婿シクロペンタジエン（五角形。蝶ネクタイ）
    cpd(c, x, y, s) {
      const pts = [...Array(5)].map((_, i) => [8 + 6 * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5), 8.5 + 6 * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5)]);
      poly(c, x, y, s, pts, '#6fb3e0', '#2c5f86');
      dot(c, x, y, s, 6, 7, 1, 2, '#111'); dot(c, x, y, s, 9, 7, 1, 2, '#111');
      poly(c, x, y, s, [[5.5, 11], [8, 12.2], [5.5, 13.4]], '#111'); poly(c, x, y, s, [[10.5, 11], [8, 12.2], [10.5, 13.4]], '#111');
    },
    // 花嫁の無水マレイン酸（環とベール）
    maleic(c, x, y, s) {
      poly(c, x, y, s, [[8, 0.5], [14, 5], [15, 16], [1, 16], [2, 5]], 'rgba(255,255,255,.75)', '#e8e8f4');   // ベール
      const pts = [...Array(5)].map((_, i) => [8 + 5 * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5), 9.5 + 5 * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5)]);
      poly(c, x, y, s, pts, '#ffd1dc', '#c46a86');
      circle(c, x, y, s, 3, 12.5, 1.6, '#ff7b72'); circle(c, x, y, s, 13, 12.5, 1.6, '#ff7b72');   // 2 つの C=O
      dot(c, x, y, s, 6, 8.5, 1, 2, '#111'); dot(c, x, y, s, 9, 8.5, 1, 2, '#111');
    },
    // ジシクロ兄弟（勝手にくっついた 2 つの五角形）
    dicyclo(c, x, y, s) {
      [[5, '#7fb88a'], [11, '#6aa877']].forEach(([cx, col]) => {
        const pts = [...Array(5)].map((_, i) => [cx + 4.2 * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5), 10 + 4.2 * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5)]);
        poly(c, x, y, s, pts, col, '#2f5e3a');
        dot(c, x, y, s, cx - 1.5, 9, 1, 1.5, '#111'); dot(c, x, y, s, cx + 0.5, 9, 1, 1.5, '#111');
      });
    },
    // ラセマイザー：フードと、鏡の仮面
    racemizer(c, x, y, s) {
      poly(c, x, y, s, [[8, 0], [14, 6], [14.5, 16], [1.5, 16], [2, 6]], '#2a1a3f', '#6b4fb0');
      const g = c.createLinearGradient(x + s * 0.3, y + s * 0.15, x + s * 0.7, y + s * 0.6);
      g.addColorStop(0, '#f4f8ff'); g.addColorStop(0.5, '#a9b8d6'); g.addColorStop(1, '#e6eeff');
      c.fillStyle = g; c.beginPath(); c.ellipse(x + s * 0.5, y + s * 0.36, s * 0.2, s * 0.24, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#d4af37'; c.lineWidth = Math.max(1, s / 16); c.stroke();
      dot(c, x, y, s, 6, 3, 1, 4, 'rgba(255,255,255,.9)');
      dot(c, x, y, s, 7.75, 11, 0.5, 5, '#6b4fb0');
    },
    // アキラル：光を浴びた姿 / 手をほどいた姿
    achiralLit(c, x, y, s) {
      CHAR.achiral(c, x, y, s);
      c.save(); c.globalAlpha = 0.35; c.fillStyle = '#b48cff'; c.beginPath(); c.arc(x + s / 2, y + s / 2, s * 0.55, 0, Math.PI * 2); c.fill(); c.restore();
      dot(c, x, y, s, 7.75, 1, 0.5, 15, '#ff9bd2');                // 鏡面がゆらぐ
    },
    achiralOpen(c, x, y, s) {
      poly(c, x, y, s, [[8, 6], [13.5, 16], [2.5, 16]], '#f4f4f4', '#bbb');
      poly(c, x, y, s, [[8, 6], [13.5, 16], [11, 16], [8, 9]], '#d8d8d8');   // 裂けたローブ
      dot(c, x, y, s, 5, 2, 6, 6, '#f1e4d0'); dot(c, x, y, s, 5, 1, 6, 2, '#e8e8e8');
      dot(c, x, y, s, 6, 4, 1, 1, '#222'); dot(c, x, y, s, 9, 4, 1, 1, '#222');
      dot(c, x, y, s, 2.5, 10, 2.5, 2, '#f1e4d0'); dot(c, x, y, s, 11, 10, 2.5, 2, '#f1e4d0');   // ほどいた両手
    },
    // 回転の扉（左のハンドル・扉・右のハンドル）
    rotDoorL(c, x, y, s) { rotHandle(c, x, y, s); },
    rotDoorR(c, x, y, s) { rotHandle(c, x, y, s); },
    rotDoorC(c, x, y, s) {
      dot(c, x, y, s, 0, 0, 16, 16, '#c9d3e6'); dot(c, x, y, s, 0, 0, 16, 2, '#d4af37'); dot(c, x, y, s, 0, 14, 16, 2, '#d4af37');
      circle(c, x, y, s, 8, 8, 5, null, '#6b7896'); circle(c, x, y, s, 8, 8, 2.5, '#8fa8cc', '#d4af37');
      poly(c, x, y, s, [[3, 6], [5, 3], [6, 6.5]], '#6b7896'); poly(c, x, y, s, [[13, 10], [11, 13], [10, 9.5]], '#6b7896');
    },
    // 回廊の小部屋の分子（鏡面を持つ cis 体 / C₂ だけの trans 体）
    molMeso(c, x, y, s) { ringWithMethyls(c, x, y, s, false); },
    molChiral(c, x, y, s) { ringWithMethyls(c, x, y, s, true); },

    // ---- 第 5 章 ----
    // ボーカ：カーボを鏡に映した姿。仲間の色の並びも左右が逆。縁は紫
    boka(c, x, y, s, o = {}) {
      c.save(); c.translate(x + s, y); c.scale(-1, 1);
      CHAR.hero(c, 0, 0, s, { colors: o.colors, dir: 'down', body: '#241a36', rim: '#c9a8ff', eye: '#ffffff' });
      c.restore();
    },
    // 仮面にひびの入ったラセマイザー
    racemizerCrack(c, x, y, s) {
      CHAR.racemizer(c, x, y, s);
      c.strokeStyle = '#2a1a3f'; c.lineWidth = Math.max(1, s / 14);
      c.beginPath(); c.moveTo(x + s * 0.5, y + s * 0.13); c.lineTo(x + s * 0.44, y + s * 0.32); c.lineTo(x + s * 0.56, y + s * 0.42); c.lineTo(x + s * 0.48, y + s * 0.6);
      c.moveTo(x + s * 0.44, y + s * 0.32); c.lineTo(x + s * 0.34, y + s * 0.3); c.stroke();
    },
    // ラセミ団員：鏡の仮面（半分が反転した色）
    racemi(c, x, y, s) {
      person(c, x, y, s, { cloth: '#3a4f5f', mask: true });
      c.fillStyle = 'rgba(120, 200, 255, .45)'; c.fillRect(x + s * 0.5, y + s * 0.125, s * 0.19, s * 0.375);
    },
    racemiDuo(c, x, y, s) {
      CHAR.racemi(c, x - s * 0.28, y, s);
      c.save(); c.translate(x + s * 1.28, y); c.scale(-1, 1); CHAR.racemi(c, 0, 0, s); c.restore();
    },
    // 油状のオイル：結晶にならなかった、とろりとした人
    oil(c, x, y, s) {
      const u = s / 16;
      c.fillStyle = '#d9b44a'; c.beginPath(); c.ellipse(x + 8 * u, y + 10.5 * u, 6 * u, 5 * u, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(x + 8 * u, y + 6.5 * u, 4 * u, 4 * u, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255, 245, 200, .7)'; c.beginPath(); c.ellipse(x + 6.5 * u, y + 5 * u, 1.4 * u, 0.9 * u, 0, 0, Math.PI * 2); c.fill();
      dot(c, x, y, s, 3, 14, 1.5, 2, '#d9b44a'); dot(c, x, y, s, 11.5, 14.5, 1.5, 1.5, '#d9b44a');   // したたり
      dot(c, x, y, s, 6.2, 6.4, 1, 1, '#4a3a10'); dot(c, x, y, s, 8.8, 6.4, 1, 1, '#4a3a10');
    },
    // L-グルコースの子（六員環の帽子をかぶった小さな子）
    glucose(c, x, y, s) {
      c.save(); c.translate(x + s * 0.15, y + s * 0.3); person(c, 0, 0, s * 0.7, { cloth: '#ff9ec4', hair: '#f4e3c0', long: true, dress: true }); c.restore();
      const pts = [...Array(6)].map((_, i) => [8 + 3 * Math.cos(i * Math.PI / 3), 3.2 + 1.6 * Math.sin(i * Math.PI / 3)]);
      poly(c, x, y, s, pts, '#fff4fa', '#d56a9a');
    },
    // D-アミノ酸の子どもたち
    aminoKids(c, x, y, s) {
      c.save(); c.translate(x - s * 0.05, y + s * 0.3); person(c, 0, 0, s * 0.66, { cloth: '#8fd16a', hair: '#3a2a1a' }); c.restore();
      c.save(); c.translate(x + s * 0.42, y + s * 0.34); person(c, 0, 0, s * 0.62, { cloth: '#6ac0d1', hair: '#7a4b25', long: true }); c.restore();
    },
    // (R)-イブプロフェン（薬師イブと同じ形で、色が逆）
    ibuR(c, x, y, s) {
      person(c, x, y, s, { cloth: '#3a2a1a', hair: '#f4f4f4', long: true });
      dot(c, x, y, s, 7, 9, 2, 2, '#9aa0aa'); dot(c, x, y, s, 7.5, 8.5, 1, 3, '#9aa0aa');
    },
    // ホスフィンオキシド（P=O のまわりに、3 つのベンゼン環）
    tppo(c, x, y, s) {
      for (const [cx, cy] of [[3.5, 11], [12.5, 11], [8, 3.5]]) {
        const pts = [...Array(6)].map((_, i) => [cx + 3 * Math.cos(Math.PI / 6 + i * Math.PI / 3), cy + 3 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
        poly(c, x, y, s, pts, '#eef0f4', '#6b7280');
      }
      circle(c, x, y, s, 8, 9.5, 2.6, '#ffa657', '#8a4a1a');
      circle(c, x, y, s, 8, 14.6, 1.4, '#ff7b72', '#8a1d18');                 // P=O の O
      dot(c, x, y, s, 7, 9, 0.8, 0.8, '#111'); dot(c, x, y, s, 8.4, 9, 0.8, 0.8, '#111');
    },
    // シクロブタジエンの双子（くっついて離れられない 2 つの四角）
    cbd(c, x, y, s) {
      poly(c, x, y, s, [[1, 6], [7, 6], [7, 12], [1, 12]], '#ffb3a7', '#a8463a');
      poly(c, x, y, s, [[9, 6], [15, 6], [15, 12], [9, 12]], '#ffb3a7', '#a8463a');
      dot(c, x, y, s, 7, 8.5, 2, 1, '#a8463a');
      dot(c, x, y, s, 3, 8, 1, 1.5, '#111'); dot(c, x, y, s, 5, 8, 1, 1.5, '#111'); dot(c, x, y, s, 11, 8, 1, 1.5, '#111'); dot(c, x, y, s, 13, 8, 1, 1.5, '#111');
    },
    // フェニルエチルアミンの姉 (R) と弟 (S)。アミンの青い手が、左右逆についている
    peaR(c, x, y, s) { pea(c, x, y, s, true); },
    peaS(c, x, y, s) { pea(c, x, y, s, false); },
    // クレゾールのおじさん（フェノール類。のんびり屋）
    cresol(c, x, y, s) {
      person(c, x, y, s, { cloth: '#8a6a4a', hair: '#9a9a9a' });
      const pts = [...Array(6)].map((_, i) => [8 + 2.6 * Math.cos(Math.PI / 6 + i * Math.PI / 3), 11 + 2.6 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
      poly(c, x, y, s, pts, '#f4f1e8', '#5a4a2a');
      circle(c, x, y, s, 12.5, 9, 1.2, '#ff7b72');   // OH
    },
    // マンデル酸の番人（鍵穴の番をして、動かない）
    mandel(c, x, y, s) {
      person(c, x, y, s, { cloth: '#7a3a6a', coat: '#4a1f40', hair: '#2a2a2a', helmet: true });
      circle(c, x, y, s, 12.5, 9, 1.4, '#ff7b72', '#8a1d18');   // COOH
      dot(c, x, y, s, 2, 6, 1, 9, '#d4af37');                    // 番人の杖
    },
    // 廃液街の、結晶の街灯
    lamp(c, x, y, s) {
      dot(c, x, y, s, 7, 7, 2, 9, '#5d6b63'); dot(c, x, y, s, 5, 14, 6, 2, '#3a4547');
      c.save(); c.shadowColor = '#9fe0ff'; c.shadowBlur = s / 2;
      poly(c, x, y, s, [[8, 0], [11, 4], [8, 8], [5, 4]], '#d8f4ff', '#7fc4e8');
      c.restore();
      dot(c, x, y, s, 7, 2, 1, 3, '#ffffff');
    },
    // pH のポンプ（酸・弱い塩基・強い塩基で色が違う）
    pumpAcid(c, x, y, s) { pump(c, x, y, s, '#ff6b6b', 'HCl'); },
    pumpBicarb(c, x, y, s) { pump(c, x, y, s, '#8fd16a', 'HCO₃'); },
    pumpBase(c, x, y, s) { pump(c, x, y, s, '#79c0ff', 'NaOH'); },
    // 飽和食塩水の蛇口
    brineTap(c, x, y, s) {
      dot(c, x, y, s, 4, 6, 8, 9, '#c9d3e6'); dot(c, x, y, s, 4, 6, 8, 2, '#f4f8ff');
      dot(c, x, y, s, 11, 9, 4, 2, '#8a96b0'); dot(c, x, y, s, 13.5, 11, 1, 2, '#9fd0ff');
      dot(c, x, y, s, 6, 2, 4, 4, '#8a96b0'); dot(c, x, y, s, 5, 1, 6, 1.5, '#5a6680');
      c.fillStyle = '#2a3247'; c.font = `bold ${Math.round(s * 0.28)}px sans-serif`; c.textAlign = 'center'; c.fillText('Na', x + s * 0.5, y + s * 0.82);
    },
    // 界面のはしご（泡がたまると使えない）
    ladder(c, x, y, s) { ladderArt(c, x, y, s, false); },
    ladderFoam(c, x, y, s) { ladderArt(c, x, y, s, true); },
    // キラルな鍵穴の扉（鍵穴の形で、合う分子がわかる）
    lockS(c, x, y, s) { lockDoor(c, x, y, s, '#79c0ff', false); },
    lockR(c, x, y, s) { lockDoor(c, x, y, s, '#ff9ec4', true); },
    lockIbu(c, x, y, s) { lockDoor(c, x, y, s, '#9aa0aa', true); },
    lockOwn(c, x, y, s) { lockDoor(c, x, y, s, '#ffe066', null); },
  };
  function pea(c, x, y, s, right) {
    c.save(); c.translate(x + s * 0.12, y + s * 0.22);
    person(c, 0, 0, s * 0.76, right ? { cloth: '#ff9ec4', hair: '#5a3a1e', long: true, dress: true } : { cloth: '#79c0ff', hair: '#5a3a1e' });
    c.restore();
    circle(c, x, y, s, right ? 13.5 : 2.5, 9.5, 1.5, '#79c0ff', '#2f5f8f');   // NH₂ の手（姉は右、弟は左）
  }
  function pump(c, x, y, s, col, letter) {
    dot(c, x, y, s, 3, 3, 10, 12, '#5d6b6e'); dot(c, x, y, s, 3, 3, 10, 2, '#8a9692');
    c.save(); c.shadowColor = col; c.shadowBlur = s / 5; dot(c, x, y, s, 5, 6, 6, 5, col); c.restore();
    dot(c, x, y, s, 7, 0, 2, 3, '#8a9692'); dot(c, x, y, s, 6, 0, 4, 1, '#c9d3e6');
    c.fillStyle = '#10181a'; c.font = `bold ${Math.round(s * (letter.length > 3 ? 0.2 : 0.24))}px sans-serif`; c.textAlign = 'center'; c.fillText(letter, x + s * 0.5, y + s * 0.64);
  }
  function ladderArt(c, x, y, s, foam) {
    dot(c, x, y, s, 3, 0, 1.5, 16, '#c9a227'); dot(c, x, y, s, 11.5, 0, 1.5, 16, '#c9a227');
    for (let i = 0; i < 4; i++) dot(c, x, y, s, 3, 2 + i * 4, 10, 1.2, '#e6c75a');
    if (foam) for (let i = 0; i < 7; i++) circle(c, x, y, s, 2 + (i * 5) % 12, 3 + (i * 7) % 11, 2 + (i % 3) * 0.6, 'rgba(250, 250, 255, .9)', '#c9d3e6');
  }
  function lockDoor(c, x, y, s, col, right) {
    dot(c, x, y, s, 0, 0, 16, 16, '#3a4446'); dot(c, x, y, s, 1, 1, 14, 15, '#56625f');
    dot(c, x, y, s, 1, 1, 14, 1, col);
    c.save(); c.shadowColor = col; c.shadowBlur = s / 5;
    circle(c, x, y, s, 8, 6.5, 2.6, '#10181a', col);
    if (right === null) poly(c, x, y, s, [[8, 8], [10.5, 14], [5.5, 14]], '#10181a', col);           // カーボの形（4 本の手）
    else poly(c, x, y, s, right ? [[7, 8], [11.5, 13.5], [7, 14]] : [[9, 8], [4.5, 13.5], [9, 14]], '#10181a', col);   // 右向き・左向きの鍵穴
    c.restore();
  }
  function bullvalene(c, x, y, s, k) {
    // 3 本の腕（形が変わるたびに、二重結合の位置が回る）
    const base = [[8, 2], [2.5, 12.5], [13.5, 12.5]];
    circle(c, x, y, s, 8, 9, 3, '#c79bff', '#5a3a8a');
    base.forEach(([bx, by], i) => {
      c.strokeStyle = (i === k) ? '#ffe066' : '#8a6abf'; c.lineWidth = Math.max(1, s / 8);
      c.beginPath(); c.moveTo(x + 8 * s / 16, y + 9 * s / 16); c.lineTo(x + bx * s / 16, y + by * s / 16); c.stroke();
      circle(c, x, y, s, bx, by, 2, '#a07ae0', '#5a3a8a');
    });
    dot(c, x, y, s, 6.5, 8.5, 1, 0.6, '#111'); dot(c, x, y, s, 8.5, 8.5, 1, 0.6, '#111');   // 眠そうな目
  }
  function rotHandle(c, x, y, s) {
    dot(c, x, y, s, 0, 0, 16, 16, '#8a96b0'); dot(c, x, y, s, 0, 0, 16, 2, '#d4af37'); dot(c, x, y, s, 0, 14, 16, 2, '#d4af37');
    circle(c, x, y, s, 8, 8, 5.5, null, '#d4af37');
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; c.strokeStyle = '#d4af37'; c.lineWidth = Math.max(1, s / 12); c.beginPath(); c.moveTo(x + s / 2, y + s / 2); c.lineTo(x + s / 2 + Math.cos(a) * s * 0.34, y + s / 2 + Math.sin(a) * s * 0.34); c.stroke(); }
    circle(c, x, y, s, 8, 8, 1.6, '#f2cc60');
  }
  function ringWithMethyls(c, x, y, s, trans) {
    const pts = [...Array(6)].map((_, i) => [8 + 5 * Math.cos(Math.PI / 6 + i * Math.PI / 3), 9 + 5 * Math.sin(Math.PI / 6 + i * Math.PI / 3)]);
    poly(c, x, y, s, pts, '#e8f0ff', '#6b7896');
    circle(c, x, y, s, 3.5, 4, 1.6, '#ffb347');
    circle(c, x, y, s, trans ? 12.5 : 12.5, trans ? 14 : 4, 1.6, '#ffb347');
    if (!trans) dot(c, x, y, s, 7.75, 1, 0.5, 15, 'rgba(120,140,190,.6)');    // 鏡面
    dot(c, x, y, s, 6.5, 8.5, 1, 1, '#111'); dot(c, x, y, s, 8.5, 8.5, 1, 1, '#111');
  }

  function drawChar(ctx, id, x, y, s, o) { (CHAR[id] || CHAR.victim)(ctx, x, y, s, o); }

  return { drawTile, drawChar, SOLID, TILE_IDS: Object.keys(TILE), CHAR_IDS: Object.keys(CHAR) };
})();
