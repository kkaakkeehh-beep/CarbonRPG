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
  const PATHLIKE = new Set([',', '=', 'D', 'E']);
  const WATERLIKE = new Set(['~', '=']);
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
  };
  const SOLID = new Set(['T', '~', 'M', 'r', '#', 'B', 'S', 'F', 'W', 'R', 'h', 'E']);

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
      circle(c, x, y, s, 8, 8.5, 5, '#2b2f3a', '#fff');
      const d = o.dir || 'down';
      const ex = d === 'left' ? -1.2 : d === 'right' ? 1.2 : 0, ey = d === 'up' ? -1.5 : 0;
      if (d !== 'up') { dot(c, x, y, s, 6 + ex, 7.5 + ey, 1, 2, '#fff'); dot(c, x, y, s, 9 + ex, 7.5 + ey, 1, 2, '#fff'); }
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
  };

  function drawChar(ctx, id, x, y, s, o) { (CHAR[id] || CHAR.victim)(ctx, x, y, s, o); }

  return { drawTile, drawChar, SOLID, TILE_IDS: Object.keys(TILE) };
})();
