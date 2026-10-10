// =============================================================
// game.js — 画面の切り替え、マップ探索、台本の再生、問題バトル、
//           成長と購買部、復習ノート、セーブ
// =============================================================
(() => {
  const { COMPANIONS, SKILL_MAX, ITEMS, SHOP, COMP_PRICE, ENEMIES, RANDOM_ENEMIES, expToNext, HP_PER_LV } = GameData;
  const { MAPS } = Maps;
  const { SCENES } = Story;
  const TILE = 32, VW = 15, VH = 11, STEP_MS = 140;
  const SAVE_KEY = 'carbonrpg-save-v2';
  const BASE_HP = 30;
  const GAME_URL = 'https://kkaakkeehh-beep.github.io/CarbonRPG/';
  const app = document.getElementById('app');

  let S = null;   // セーブされる状態
  const UI = { screen: 'title', scene: null, msg: null, menu: false, shop: false, battle: null, move: null, held: null, steps: 0, fx: [] };

  // ---- 小物 -----------------------------------------------------
  const comp = id => COMPANIONS.find(c => c.id === id);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const unesc = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const opp = c => c === 'R' ? 'S' : 'R';
  // 〈脱離〉：パーティーの中で、いちばんよい脱離基の仲間（続編で最初に離れていく仲間）
  const fill = t => t.replace(/〈自分〉/g, S && S.cfg ? `(${S.cfg})` : '').replace(/〈逆〉/g, S && S.cfg ? `(${opp(S.cfg)})` : '').replace(/〈脱離〉/g, () => leaverName());
  const resolve = (v, ...a) => typeof v === 'function' ? v(...a) : v;
  const map = () => MAPS[S.map];
  const heroName = () => S.cfg ? `(${S.cfg})-カーボ` : 'カーボ';
  // 脱離能の順（共役酸の pKa の小さい順：HI < HN₃ < MeSH < H₂O < t-BuOH < Ph₂PH。ケイ素とスズは陰イオンとしてはほとんど離れない）
  const LEAVE_ORDER = ['iodo', 'azy', 'thio', 'oxy', 'buto', 'phos', 'tin', 'tms'];
  function leaverName() {
    const id = S && LEAVE_ORDER.find(x => S.party.includes(x));
    return id ? comp(id).name : '仲間';
  }
  const yen = n => `${n} 円`;

  function freshState(diff) {
    return {
      diff, party: [], owned: [], cfg: null, hp: BASE_HP, maxHp: BASE_HP, lv: 1, exp: 0, money: 0, skillLv: {},
      items: { coffee: 1, energy: 0, book: 0 }, map: 'lab', x: 5, y: 5, dir: 'up',
      flags: {}, used: {}, stats: { correct: 0, total: 0 }, chStats: {}, notebook: {}, topics: {}, ch: 1,
      flip5: true,   // 第 5 章のマップを折り返したあとのセーブ（fixDistrict）
    };
  }
  // 古いセーブにない項目を補う
  function normalize(s) {
    const d = freshState(s.diff || 2);
    for (const k of Object.keys(d)) if (s[k] === undefined && k !== 'flip5') s[k] = d[k];
    for (const id of s.party) if (!s.skillLv[id]) s.skillLv[id] = 1;
    for (const id of s.party) if (!s.owned.includes(id)) s.owned.push(id);
    for (const id of Object.keys(ITEMS)) if (s.items[id] === undefined) s.items[id] = 0;
    // 問題の ID が変わったときに、ノートや出題の記録に残った古い ID を消す（練習で読み込めず止まらないように）
    const ids = new Set(Questions.LIST.map(q => q.id));
    for (const book of [s.notebook, s.used]) for (const id of Object.keys(book)) if (!ids.has(id)) delete book[id];
    fixDistrict(s);
    return s;
  }
  // 第 5 章のマップを上下（タンクは左右）に折り返す前のセーブ：住人やカーボが、壁・閉じた扉・別の部屋に入ってしまう。
  // おかしな場所にいたら、位置を折り返す。それでも合わない住人の部屋は、はじめに戻す
  const FLIP5 = { boeki: 14, bridge5: 12, orgL: 15, aqL: 15, haikan: 14, hiroba: 13, hoshi: 11, hannou: 13 };
  function fixDistrict(s) {
    const E = Maps.EXTRACT, solidAt = (mid, x, y) => { const ch = MAPS[mid].grid[y] && MAPS[mid].grid[y][x]; return !ch || Sprites.SOLID.has(ch); };
    const okAt = (id, p) => {
      const mid = E.maps[p.layer];
      return !solidAt(mid, p.x, p.y) && E.roomAt(p.y) === E.residents[id].room
        && !MAPS[mid].events.some(e => e.x === p.x && e.y === p.y && e.on === 'bump' && (!e.when || e.when(s.flags)));
    };
    const first = !s.flip5; s.flip5 = true;
    if (first && MAPS[s.map] && solidAt(s.map, s.x, s.y)) {
      if (FLIP5[s.map] && !solidAt(s.map, s.x, FLIP5[s.map] - 1 - s.y)) s.y = FLIP5[s.map] - 1 - s.y;
      else if (s.map === 'tank5' && !solidAt(s.map, 12 - s.x, s.y)) s.x = 12 - s.x;
    }
    if (!s.c5x) return;
    const res = Object.entries(s.c5x.res);
    if (first && !res.every(([id, p]) => okAt(id, p))) {
      const flipped = res.map(([id, p]) => [id, { x: p.x, y: 14 - p.y, layer: p.layer }]);
      if (flipped.every(([id, p]) => okAt(id, p))) { s.c5x.res = Object.fromEntries(flipped); s.c5x.follow = null; }
    }
    for (const r of E.rooms) if (Object.entries(s.c5x.res).some(([id, p]) => E.residents[id].room === r.id && !okAt(id, p))) E.resetRoom(s.c5x, r.id);
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 保存できない環境でも遊べる */ } }
  function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }

  const maxHpFor = (lv, cfg) => BASE_HP + (lv - 1) * HP_PER_LV + (cfg === 'S' ? 10 : 0);
  const skillLv = id => S.skillLv[id] || 1;
  const priceOf = c => c.price || COMP_PRICE;
  // 付け替えでは R/S を変えない（物語で決まっている）。逆になる並びなら、くさびと破線の仲間を入れ替える
  const keepCfg = () => { if (UI.swap && UI.pick.length === 4 && heroCfg(UI.pick) !== S.cfg) [UI.pick[2], UI.pick[3]] = [UI.pick[3], UI.pick[2]]; };
  const skillAt = (id, lv = skillLv(id)) => comp(id).skill.lv[lv - 1];

  // ---- カーボの立体（CIP） ----------------------------------------
  // スロット: 0 上(紙面) / 1 左下(紙面) / 2 くさび(手前) / 3 破線(奥)
  const SLOT3D = [[0, 1, 0], [-0.943, -0.333, 0], [0.471, -0.333, 0.816], [0.471, -0.333, -0.816]];
  const cmpRank = (x, y) => (x[0] - y[0]) || (x[1] - y[1]);
  function heroCfg(party) {
    if (party.length < 4) return null;
    const order = [0, 1, 2, 3].sort((a, b) => cmpRank(comp(party[b]).rank, comp(party[a]).rank));
    const v = order.map(i => SLOT3D[i]);
    const d = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
    const a = d(v[0], v[3]), b = d(v[1], v[3]), c = d(v[2], v[3]);
    const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    return det < 0 ? 'R' : 'S';
  }
  const heroFormula = party => 'C' + [...party].sort((a, b) => cmpRank(comp(b).rank, comp(a).rank)).map(id => `(${comp(id).group})`).join('');

  function heroSvg(party, size = 220) {
    const P = [[110, 22], [28, 150], [170, 170], [196, 92]];
    const C = [110, 110];
    const bond = i => {
      const [x, y] = P[i];
      const ex = C[0] + (x - C[0]) * 0.72, ey = C[1] + (y - C[1]) * 0.72;
      if (i < 2) return `<line x1="${C[0]}" y1="${C[1]}" x2="${ex}" y2="${ey}" stroke="#fff" stroke-width="3"/>`;
      const dx = ex - C[0], dy = ey - C[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      if (i === 2) return `<polygon points="${C[0]},${C[1]} ${ex + nx * 8},${ey + ny * 8} ${ex - nx * 8},${ey - ny * 8}" fill="#fff"/>`;
      let s = '';
      for (let t = 0.15; t <= 1.001; t += 0.14) {
        const px = C[0] + dx * t, py = C[1] + dy * t, w = 8 * t;
        s += `<line x1="${px + nx * w}" y1="${py + ny * w}" x2="${px - nx * w}" y2="${py - ny * w}" stroke="#fff" stroke-width="2"/>`;
      }
      return s;
    };
    const node = i => {
      const c = party[i] ? comp(party[i]) : null, [x, y] = P[i];
      if (!c) return `<g><circle cx="${x}" cy="${y}" r="20" fill="#000" stroke="#666" stroke-dasharray="4 3" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="#666" font-size="14">空</text></g>`;
      return `<g data-act="unbond" data-arg="${i}" style="cursor:pointer;color:${c.color}"><circle cx="${x}" cy="${y}" r="21" fill="#000" stroke="currentColor" stroke-width="2.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="currentColor" font-size="${c.group.length > 3 ? 10 : 13}">${c.group}</text></g>`;
    };
    return `<svg class="hero" viewBox="0 0 220 220" width="${size}" height="${size}" role="img" aria-label="カーボと4つの結合">
      ${[0, 1, 2, 3].map(bond).join('')}
      <circle cx="${C[0]}" cy="${C[1]}" r="22" fill="#111" stroke="#fff" stroke-width="3"/>
      <text x="${C[0]}" y="${C[1] + 7}" text-anchor="middle" fill="#fff" font-size="22">C</text>
      ${[0, 1, 2, 3].map(node).join('')}
    </svg>`;
  }

  // =================================================================
  // 画面
  // =================================================================
  function render() {
    stopTyping();
    const fn = { title: vTitle, diff: vDiff, dev: vDev, party: vParty, world: vWorld, battle: vBattle, over: vOver, clear: vClear, note: vNote, ending: vEnding }[UI.screen];
    app.innerHTML = fn();
    if (UI.screen === 'world') { setupCanvas(); renderOverlay(); }
    if (UI.screen === 'battle') { drawEnemy(); drawTalkFaces(); startTyping(); }
    if (UI.screen === 'ending') drawEnding();
    Mol.drawAll(app);
    applyFx();
    Sound.bgm(musicFor());
  }
  function musicFor() {
    if (UI.screen === 'battle') return UI.battle && ENEMIES[UI.battle.key].boss ? 'boss' : UI.battle && UI.battle.key === 'practice' ? 'town' : 'battle';
    if (UI.screen === 'world') {
      if (MAPS[S.map].bgm) return resolve(MAPS[S.map].bgm, S.flags);
      if (S.map === 'forest') return S.flags.boss ? 'town' : 'forest';
      if (MAPS[S.map].ch === 2) return S.flags.night ? 'night' : 'port';
      if (MAPS[S.map].ch === 3) return 'kingdom';
      return 'town';
    }
    if (UI.screen === 'ending') return 'mirror';
    if (UI.screen === 'over' || UI.screen === 'clear') return null;
    return 'town';
  }
  const win = (inner, cls = '') => `<section class="win ${cls}">${inner}</section>`;
  const muteBtn = () => `<button class="btn small-btn" data-act="mute">${Sound.isMuted() ? '♪ 音: OFF' : '♪ 音: ON'}</button>`;

  function vTitle() {
    const sv = loadSave();
    const where = sv && MAPS[sv.map] ? `${MAPS[sv.map].name}　Lv${sv.lv || 1}` : '';
    return `<div class="title-screen">
      <div class="title-hero">
        <canvas id="tcv" width="320" height="168" aria-hidden="true"></canvas>
        <div class="title-logo" data-act="devTap">
          <h1 class="logo" data-text="CarbonRPG">CarbonRPG</h1>
          <p class="logo-sub">炭 素 の 勇 者</p>
        </div>
      </div>
      <p class="title-chapter">全 5 章（第5章「廃液街」で完結）</p>
      <div class="title-menu">
        <button class="tbtn" data-act="newGame">はじめから</button>
        ${sv ? `<button class="tbtn" data-act="continue">つづきから<small>${esc(where)}</small></button>` : ''}
      </div>
      ${win(`<p class="story">炭素の国カルボニア。原子たちは手を取り合い、分子となって穏やかに暮らしていた。</p>
        <p class="story">ところがある日、森の分子たちが次々と「平ら」にされ、利き手を失いはじめた。</p>
        <p class="story">闇の組織「メソ教団」。その名が、ささやかれている。</p>`, 'msg title-story')}
      <div class="center">${muteBtn()}</div>
      <p class="small dim center">化学がわかる人向けの有機化学 RPG（試作版）。問題に正解すると敵にダメージ、間違えると自分がダメージを受けます。</p>
    </div>`;
  }

  // ---- タイトルの絵（夜空に回る sp³ の正四面体と、これまでの章の景色） ----
  const TITLE_COLORS = ['#ff7b72', '#79c0ff', '#f2cc60', '#d2a8ff'];
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawTitle(now) {
    const c = document.getElementById('tcv');
    if (!c) return;
    const g = c.getContext('2d'), W = c.width, H = c.height, t = reduceMotion ? 4 : now / 1000;
    g.imageSmoothingEnabled = false;
    const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    // 夜空
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#05071a'); sky.addColorStop(0.55, '#16113a'); sky.addColorStop(1, '#2b1a4f');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + rnd(i + 99)) + i));
      g.fillStyle = `rgba(255,255,255,${a * (rnd(i + 7) < 0.15 ? 1 : 0.6)})`;
      g.fillRect(Math.floor(rnd(i) * W), Math.floor(rnd(i + 50) * H * 0.7), rnd(i + 7) < 0.15 ? 2 : 1, 1);
    }
    // 漂う小さな六角形（芳香族のかけら）
    for (let i = 0; i < 9; i++) {
      const x = (rnd(i + 300) * W + t * 4 * (0.5 + rnd(i + 310))) % W, y = H - ((t * 6 * (0.4 + rnd(i + 320)) + rnd(i + 330) * H) % H);
      g.strokeStyle = `rgba(170,190,255,${0.12 + 0.1 * rnd(i)})`; g.lineWidth = 1;
      g.beginPath();
      for (let k = 0; k <= 6; k++) { const an = k * Math.PI / 3 + t * 0.3; const px = x + 3 * Math.cos(an), py = y + 3 * Math.sin(an); k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    }
    // 正四面体（中心の炭素と、4 本の手）
    const cx = W / 2, cy = 60, R = 34, ay = t * 0.7, ax = 0.42;
    const V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(v => v.map(n => n / Math.sqrt(3)));
    const P = V.map(([x, y, z]) => {
      const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay);
      const y2 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
      const k = 1 + z2 * 0.18;
      return { x: cx + x1 * R * k, y: cy - y2 * R * k, z: z2 };
    });
    const glow = g.createRadialGradient(cx, cy, 2, cx, cy, 46);
    glow.addColorStop(0, 'rgba(255,215,94,.35)'); glow.addColorStop(1, 'rgba(255,215,94,0)');
    g.fillStyle = glow; g.fillRect(cx - 50, cy - 50, 100, 100);
    // 4 つの手の先どうしを結ぶ、うっすらした辺
    g.strokeStyle = 'rgba(200,210,255,.18)'; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { g.beginPath(); g.moveTo(P[i].x, P[i].y); g.lineTo(P[j].x, P[j].y); g.stroke(); }
    const order = [0, 1, 2, 3].sort((a, b) => P[a].z - P[b].z);
    const atom = i => {
      const p = P[i], r = 5 + p.z * 1.6;
      g.fillStyle = TITLE_COLORS[i]; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(Math.round(p.x - r / 2), Math.round(p.y - r / 2), 2, 2);
    };
    const bond = i => { g.strokeStyle = `rgba(255,255,255,${0.55 + P[i].z * 0.4})`; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(P[i].x, P[i].y); g.stroke(); };
    order.filter(i => P[i].z < 0).forEach(i => { bond(i); atom(i); });
    g.fillStyle = '#151a28'; g.beginPath(); g.arc(cx, cy, 8, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#fff'; g.font = 'bold 10px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('C', cx, cy + 0.5);
    order.filter(i => P[i].z >= 0).forEach(i => { bond(i); atom(i); });
    // 遠くの丘
    const hill = (base, amp, col, seed) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x / 37 + seed)) - amp * 0.4 * Math.sin(x / 13 + seed * 2));
      g.lineTo(W, H); g.closePath(); g.fill();
    };
    hill(126, 10, '#141a3a', 1);
    // 第 1 章：求核の森（左）
    for (let i = 0; i < 9; i++) {
      const x = 8 + i * 9 + rnd(i + 400) * 4, h = 14 + rnd(i + 410) * 10, y = 130;
      g.fillStyle = '#0d2a2a'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 7, y); g.lineTo(x - 7, y); g.closePath(); g.fill();
    }
    // 第 2 章：灯台と、回る光（中央右）
    // 光は回転しているので、左右に伸び縮みして見える
    const lx = 236, ly = 132, top = ly - 31, len = 70 * Math.cos(t * 0.8);
    const bg = g.createLinearGradient(lx, 0, lx + len, 0);
    bg.addColorStop(0, 'rgba(255,236,160,.45)'); bg.addColorStop(1, 'rgba(255,236,160,0)');
    g.fillStyle = bg; g.beginPath(); g.moveTo(lx, top); g.lineTo(lx + len, top - 7); g.lineTo(lx + len, top + 7); g.closePath(); g.fill();
    g.fillStyle = '#3a4060'; g.fillRect(lx - 3, ly - 28, 6, 28);
    g.fillStyle = '#7a3a4a'; g.fillRect(lx - 3, ly - 21, 6, 3); g.fillRect(lx - 3, ly - 11, 6, 3);
    g.fillStyle = '#ffe58a'; g.fillRect(lx - 2, ly - 33, 4, 4);
    // 第 3 章：六角形の城と、6 本の光の柱（右）
    const hx = 292, hy = 126;
    for (let k = 0; k < 6; k++) {
      const px = hx - 15 + k * 6, a = 0.2 + 0.14 * Math.sin(t * 1.4 + k);
      const pg = g.createLinearGradient(0, hy - 80, 0, hy - 14);
      pg.addColorStop(0, 'rgba(170,200,255,0)'); pg.addColorStop(1, `rgba(170,200,255,${a})`);
      g.fillStyle = pg; g.fillRect(px, hy - 80, 2, 66);
    }
    g.fillStyle = '#262c55'; g.beginPath();
    for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; const px = hx + 22 * Math.cos(an), py = hy - 6 + 8 * Math.sin(an); k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath(); g.fill();
    g.fillRect(hx - 7, hy - 24, 14, 18); g.fillRect(hx - 2, hy - 31, 4, 7);
    g.fillStyle = '#ffd75e';
    for (const [wx, wy] of [[-4, -19], [2, -19], [-1, -13], [-14, -7], [11, -7]]) g.fillRect(hx + wx, hy + wy, 2, 2);
    // 手前の丘と、カーボ
    hill(148, 6, '#0b0f24', 4);
    const bob = reduceMotion ? 0 : Math.round(Math.sin(t * 2.2));
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(cx - 9, 145, 18, 2);
    Sprites.drawChar(g, 'hero', cx - 16, 112 + bob, 32, { colors: TITLE_COLORS, dir: 'down' });
  }

  function vDiff() {
    return `<h2 class="screen-title">難易度を選ぶ</h2>
      <p class="center dim small">バトルで出る問題の難しさが変わります。あとから変えることはできません。</p>
      <div class="diff-list">${[1, 2, 3, 4].map(d => `<button class="diff-btn" data-act="pickDiff" data-arg="${d}">
        <span class="diff-name">${Questions.DIFFS[d].name}</span><span class="small dim">${Questions.DIFFS[d].desc}</span></button>`).join('')}</div>`;
  }

  // ---- 開発者用：章を選んで始める（タイトルのロゴを 2 秒以内に 5 回タップ） ----
  const DEV_CH = { 1: '第1章「求核の森」', 2: '第2章「カルボニル港」', 3: '第3章「芳香族の王国」', 4: '第4章「鏡の回廊」', 5: '第5章「廃液街」', 6: '全章クリアのあと' };
  function vDev() {
    const D = UI.dev, pick = (act, v, on, label) => `<button class="btn${on ? ' dev-on' : ''}" data-act="${act}" data-arg="${v}">${label}</button>`;
    return `<h2 class="screen-title">開発者メニュー</h2>
      <p class="center dim small">選んだ章のはじめから遊べます。前の章までは、クリアしたことになります（レベル・研究費・仲間も、ふつうに遊んだときに合わせる）。<br>いまのセーブは上書きされます。</p>
      <div class="dev-row">難易度　${[1, 2, 3, 4].map(d => pick('devDiff', d, D.diff === d, Questions.DIFFS[d].name)).join('')}</div>
      <div class="dev-row">立体　${['R', 'S'].map(c => pick('devCfg', c, D.cfg === c, `(${c})`)).join('')}<span class="small dim">（第1章は仲間選びで決まる）</span></div>
      <div class="diff-list">${Object.entries(DEV_CH).map(([n, t]) => `<button class="diff-btn" data-act="devStart" data-arg="${n}">
        <span class="diff-name">${t}</span><span class="small dim">${n === '1' ? 'はじめから' : n === '6' ? `研究所から。Lv${DevStart.lv[5]}` : `Lv${DevStart.lv[n - 1]}　研究費 ${DevStart.money[n - 1]} 円`}</span></button>`).join('')}</div>
      <div class="center"><button class="btn" data-act="toTitle">もどる</button></div>`;
  }
  // 第 n 章のはじめ（n = 6 は全章クリアのあと）の状態をつくる
  function devState(n, diff, cfg) {
    const s = freshState(diff), done = n - 1;
    for (let c = 1; c <= done; c++) for (const f of DevStart.flags[c]) s.flags[f] = true;
    s.lv = DevStart.lv[done]; s.money = DevStart.money[done]; s.items = { ...s.items, ...DevStart.items };
    const party = [...DevStart.party];
    if (heroCfg(party) !== cfg) [party[2], party[3]] = [party[3], party[2]];
    s.party = party; s.owned = [...party]; s.cfg = heroCfg(party);
    s.maxHp = s.hp = maxHpFor(s.lv, s.cfg);
    // レベルアップのたびに技を 1 つ強くしたことにする（4 人に順に）
    party.forEach(id => { s.skillLv[id] = 1; });
    for (let i = 0; i < s.lv - 1; i++) { const id = party[i % 4]; s.skillLv[id] = Math.min(SKILL_MAX, s.skillLv[id] + 1); }
    s.ch = Math.min(5, n);
    return s;
  }

  function vParty() {
    const cfg = heroCfg(UI.pick);
    const trait = cfg === 'R' ? '攻撃型: 続けて正解するほどダメージが上がる' : cfg === 'S' ? '防御型: 最大 HP +10、間違えたときのダメージ −25%' : '';
    // 付け替え（UI.swap）のときは、迎えた仲間だけを選べる。技はいまのレベルで見せる
    // 売店でしか迎えられない仲間（price つき）は、最初の仲間選びには出さない
    const list = COMPANIONS.filter(c => UI.swap || !c.price).map(c => {
      const on = UI.pick.includes(c.id), locked = UI.swap && !S.owned.includes(c.id);
      const sk = UI.swap && !locked ? ` Lv${skillLv(c.id)}: ${skillAt(c.id).desc}` : `: ${c.skill.lv[0].desc}`;
      return `<button class="comp ${on ? 'on' : ''} ${locked ? 'locked' : ''}" style="--ac:${c.color}" data-act="toggleComp" data-arg="${c.id}" ${locked ? 'disabled' : ''}>
        <span class="comp-atom">${c.group}</span>
        <span class="comp-name">${c.name}<small>${c.role}</small></span>
        <span class="comp-cards">技「${c.skill.name}」${sk}</span>
        <span class="comp-line">${locked ? `まだ仲間になっていない（売店で紹介料 ${yen(priceOf(c))} を払うと迎えられる）` : c.bond}</span>
      </button>`;
    }).join('');
    const done = UI.swap
      ? `<button class="btn big" data-act="bondDone" ${UI.pick.length === 4 ? '' : 'disabled'}>▶ この 4 人と結合しなおす</button><button class="btn" data-act="cancelSwap">やめる</button>`
      : `<button class="btn big" data-act="bondDone" ${UI.pick.length === 4 ? '' : 'disabled'}>▶ この 4 人と結合する</button>`;
    return `<h2 class="screen-title">${UI.swap ? '結合する仲間を付け替える' : '4 本の手に、仲間を結ぶ'}</h2>
    <div class="party-grid">
      ${win(`<div class="hero-wrap">${heroSvg(UI.pick)}</div>
        <p class="center">${UI.pick.length}/4 結合</p>
        ${cfg ? `<p class="center big-cfg">(${cfg})-カーボ</p><p class="center small">${heroFormula(UI.pick)}</p><p class="center small accent">${trait}</p>
          ${UI.swap ? `<p class="center small dim">カーボの向き（${S.cfg}）は変わらない。逆の向きになる並びのときは、くさびと破線の仲間が自動で入れ替わる。</p>`
            : '<div class="center"><button class="btn" data-act="swap">くさびと破線を入れ替える（R/S 反転）</button></div>'}`
        : '<p class="center small dim">4 人そろうと、置換基の CIP 順位からカーボの R/S が決まる。</p>'}`, 'hero-win')}
      <div>
        <div class="comp-list">${list}</div>
        <p class="small dim">仲間の技は、バトルごとに使える。レベルが上がるたびに、強化する技を 1 つ選べる。${UI.swap ? '外した仲間の技のレベルは、そのまま残る。' : ''}</p>
        <div class="center">${done}</div>
      </div>
    </div>`;
  }

  function hpBar(cur, max, cls) { return `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, cur / max * 100))}%"></div></div>`; }
  const hudStatus = () => `${heroName()} Lv${S.lv}　HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}`;

  // 第 2 章は昼と夜、第 3 章は残っている柱の数をマップ名に添える
  const mapTitle = () => map().name + (map().ch === 2 ? (S.flags.night ? '（夜）' : '（昼）')
    : map().ch === 3 && !S.flags.c3_boss ? `　柱 ${Maps.pillarsLit(S.flags)}/6` : '');
  // いまの目的（どこへ行けばよいかを HUD に出す）
  const goalText = () => { const g = Maps.goalOf(S.flags, S.map); return g ? g.t : ''; };
  function vWorld() {
    const gt = goalText();
    return `<div class="world">
      <div class="hud">
        <span><b class="mapname">${mapTitle()}</b></span>
        <span class="hp-box">${hudStatus()}</span>
        <span class="hud-btns"><span class="money">研究費 ${yen(S.money)}</span>${muteBtn()}<button class="btn small-btn" data-act="menu">メニュー</button></span>
        <span class="goal"${gt ? '' : ' hidden'}><b>目的</b><span class="goal-t">${esc(gt)}</span></span>
      </div>
      <div class="stage">
        <canvas id="cv" width="${VW * TILE}" height="${VH * TILE}"></canvas>
        <div id="overlay"></div>
      </div>
      <div class="pad" aria-label="操作パッド">
        <div class="dpad">
          <button class="pd up" data-dir="up" aria-label="上">▲</button>
          <button class="pd left" data-dir="left" aria-label="左">◀</button>
          <button class="pd right" data-dir="right" aria-label="右">▶</button>
          <button class="pd down" data-dir="down" aria-label="下">▼</button>
        </div>
        <button class="pd abtn" data-key="a">話す<br>調べる</button>
      </div>
      <p class="keys small dim">矢印キー / WASD: 移動　Z・Enter・Space: 話す・調べる・送る　X・Esc: メニュー</p>
    </div>`;
  }

  // ---- オーバーレイ（会話・メッセージ・メニュー・購買部） ----------
  function renderOverlay() {
    const ov = document.getElementById('overlay');
    if (!ov) return;
    stopTyping();
    if (UI.menu) { ov.innerHTML = vMenu(); return; }
    if (UI.shop) { ov.innerHTML = vShop(); return; }
    if (UI.choice) {
      ov.innerHTML = `<div class="dialog choice-box">${UI.choice.map((o, i) => `<button class="btn" data-act="choose" data-arg="${i}">${i + 1}. ${esc(o.t)}</button>`).join('')}</div>`;
      return;
    }
    const line = currentLine();
    if (!line) { ov.innerHTML = ''; return; }
    ov.innerHTML = `<div class="dialog${line.face ? ' has-face' : ''}" data-act="advance">
      ${line.face ? '<canvas class="face" id="face" width="96" height="96" aria-hidden="true"></canvas>' : ''}
      ${line.w ? `<div class="speaker">${esc(line.w)}</div>` : ''}
      <div class="dtext" id="dtext" data-full="${esc(line.t)}"></div>
      <div class="dnext">▼</div></div>`;
    if (line.face) drawFace(document.getElementById('face'), line.face);
    startTyping();
  }

  // 話している人の、胸から上（16 マスの絵のうち上の 11 マスほど）を大きく描く。仲間は原子の顔で描く
  // 人の形でない絵（分子のかたまりなど）は全身、子どもの絵は小さく描かれているので、見せる範囲 [上端の行, 行数] を変える
  const FACE_FRAME = {
    hero: [0, 16], elder: [0, 16], elderCl: [0, 16], carvoneR: [0, 16], carvoneS: [0, 16], victim: [6, 10], lumber: [0, 16], twins: [3, 12],
    methane: [1, 15], water: [1, 15], iodo: [0, 16], kidA: [4.6, 8.4], kidB: [4.6, 8.4], aniBoy: [4.6, 8.4], nitra: [3.4, 9.6],
    boka: [0, 16], oil: [0, 16], tppo: [0, 16], cbd: [2, 14], glucose: [3.4, 9.6], aminoKids: [3.4, 11], peaR: [3.4, 9.6], peaS: [3.4, 9.6],
  };
  function drawFace(cv, face) {
    const g = cv.getContext('2d'), W = cv.width;
    g.imageSmoothingEnabled = false;
    const bg = g.createLinearGradient(0, 0, 0, W);
    bg.addColorStop(0, '#1d2652'); bg.addColorStop(1, '#090c1f');
    g.fillStyle = bg; g.fillRect(0, 0, W, W);
    if (face.comp) {
      const c = comp(face.comp), cx = W / 2, cy = W * 0.56, r = W * 0.36;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = '#000'; g.fill();
      g.lineWidth = 5; g.strokeStyle = c.color; g.stroke();
      g.fillStyle = c.color;
      g.fillRect(cx - 12, cy - r * 0.5, 5, 8); g.fillRect(cx + 7, cy - r * 0.5, 5, 8);
      g.font = `bold ${c.group.length > 3 ? 15 : 20}px monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(c.group, cx, cy + r * 0.28);
      return;
    }
    const id = face.hero ? 'hero' : face.id, [top, rows] = FACE_FRAME[id] || [-0.66, 11];
    const sz = W * 16 / rows;
    const o = (face.hero || id === 'shadow' || id === 'boka') ? { colors: S.party.length ? S.party.map(p => comp(p).color) : null, dir: 'down' } : undefined;
    Sprites.drawChar(g, id, Math.round((W - sz) / 2), Math.round(-top * sz / 16), sz, o);
  }

  let typeTimer = null;
  function startTyping() {
    const el = document.getElementById('dtext');
    if (!el) return;
    const full = unesc(el.dataset.full);
    let i = 0;
    el.textContent = '';
    el.dataset.done = '0';
    typeTimer = setInterval(() => {
      i += 2;
      el.textContent = full.slice(0, i);
      if (i >= full.length) { el.dataset.done = '1'; stopTyping(); }
    }, 22);
  }
  function stopTyping() { if (typeTimer) { clearInterval(typeTimer); typeTimer = null; } }
  function finishTyping() {
    const el = document.getElementById('dtext');
    if (el && el.dataset.done !== '1') {
      stopTyping();
      el.textContent = unesc(el.dataset.full);
      el.dataset.done = '1';
      return true;
    }
    return false;
  }

  function currentLine() {
    if (UI.msg) return { t: UI.msg[0] };
    const sc = UI.scene;
    if (!sc) return null;
    const st = sc.steps[sc.i];
    if (!st || st.do) return null;
    let w = st.w || null, face = null;
    if (w && w.startsWith('@')) {
      // 仲間の台詞は順番に割り振る。ただし無口なブトキ（いつも「……」）には割り振らない
      const talkers = S.party.filter(id => id !== 'buto');
      const id = talkers.length ? talkers[(+w.slice(1)) % talkers.length] : null;
      w = id ? comp(id).name : '仲間';
      if (id) face = { comp: id };
    } else if (w) face = faceFor(w);
    return { w, t: fill(st.t), face };
  }
  // 話者の名前 → 顔（バトル中は、いま戦っている相手の名前なら、いまの姿の絵を使う）
  function faceFor(w, B) {
    const base = n => n.replace(/（.*）$/, '');
    if (w === 'カーボ') return { hero: true };
    if (B && base(w) === base(B.name)) return { id: B.sprite };
    const c = COMPANIONS.find(x => x.name === w);
    if (c) return { comp: c.id };
    const f = Story.FACES[w] || Story.FACES[base(w)];
    return f ? { id: resolve(f, S.flags) } : null;
  }

  function vMenu() {
    const party = S.party.map(id => { const c = comp(id), lv = skillLv(id);
      return `<li><b style="color:${c.color}">${c.name}</b>（${c.group}）技「${c.skill.name}」Lv${lv}: ${skillAt(id).desc}</li>`; }).join('');
    const items = Object.entries(S.items).filter(([, n]) => n > 0).map(([id, n]) =>
      `<li>${ITEMS[id].name} ×${n} <span class="dim small">${ITEMS[id].desc}</span>${ITEMS[id].heal ? ` <button class="btn small-btn" data-act="drink" data-arg="${id}" ${S.hp >= S.maxHp ? 'disabled' : ''}>飲む</button>` : ''}</li>`).join('') || '<li class="dim">なし</li>';
    const st = S.stats.total ? `${S.stats.correct}/${S.stats.total} 問正解（${Math.round(S.stats.correct / S.stats.total * 100)}%）` : 'まだ問題に答えていない';
    const nb = Object.keys(S.notebook).length;
    return `<div class="menu win">
      <h3>${heroName()}　Lv${S.lv}　HP ${S.hp}/${S.maxHp}</h3>
      <p class="small">次のレベルまで 経験値 ${expToNext(S.lv) - S.exp}　｜　研究費 ${yen(S.money)}</p>
      <p class="small">難易度: ${Questions.DIFFS[S.diff].name}　｜　${st}</p>
      ${goalText() ? `<p class="small accent">目的: ${esc(goalText())}</p>` : ''}
      ${S.party.length ? `<p class="small">${heroFormula(S.party)}</p><ul class="mlist">${party}</ul>` : ''}
      <h3>どうぐ</h3><ul class="mlist">${items}</ul>
      <div class="center">
        <button class="btn" data-act="openSwap">仲間を付け替える（${S.owned.length} 人）</button>
        <button class="btn" data-act="openNote">復習ノート（${nb}）</button>
        <button class="btn" data-act="saveNow">セーブ</button>
        <button class="btn" data-act="menu">とじる</button>
      </div>
    </div>`;
  }

  function vShop() {
    const rows = SHOP.map(id => { const it = ITEMS[id], can = S.money >= it.price;
      return `<li class="shop-row"><span><b>${it.name}</b>　${yen(it.price)}<br><span class="small dim">${it.desc}（持っている数: ${S.items[id] || 0}）</span></span>
        <button class="btn small-btn" data-act="buy" data-arg="${id}" ${can ? '' : 'disabled'}>買う</button></li>`; }).join('');
    // まだ仲間になっていない人を、紹介料を払って迎える
    const cands = COMPANIONS.filter(c => !S.owned.includes(c.id));
    const comps = cands.map(c => `<li class="shop-row"><span><b style="color:${c.color}">${c.name}</b>（${c.group}）　${yen(priceOf(c))}<br>
        <span class="small dim">${c.role}。技「${c.skill.name}」: ${c.skill.lv[0].desc}</span></span>
        <button class="btn small-btn" data-act="buyComp" data-arg="${c.id}" ${S.money >= priceOf(c) ? '' : 'disabled'}>迎える</button></li>`).join('');
    return `<div class="menu win">
      <h3>${esc(UI.shopInfo.name)}</h3>
      <p class="small">${esc(UI.shopInfo.line)}</p>
      <p>研究費 <b class="accent">${yen(S.money)}</b></p>
      <ul class="shop-list">${rows}</ul>
      ${cands.length ? `<h3>仲間を迎える（紹介料）</h3><p class="small dim">迎えた仲間は、メニューの「仲間を付け替える」で結合できる。</p><ul class="shop-list">${comps}</ul>` : ''}
      <div class="center"><button class="btn" data-act="closeShop">とじる</button></div>
    </div>`;
  }

  // ---- 台本の再生 ------------------------------------------------
  function playScene(id, onDone) {
    // need: その仲間がパーティにいるときだけの台詞
    // if: そのフラグのときだけの台詞
    UI.scene = { steps: SCENES[id].filter(x => (!x.need || S.party.includes(x.need)) && (!x.if || x.if(S.flags))).map(x => ({ ...x })), i: 0, onDone };
    UI.held = null;
    runCommands();
  }
  function runCommands() {
    const sc = UI.scene;
    while (sc && sc.i < sc.steps.length && sc.steps[sc.i].do) {
      const st = sc.steps[sc.i];
      if (st.do === 'flag') { S.flags[st.f] = true; save(); sc.i++; continue; }
      if (st.do === 'heal') { S.hp = S.maxHp; sc.i++; continue; }
      if (st.do === 'se') { Sound.se(st.s); sc.i++; continue; }
      if (st.do === 'night' || st.do === 'day') { S.flags.night = st.do === 'night'; sc.i++; save(); if (UI.screen === 'world') render(); continue; }
      if (st.do === 'warp') { S.map = st.map; S.x = st.x; S.y = st.y; S.dir = st.dir || S.dir; UI.move = null; sc.i++; save(); render(); continue; }
      if (st.do === 'choice') { sc.i++; UI.choice = st.opts; renderOverlay(); return; }
      if (st.do === 'bond') {
        const lines = S.party.map(id => ({ w: comp(id).name, t: comp(id).bond }));
        sc.steps.splice(sc.i, 1, ...lines);
        continue;
      }
      if (st.do === 'party') { sc.i++; UI.pick = []; UI.screen = 'party'; render(); return; }
      // chance があれば、その確率でだけバトルになる（回転の扉を回し損ねたときなど）
      if (st.do === 'battle') { sc.i++; if (st.chance && Math.random() > st.chance) continue; startBattle(st.e, false); return; }
      // 第 5 章：分液区の部屋をやり直す / はしごの泡を消す / 最後の一枚絵
      if (st.do === 'resetRoom') { const room = Maps.EXTRACT.roomAt(S.y); if (room) Maps.EXTRACT.resetRoom(ex(), room); save(); sc.i++; continue; }
      if (st.do === 'brine') {
        const had = S.flags.c5foam; S.flags.c5foam = false; ex().pumps = 0; save();
        sc.steps.splice(sc.i, 1, { t: had ? '（飽和食塩水を入れた。泡のかたまりが、すっと消えた。（塩析））' : '（飽和食塩水を入れた。……泡は、もともとたまっていなかった）' });
        continue;
      }
      if (st.do === 'ending') { sc.i++; UI.screen = 'ending'; render(); return; }
      if (st.do === 'clear') {
        sc.i++; UI.scene = null;
        const ch = st.ch || MAPS[S.map].ch || 1;
        S.flags[ch === 1 ? 'clear' : `clear${ch}`] = true; UI.clearCh = ch;
        save(); UI.screen = 'clear'; render(); Sound.se('clear'); return;
      }
      sc.i++;
    }
    if (sc && sc.i >= sc.steps.length) {
      UI.scene = null;
      if (sc.onDone) sc.onDone();
    }
    if (UI.screen === 'world') { renderOverlay(); refreshHud(); }
  }
  function advance() {
    if (UI.choice) return;
    if (finishTyping()) return;
    if (UI.msg) { UI.msg.shift(); if (!UI.msg.length) { const cb = UI.msgDone; UI.msg = null; UI.msgDone = null; if (cb) cb(); } renderOverlay(); return; }
    if (UI.scene) { UI.scene.i++; runCommands(); }
  }
  function message(lines, done) { UI.msg = Array.isArray(lines) ? [...lines] : [lines]; UI.msgDone = done || null; UI.held = null; renderOverlay(); }
  const busy = () => !!(UI.scene || UI.msg || UI.menu || UI.shop || UI.choice);
  const SHOP_DEFAULT = { name: '購買部', line: '「いらっしゃい！ 研究費はちゃんと残しておくんだよ」' };
  function openShop(info) {
    UI.shopInfo = typeof info === 'object' ? info : SHOP_DEFAULT;
    UI.shop = true; UI.held = null; Sound.se('blip');
    renderOverlay();
  }
  function choose(i) {
    const o = UI.choice && UI.choice[+i];
    if (!o) return;
    UI.choice = null;
    if (o.fn) { renderOverlay(); return o.fn(); }
    if (o.shop) { UI.scene = null; return openShop(o.shop); }
    const sc = UI.scene; UI.scene = null;
    if (o.go) playScene(o.go, sc && sc.onDone);
    else { renderOverlay(); if (sc && sc.onDone) sc.onDone(); }
  }

  function refreshHud() {
    const hp = document.querySelector('.hud .hp-box');
    if (hp) hp.innerHTML = hudStatus();
    const m = document.querySelector('.hud .money');
    if (m) m.textContent = `研究費 ${yen(S.money)}`;
    const nm = document.querySelector('.hud .mapname');
    if (nm) nm.textContent = mapTitle();
    const gl = document.querySelector('.hud .goal');
    if (gl) { const gt = goalText(); gl.hidden = !gt; gl.querySelector('.goal-t').textContent = gt; }
  }

  // =================================================================
  // マップ
  // =================================================================
  let cv = null, ctx = null, mapCache = { key: '', canvas: null };

  function setupCanvas() {
    cv = document.getElementById('cv');
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }
  function tileAt(x, y) { const g = map().grid; return (g[y] && g[y][x]) || 'T'; }
  function passableTile(ch) {
    const p = map().passable && map().passable[ch];
    if (p) return p(S.flags);
    return !Sprites.SOLID.has(ch);
  }
  const activeEvents = () => (map().events || []).filter(e => !e.when || e.when(S.flags)).concat(resEvents());

  // ---- 第 5 章：分液区 ----
  const ex = () => { if (!S.c5x) S.c5x = Maps.EXTRACT.init(); return S.c5x; };
  // いまの層にいる住人を、話しかけられる人として出す
  function resEvents() {
    const m = map();
    if (!m.layer) return [];
    const st = ex();
    return Object.entries(Maps.EXTRACT.residents).filter(([id]) => st.res[id].layer === m.layer)
      .map(([id, r]) => { const p = st.res[id]; return { x: p.x, y: p.y, sprite: r.sprite, on: 'bump', res: id, fx: p.fx, fy: p.fy, mt: p.mt }; });
  }
  const resName = id => Maps.EXTRACT.residents[id].name;
  function talkResident(id) {
    const r = Maps.EXTRACT.residents[id];
    if (!S.flags['c5t_' + id] && r.talk) return playScene(r.talk, () => { S.flags['c5t_' + id] = true; save(); if (!r.fixed) followToggle(id); });
    if (r.fixed) return message(`${r.name}「${r.stay}」`);
    followToggle(id);
  }
  function followToggle(id) {
    const st = ex();
    if (st.follow === id) { st.follow = null; message(`${resName(id)}「ここで待ってるね」`); }
    else { st.follow = id; message(`${resName(id)}「ついていくね」`); }
    save();
  }
  // 扉や出口の上（ついてくる住人は、ここから先へは来ない）
  const onThreshold = (x, y) => Maps.EXTRACT.thresholds.some(([tx, ty, layer]) => tx === x && ty === y && layer === map().layer);
  // カーボが歩くと、ついてくる住人はカーボのいた場所に入る。扉や出口の上では、そこで待つ
  function moveFollower(ox, oy) {
    const m = map();
    if (!m.layer) return;
    const st = ex(), id = st.follow;
    if (!id) return;
    const p = st.res[id];
    if (p.layer !== m.layer || Math.abs(p.x - ox) + Math.abs(p.y - oy) > 1) { st.follow = null; return; }
    if (onThreshold(S.x, S.y)) { st.follow = null; flash(`${resName(id)}は、ここで待っている`); return; }
    Object.assign(p, { fx: p.x, fy: p.y, mt: UI.move ? UI.move.t0 : 0, x: ox, y: oy });
    checkLocks();
  }
  // 鍵になる住人が、その層で扉の前に立つと開く
  function checkLocks() {
    const st = ex();
    for (const L of Maps.EXTRACT.locks) {
      if (S.flags[L.flag]) continue;
      const p = st.res[L.key];
      if (p.layer === L.layer && p.x === L.front[0] && p.y === L.front[1]) {
        S.flags[L.flag] = true; save();
        if (st.follow === L.key) st.follow = null;
        UI.held = null; playScene(L.scene);
        return true;
      }
    }
    return false;
  }
  // 鍵になる住人を連れて扉にぶつかっても開く（扉の前に立たせなくてよい）
  function openWithFollower(ev) {
    const m = map(), st = m.layer && ex();
    const L = st && Maps.EXTRACT.locks.find(l => l.layer === m.layer && l.at[0] === ev.x && l.at[1] === ev.y && !S.flags[l.flag]);
    if (!L || st.follow !== L.key || st.res[L.key].layer !== L.layer) return false;
    S.flags[L.flag] = true; st.follow = null; save();
    UI.held = null; playScene(L.scene);
    return true;
  }
  // 住人が移れる場所か（壁・人や物・カーボのいる場所には移れない）
  function freeIn(layer, x, y) {
    const mid = Maps.EXTRACT.maps[layer], m = MAPS[mid], ch = m.grid[y] && m.grid[y][x];
    if (!ch || Sprites.SOLID.has(ch)) return false;
    if (m.events.some(e => e.x === x && e.y === y && e.on === 'bump' && (!e.when || e.when(S.flags)))) return false;
    if (map().layer === layer && S.x === x && S.y === y) return false;
    return true;
  }
  const PUMP = { acid: '酸（HCl）', bicarb: '弱い塩基（NaHCO₃）', base: '強い塩基（NaOH）' };
  const INTO = { amine: 'アンモニウム塩になって', acid: 'カルボキシラートになって', phenol: 'フェノキシドになって' };
  // ポンプは、入れるかどうかを聞いてから（歩いてぶつかっただけで何度も入らないように）
  function askPump(ev) {
    const E = Maps.EXTRACT, room = ex().ph[ev.room];
    UI.held = null;
    message([`${PUMP[ev.pump]}のポンプだ。（この部屋はいま ${E.PH[room]}）`], () => {
      UI.choice = [{ t: `${PUMP[ev.pump]}を入れる`, fn: () => usePump(ev) }, { t: 'やめておく' }];
      renderOverlay();
    });
  }
  function usePump(ev) {
    const E = Maps.EXTRACT, st = ex();
    const moved = E.applyPh(st, ev.room, ev.pump, freeIn);
    if (moved.includes(st.follow)) st.follow = null;
    st.pumps++;
    const lines = [`${PUMP[ev.pump]}を入れた。この部屋は ${E.PH[ev.pump]} になった。`];
    for (const id of moved) {
      const r = E.residents[id], down = st.res[id].layer === 'aq';
      lines.push(`${r.name}が、${down ? `${INTO[r.type]}、水層へ下りた` : 'もとの形に戻って、有機層へ上がった'}。`);
    }
    if (!moved.length) lines.push('……誰も、層を移らなかった。');
    if (st.pumps >= 4 && !S.flags.c5foam) {
      S.flags.c5foam = true;
      lines.push('振りすぎた！ はしごのまわりに、泡のかたまり（エマルション）がたまった。', '【ヒント】飽和食塩水の蛇口で、泡を消せる。');
    }
    save(); Sound.se('transform'); UI.held = null;
    message(lines, () => checkLocks());
  }
  // はしご：上る（有機層へ）か下りる（水層へ）かを聞いてから。押しっぱなしで行ったり来たりしないように
  const LAYER = { org: '上の有機層', aq: '下の水層' };
  function askLadder() {
    const m = map(), down = m.layer === 'org';
    UI.held = null;
    if (S.flags.c5foam) return useLadder();
    message([`はしごだ。${down ? '▼ 下の水層へ続いている。' : '▲ 上の有機層へ続いている。'}`], () => {
      UI.choice = [{ t: down ? '▼ 下の水層へ下りる' : '▲ 上の有機層へ上る', fn: useLadder }, { t: 'やめておく' }];
      renderOverlay();
    });
  }
  function useLadder() {
    const m = map(), st = ex(), other = m.layer === 'org' ? 'aq' : 'org', tw = MAPS[m.twin];
    if (S.flags.c5foam) return message(['はしごのまわりに、泡のかたまり（エマルション）がたまっていて、通れない。', '【ヒント】飽和食塩水の蛇口で、泡を消せる。']);
    if (Sprites.SOLID.has(tw.grid[S.y][S.x])) return message('ここからは、はしごを使えない。はしごの横に立とう。');
    if (Object.values(st.res).some(p => p.layer === other && p.x === S.x && p.y === S.y)) return message('はしごの先に、誰かいる。少し場所を変えよう。');
    if (tw.events.some(e => e.x === S.x && e.y === S.y && e.on === 'bump' && (!e.when || e.when(S.flags)))) return message('はしごの先は、閉じた扉だ。まだ下りられない。');
    st.follow = null; st.pumps = 0;
    Sound.se('blip'); UI.held = null;
    warp({ map: m.twin, x: S.x, y: S.y, dir: S.dir });
    flash(other === 'aq' ? '▼ はしごを下りて、下の水層に来た' : '▲ はしごを上って、上の有機層に来た');
  }
  // 外から分液区に入ったら、まだ扉の開いていない部屋は、はじめに戻す（詰まないように）
  function enterDistrict() {
    const E = Maps.EXTRACT, st = ex();
    for (const r of E.rooms) if (!S.flags[r.lock]) E.resetRoom(st, r.id);
    st.follow = null; st.pumps = 0; S.flags.c5foam = false;
  }
  const eventAt = (x, y, on) => activeEvents().find(e => e.x === x && e.y === y && (!on || e.on === on));

  function mapCanvas() {
    // openTile: 通れるようになった門を、開いた絵に差し替える
    const open = m0 => Object.keys(m0.openTile || {}).map(c => passableTile(c) ? 1 : 0).join('');
    // swap: フラグで見た目だけを差し替える（割れた鏡、さざ波の立った湖など）
    const swapOf = (m0, ch) => (m0.swap && m0.swap[ch] && m0.swap[ch](S.flags)) || null;
    const m = map(), key = S.map + (S.flags.duo ? 1 : 0) + open(m)
      + (m.swap ? Object.keys(m.swap).map(c => swapOf(m, c) || '-').join('') : '') + (m.paintKey ? m.paintKey(S.flags) : '');
    if (mapCache.key === key) return mapCache.canvas;
    const W = m.grid[0].length, H = m.grid.length;
    const c = document.createElement('canvas');
    c.width = W * TILE; c.height = H * TILE;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let ch = m.grid[y][x];
      if (ch === 'M' && passableTile('M')) ch = 'm';
      if (m.openTile && m.openTile[ch] && passableTile(ch)) ch = m.openTile[ch];
      ch = swapOf(m, ch) || ch;
      Sprites.drawTile(g, ch, x * TILE, y * TILE, TILE, x, y, (dx, dy) => (m.grid[y + dy] && m.grid[y + dy][x + dx]) || 'T');
    }
    if (m.paint) m.paint(g, TILE, S.flags);
    // 湖の水面に、上の景色を上下逆さまに映す（axis の行が水ぎわ）
    const r = m.reflect;
    if (r && r.when(S.flags)) {
      const copy = document.createElement('canvas');
      copy.width = c.width; copy.height = c.height; copy.getContext('2d').drawImage(c, 0, 0);
      const x0 = r.x0 * TILE, y0 = r.y0 * TILE, w = (r.x1 - r.x0 + 1) * TILE, h = (r.y1 - r.y0 + 1) * TILE;
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      g.globalAlpha = 0.62; g.translate(0, (2 * r.axis + 1) * TILE); g.scale(1, -1); g.drawImage(copy, 0, 0);
      g.restore();
      g.save(); g.fillStyle = 'rgba(14, 32, 80, 0.36)'; g.fillRect(x0, y0, w, h);
      g.fillStyle = 'rgba(210, 230, 255, 0.10)'; for (let yy = y0 + 5; yy < y0 + h; yy += 11) g.fillRect(x0, yy, w, 1);
      g.fillStyle = 'rgba(255, 255, 255, 0.25)'; g.fillRect(x0, y0, w, 2);
      g.restore();
    }
    mapCache = { key, canvas: c };
    return c;
  }

  // ---- 鏡の広間：影は、カーボと左右だけ逆に動く。壁にぶつかると止まる ----
  // map.mirror = { axis: ガラスの壁の列, rooms: [[上の行, 下の行, 解いたときのフラグ], ...] }
  const mirrorRoom = (m, y) => m.mirror.rooms.findIndex(([a, b]) => y >= a && y <= b);
  function syncShadow() {
    const m = map();
    if (!m.mirror) { UI.shadow = null; return; }
    const room = mirrorRoom(m, S.y);
    // 部屋と部屋のあいだ（格子の上）にいるあいだは「部屋の外」。入り直すと、影は入口の鏡の位置に戻る
    if (room < 0) { if (UI.shadow) UI.shadow.room = -1; return; }
    // カーボのいる部屋が変わったら、影を鏡の位置に置き直す
    if (!UI.shadow || UI.shadow.map !== S.map || UI.shadow.room !== room) UI.shadow = { map: S.map, room, x: 2 * m.mirror.axis - S.x, y: S.y, px: null, py: null };
  }
  function moveShadow(dx, dy) {
    const m = map(), sh = UI.shadow;
    if (!m.mirror || !sh || sh.map !== S.map || sh.room < 0) return;
    const [a, b] = m.mirror.rooms[sh.room], nx = sh.x - dx, ny = sh.y + dy, ch = tileAt(nx, ny);
    sh.px = sh.x; sh.py = sh.y;
    if (nx > m.mirror.axis && ny >= a && ny <= b && (ch === '%' || ch === '$')) { sh.x = nx; sh.y = ny; }
  }
  // カーボと影が、同時にスイッチを踏んだら解ける。最後の部屋を解くと、影が出てくる
  function checkMirror() {
    const m = map(), sh = UI.shadow;
    if (!m.mirror || !sh || sh.map !== S.map || sh.room < 0 || mirrorRoom(m, S.y) !== sh.room) return false;
    const fl = m.mirror.rooms[sh.room][2];
    if (S.flags[fl] || tileAt(S.x, S.y) !== '$' || tileAt(sh.x, sh.y) !== '$') return false;
    S.flags[fl] = true; save(); Sound.se('chest'); UI.held = null;
    if (sh.room === m.mirror.rooms.length - 1) { playScene('c4_shadow'); return true; }
    message(['カーボと影が、同時に金のスイッチを踏んだ。', '床の鏡が光り、上の格子が開いた！']);
    return true;
  }

  function heroPos() {
    if (!UI.move) return [S.x, S.y];
    const t = Math.min(1, (performance.now() - UI.move.t0) / STEP_MS);
    return [UI.move.fx + (S.x - UI.move.fx) * t, UI.move.fy + (S.y - UI.move.fy) * t];
  }

  function draw() {
    if (UI.screen !== 'world' || !ctx) return;
    const m = map(), W = m.grid[0].length, H = m.grid.length;
    const [hx, hy] = heroPos();
    let camX = hx - (VW - 1) / 2, camY = hy - (VH - 1) / 2;
    camX = W <= VW ? -(VW - W) / 2 : Math.max(0, Math.min(W - VW, camX));
    camY = H <= VH ? -(VH - H) / 2 : Math.max(0, Math.min(H - VH, camY));
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(mapCanvas(), Math.round(-camX * TILE), Math.round(-camY * TILE));
    if (S.flags.night && m.ch === 2) { ctx.fillStyle = 'rgba(10, 18, 52, 0.55)'; ctx.fillRect(0, 0, cv.width, cv.height); }
    // 第 3 章：柱の光が消えるほど、外の景色が暗く沈む
    if (m.dim && !S.flags.c3_boss) {
      const dark = 6 - Maps.pillarsLit(S.flags);
      if (dark) { ctx.fillStyle = `rgba(40, 20, 70, ${dark * 0.05})`; ctx.fillRect(0, 0, cv.width, cv.height); }
    }
    const colors = S.party.length ? S.party.map(id => comp(id).color) : null;
    // 分液区：もう片方の層にいる住人は、ガラス越しに透けて見える
    if (m.layer) {
      const st = ex();
      ctx.save(); ctx.globalAlpha = 0.28;
      for (const [id, r] of Object.entries(Maps.EXTRACT.residents)) {
        const p = st.res[id];
        if (p.layer !== m.layer) Sprites.drawChar(ctx, r.sprite, (p.x - camX) * TILE, (p.y - camY) * TILE, TILE, { colors });
      }
      for (const e of MAPS[m.twin].events) {
        if (!e.sprite || e.pump || e.ladder || e.tap || (e.when && !e.when(S.flags))) continue;
        if (m.events.some(o => o.x === e.x && o.y === e.y && o.sprite)) continue;
        Sprites.drawChar(ctx, resolve(e.sprite, S.flags), (e.x - camX) * TILE, (e.y - camY) * TILE, TILE, { colors });
      }
      ctx.restore();
    }
    for (const e of activeEvents()) {
      if (!e.sprite) continue;
      let px = e.x, py = e.y;
      if (e.res && UI.move && e.mt === UI.move.t0) { const t = Math.min(1, (performance.now() - UI.move.t0) / STEP_MS); px = e.fx + (e.x - e.fx) * t; py = e.fy + (e.y - e.fy) * t; }
      const sx = (px - camX) * TILE, sy = (py - camY) * TILE;
      const id = e.chest && S.flags[e.chest.flag] ? 'chestOpen' : resolve(e.sprite, S.flags);
      if (e.mirror) { ctx.save(); ctx.translate(sx + TILE, sy); ctx.scale(-1, 1); Sprites.drawChar(ctx, id, 0, 0, TILE, { colors }); ctx.restore(); }
      else Sprites.drawChar(ctx, id, sx, sy, TILE, { colors });
    }
    if (m.mirror) {
      if (!UI.shadow || UI.shadow.map !== S.map) syncShadow();
      const sh = UI.shadow, last = m.mirror.rooms.length - 1;
      if (sh && sh.map === S.map && !(sh.room === last && S.flags[m.mirror.rooms[last][2]])) {
        const t = UI.move && sh.px !== null ? Math.min(1, (performance.now() - UI.move.t0) / STEP_MS) : 1;
        const ox = sh.px === null ? sh.x : sh.px + (sh.x - sh.px) * t, oy = sh.py === null ? sh.y : sh.py + (sh.y - sh.py) * t;
        Sprites.drawChar(ctx, 'shadow', (ox - camX) * TILE, (oy - camY) * TILE, TILE, { colors });
      }
    }
    Sprites.drawChar(ctx, 'hero', (hx - camX) * TILE, (hy - camY) * TILE, TILE, { colors, dir: S.dir });
    drawGoalMarks(camX, camY);
    // 分液区：いまどちらの層にいるかを、左上に出す
    if (m.layer) {
      const label = m.layer === 'org' ? '▲ 上の層（有機層）' : '▼ 下の層（水層）';
      ctx.save(); ctx.font = 'bold 15px sans-serif'; const tw = ctx.measureText(label).width;
      const bx = Math.round((cv.width - tw) / 2) - 7;   // 画面の端は狭い画面で切れるので、上の真ん中に出す
      ctx.fillStyle = 'rgba(0, 0, 0, .65)'; ctx.fillRect(bx, 4, tw + 14, 24);
      ctx.fillStyle = m.layer === 'org' ? '#ffe28a' : '#9fd0ff'; ctx.textBaseline = 'middle'; ctx.fillText(label, bx + 7, 16.5);
      ctx.restore();
    }
  }
  // 目的の場所に、上下に揺れる黄色い矢印を出す（会話中は出さない）
  function drawGoalMarks(camX, camY) {
    const g = Maps.goalOf(S.flags, S.map);
    if (!g || busy()) return;
    const bob = reduceMotion ? 0 : Math.round(Math.sin(performance.now() / 180) * 2);
    for (const [mp, x, y] of g.at) {
      if (mp !== S.map || (x === S.x && y === S.y)) continue;
      // 画面のいちばん上の行（村の北の門など）でも矢印が見えるように、上端で止める
      const cx = (x - camX) * TILE + TILE / 2, ty = Math.max(10, (y - camY) * TILE - 6) + bob;
      ctx.beginPath(); ctx.moveTo(cx - 6, ty - 8); ctx.lineTo(cx + 6, ty - 8); ctx.lineTo(cx, ty); ctx.closePath();
      ctx.fillStyle = '#ffd75e'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#3a2a00'; ctx.stroke();
    }
  }

  function loop() {
    if (UI.screen === 'world') {
      if (UI.move && performance.now() - UI.move.t0 >= STEP_MS) { UI.move = null; afterStep(); }
      if (!UI.move && UI.held && !busy()) tryMove(UI.held);
      draw();
    }
    if (UI.screen === 'title') drawTitle(performance.now());
    requestAnimationFrame(loop);
  }

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function tryMove(dir) {
    const prevDir = S.dir;
    S.dir = dir;
    const [dx, dy] = DIRS[dir], nx = S.x + dx, ny = S.y + dy;
    const ev = eventAt(nx, ny, 'bump');
    // 分液区：ついてくる住人のほうへ進むと、まずそちらを向く（「話す」で待ってもらえる）。
    // 向いたままもう一度進むと、場所を入れ替わる（せまい所で動けなくならないように）
    if (ev && ev.res && map().layer && ex().follow === ev.res && prevDir !== dir) { UI.held = null; return; }
    if (ev && ev.res && map().layer && ex().follow === ev.res && !onThreshold(S.x, S.y)) {
      const p = ex().res[ev.res], ox = S.x, oy = S.y;
      UI.move = { fx: S.x, fy: S.y, t0: performance.now() };
      S.x = nx; S.y = ny;
      Object.assign(p, { fx: p.x, fy: p.y, mt: UI.move.t0, x: ox, y: oy });
      checkLocks();
      return;
    }
    if (ev) { UI.held = null; return trigger(ev); }
    const ch = tileAt(nx, ny);
    if (!passableTile(ch)) {
      const bt = map().blockedText && map().blockedText[ch];
      if (bt) message(resolve(bt, S.flags));
      return;
    }
    UI.move = { fx: S.x, fy: S.y, t0: performance.now() };
    const ox = S.x, oy = S.y;
    S.x = nx; S.y = ny;
    moveShadow(dx, dy);
    moveFollower(ox, oy);
  }

  function afterStep() {
    syncShadow();
    if (checkMirror()) return;
    const ev = eventAt(S.x, S.y, 'step');
    if (ev) { UI.held = null; return trigger(ev); }
    const enc = map().encounters;
    if (enc && enc.tiles.includes(tileAt(S.x, S.y)) && (!enc.when || enc.when(S.flags))) {
      UI.steps++;
      if (UI.steps > 4 && Math.random() < 1 / 10) {
        UI.steps = 0; UI.held = null;
        const list = enc.enemies || RANDOM_ENEMIES;
        startBattle(list[Math.floor(Math.random() * list.length)], true);
      }
    }
  }

  function action() {
    if (UI.menu || UI.shop) return;
    if (UI.scene || UI.msg) return advance();
    const [dx, dy] = DIRS[S.dir], fx = S.x + dx, fy = S.y + dy;
    const ev = eventAt(fx, fy, 'bump');
    if (ev) return trigger(ev);
    const ins = resolve(map().inspect && map().inspect[tileAt(fx, fy)], S.flags);
    if (ins) {
      if (ins.rest) { S.hp = S.maxHp; save(); refreshHud(); Sound.se('heal'); return message(['ベッドで仮眠をとった。', 'HP が全回復した。（セーブしました）']); }
      return message(ins);
    }
  }

  function trigger(ev) {
    if (ev.res) return talkResident(ev.res);
    if (openWithFollower(ev)) return;
    if (ev.pump) return askPump(ev);
    if (ev.ladder) return askLadder();
    if (ev.tap) return playScene('c5_tap');
    if (ev.scene) return playScene(resolve(ev.scene, S.flags));
    if (ev.text) return message(resolve(ev.text, S.flags));
    if (ev.shop) return openShop(ev.shop);
    if (ev.chest) {
      if (S.flags[ev.chest.flag]) return message('宝箱はからっぽだ。');
      S.flags[ev.chest.flag] = true;
      S.items[ev.chest.item] = (S.items[ev.chest.item] || 0) + 1;
      save();
      Sound.se('chest');
      return message(`宝箱を開けた！ ${ITEMS[ev.chest.item].name}を手に入れた。`);
    }
    if (ev.gate) {
      if (S.flags.elder) return warp({ map: 'forest', x: 15, y: 22, dir: 'up' });
      return playScene('gate_block', () => { S.y = 1; S.dir = 'down'; });
    }
    if (ev.eastGate) {
      if (S.flags.clear) { S.ch = Math.max(S.ch || 1, 2); return warp({ map: 'port', x: 1, y: 5, dir: 'right' }); }
      return message('東の街道は、森の件が片づいてからにしよう。');
    }
    if (ev.warp) return warp(ev.warp);
  }

  function warp(w) {
    const from = S.map;
    S.map = w.map; S.x = w.x; S.y = w.y; S.dir = w.dir || S.dir;
    if (MAPS[S.map].layer && !MAPS[from].layer) enterDistrict();
    if (MAPS[from].layer && !MAPS[S.map].layer && S.c5x) S.c5x.follow = null;
    UI.move = null; UI.steps = 0; UI.shadow = null;
    save();
    render();
    enterScene();
  }
  // マップに入ったときの出来事（1 回だけ。when があれば、その条件のときだけ）
  function enterScene() {
    const oe = [].concat(map().onEnter || []).find(o => !S.flags[o.flag] && (!o.when || o.when(S.flags)));
    if (oe) { S.flags[oe.flag] = true; playScene(oe.scene); }
  }

  // =================================================================
  // 問題バトル
  // =================================================================
  function questionPool(B) {
    const E = ENEMIES[B.key], d = S.diff, ch = E.ch || 1;
    const diffs = E.boss ? [d, Math.min(4, d + 1)] : B.key === 'duo' ? [d] : [d, Math.max(1, d - 1)];
    // chs があれば、その章の問題から出す（物語の中の決まった問題 special は混ぜない）。'5:synth' は、その章のその tag だけ
    const chs = E.chs || [ch];
    let pool = Questions.LIST.filter(q => !q.special && (chs.includes(q.ch) || chs.includes(`${q.ch}:${q.tag}`)) && diffs.includes(q.diff));
    // ボスの形態・段階や中ボスの得意分野に合わせて絞る（足りなければ絞らない）
    const tag = B.form ? E.forms[B.form].tag : (stageOf(B, E).tag || E.tag);
    if (tag) { const t = pool.filter(q => q.tag === tag); if (t.length >= 4) pool = t; }
    return pool;
  }
  // 段階のあるボス（ラジカ）は、いまの段階の出題分野と台詞を使う
  const stageOf = (B, E) => (E.stages ? E.stages[Math.min(B.phase, E.stages.length - 1)] : {});
  const voiceOf = (B, E) => (B.form ? E.forms[B.form] : { ...E, ...stageOf(B, E) });
  function pickQuestion(B) {
    if (B.queue) { const id = B.queue.shift(); return Questions.LIST.find(q => q.id === id); }
    // 決まった順に出す段階（ボーカの最後の出題）
    const sg = stageOf(B, ENEMIES[B.key]);
    if (sg.queue) { if (!B.squeue) B.squeue = [...sg.queue]; const id = B.squeue.shift(); return Questions.LIST.find(q => q.id === id); }
    const pool = questionPool(B);
    // いまの難易度の問題を優先し、未出題のものから選ぶ
    let cand = pool.filter(q => !S.used[q.id] && q.diff === S.diff);
    if (!cand.length) cand = pool.filter(q => !S.used[q.id]);
    // 中ボスなどの得意分野は、未出題のものがあれば優先する
    const E = ENEMIES[B.key], topics = stageOf(B, E).topics || E.topics;
    if (topics) {
      let pref = pool.filter(q => !S.used[q.id] && topics.includes(q.topic));
      // 段階のあるボスは、ほかのバトルで出た問題でも、その段階の分野を優先する（同じバトルの中では重ねない）
      if (!pref.length && E.stages) pref = pool.filter(q => topics.includes(q.topic) && !B.asked.has(q.id));
      if (pref.length) cand = pref;
    }
    if (!cand.length) { pool.forEach(q => delete S.used[q.id]); cand = pool.filter(q => !B.asked.has(q.id)); if (!cand.length) cand = pool; }
    const q = cand[Math.floor(Math.random() * cand.length)];
    S.used[q.id] = true; B.asked.add(q.id);
    return q;
  }

  function startBattle(key, random, queue) {
    const E = ENEMIES[key];
    // queue を渡すのは復習ノートの練習。物語の中の決まった問題（E.queue）は、ノートには戻らない
    const fromNote = !!queue;
    if (!queue && E.queue) queue = E.queue;
    const hp = queue ? queue.length * 10 : E.hp;
    UI.battle = {
      key, random, name: E.name, sprite: E.sprite, hp, maxHp: hp, atk: E.atk, phase: 0,
      state: 'intro', lines: [`${E.name}があらわれた！`, `${E.name}「${E.start}」`],
      q: null, order: [], removed: new Set(), asked: new Set(), streak: 0, power: 0, guard: 0, stink: 0, dr: 0,
      uses: Object.fromEntries(S.party.map(id => [id, skillAt(id).uses])),
      timeMax: S.diff >= 4 ? 120 : 90, timeLeft: 0, queue: queue ? [...queue] : null, fromNote, levels: 0,
    };
    if (fromNote) UI.battle.lines = [`${E.name}「${E.start}」`, `ノートの問題 ${queue.length} 問に挑戦する。`];
    else if (E.queue) UI.battle.lines = [E.start];
    // エノラスとアキラルの戦い：カーボではなく 2 人の HP で受ける（0 にはならない）
    if (E.duo) Object.assign(UI.battle, { allyHp: E.ally.hp, allyMax: E.ally.hp });
    // ボーカ：特性はカーボの逆
    if (E.oppTrait) Object.assign(UI.battle, { shadowCfg: S.cfg ? opp(S.cfg) : null, missStreak: 0 });
    if (E.forms) { const F = E.forms.keto; Object.assign(UI.battle, { form: 'keto', name: F.name, sprite: F.sprite, answered: 0 }); }
    // 影のカーボ：HP はカーボの最大 HP の 2 倍、攻撃力はカーボが正解したときのダメージの 3/4。R/S は逆
    if (E.mirror) Object.assign(UI.battle, { hp: S.maxHp * 2, maxHp: S.maxHp * 2, atk: Math.round((10 + (S.lv - 1)) * 0.75), shadowCfg: S.cfg ? opp(S.cfg) : null, missStreak: 0 });
    UI.screen = 'battle';
    if (!queue) Sound.se('encounter');
    render();
  }

  let qTimer = null;
  function stopTimer() { if (qTimer) { clearInterval(qTimer); qTimer = null; } }
  function nextQuestion() {
    const B = UI.battle;
    B.q = pickQuestion(B);
    // ボーカの問いは、選択肢を書いた順のまま出す。制限時間もない
    const idx = B.q.choices.map((_, i) => i);
    B.order = B.q.anyOk ? idx : shuffle(idx);
    B.removed = new Set();
    B.timeLeft = B.timeCap = B.timeMax;
    B.state = 'q';
    render();
    if (B.q.anyOk) stopTimer(); else runTimer(B);
  }
  function runTimer(B) {
    stopTimer();
    qTimer = setInterval(() => {
      B.timeLeft -= 0.25;
      const bar = document.getElementById('qtime');
      if (bar) bar.style.width = `${Math.max(0, B.timeLeft / B.timeCap * 100)}%`;
      const num = document.getElementById('qtnum');
      if (num) num.textContent = Math.ceil(Math.max(0, B.timeLeft));
      if (B.timeLeft <= 0) { stopTimer(); answer(-1); }
    }, 250);
  }

  const taunt = arr => arr[Math.floor(Math.random() * arr.length)];

  function answer(choice) {
    const B = UI.battle, E = ENEMIES[B.key], q = B.q;
    if (B.state !== 'q') return;
    stopTimer();
    // ボーカの問い（anyOk）には、正解も不正解もない
    const ok = q.anyOk ? choice >= 0 : choice === q.a;
    const sg = stageOf(B, E), counts = !E.practice && !q.special;
    // シリルの保護基：間違えても 1 度だけ、ダメージなしで答え直せる（この 1 回は正答率に数えず、ノートには書く）
    if (!ok && B.retry && counts) {
      B.retry = false; B.streak = 0; B.retried = q.id;
      S.notebook[q.id] = (S.notebook[q.id] || 0) + 1;
      if (choice >= 0) B.removed.add(choice);
      else { B.timeLeft = 30; B.timeCap = Math.max(B.timeCap, 30); }
      Sound.se('ng'); render();
      flash(`シリルの保護基が外れて、身代わりになった！ ${choice < 0 ? '30 秒で' : 'もう一度'}答え直せる`);
      return runTimer(B);
    }
    const lines = [], talk = [], pending = [];
    if (counts) {
      S.stats.total++;
      const cs = S.chStats[E.ch || 1] || (S.chStats[E.ch || 1] = { c: 0, t: 0 }); cs.t++; if (ok) cs.c++;
      const tp = S.topics[q.topic] || (S.topics[q.topic] = { c: 0, t: 0 });
      tp.t++; if (ok) tp.c++;
    }
    // アキラルの鏡面の結界のあいだは、カーボの R/S の特性が効かない
    const trait = !(E.barrier && B.phase < 1);
    if (ok) {
      if (counts) S.stats.correct++;
      let dmg = E.practice ? 10 : 10 + (S.lv - 1) + (S.cfg === 'R' && trait ? Math.min(B.streak, 3) * 4 : 0);
      if (B.power && !E.practice) { dmg = Math.round(dmg * B.power); B.power = 0; lines.push('アジーの背面攻撃が決まった！'); }
      if (B.shadowCfg === 'S') dmg = Math.round(dmg * 0.75);    // (S) の影は守りが固い
      if (E.fixedDmg) dmg = E.fixedDmg;
      // 決まった順の段階は、残りの問題で HP をちょうど使いきる（最後の問いで 0 になる）
      if (sg.queue) { const rem = (B.squeue ? B.squeue.length : 0) + 1; dmg = rem <= 1 ? B.hp : Math.floor(B.hp / rem); }
      B.streak++; B.missStreak = 0;
      // 最後に決まった順の段階があるボスは、その段階に入るまで HP が 0 にならない
      const lastQ = E.stages && E.stages[E.stages.length - 1].queue;
      B.hp = lastQ && B.phase < E.stages.length - 1 ? Math.max(1, B.hp - dmg) : Math.max(0, B.hp - dmg);
      if (q.anyOk) lines.push(`${B.name}「${q.replies[choice]}」`);
      else lines.push(`正解！ ${B.name}に ${dmg} のダメージ！${S.cfg === 'R' && trait && B.streak > 1 && !E.practice ? `（${B.streak} 連続正解）` : ''}`);
      // スズの連鎖：正解するたびに HP が戻る
      if (B.drain && !E.practice && S.hp < S.maxHp) { const v = Math.min(B.drain, S.maxHp - S.hp); S.hp += v; lines.push(`スズの連鎖で、HP が ${v} 回復した。`); UI.fx.push({ t: 'heroHeal', v }); }
      // 答え直しで正解した問題は、ノートに残す
      if (S.notebook[q.id] && B.retried !== q.id) { delete S.notebook[q.id]; lines.push('復習ノートの問題を克服した！'); }
      if (B.hp > 0 && !q.anyOk) lines.push(`${B.name}「${taunt(voiceOf(B, E).hit)}」`);
      // ボーカの問いは攻撃ではないので、ダメージの数字も効果音も出さない
      if (!q.anyOk) { UI.fx.push({ t: 'enemyHit', v: dmg }); Sound.se('ok'); setTimeout(() => Sound.se('hit'), 120); } else Sound.se('blip');
      for (const [i, ph] of (E.phases || []).entries()) {
        if (B.phase < i + 1 && B.hp / B.maxHp <= ph.at && B.hp > 0) {
          B.phase = i + 1;
          talk.push(...ph.text.split('\n'));
          if (ph.transform) pending.push(() => { B.sprite = ph.transform; B.name = ph.name; B.atk += ph.atkUp || 0; UI.fx.push({ t: 'transform' }); });
        }
      }
    } else {
      B.streak = 0;
      if (counts) S.notebook[q.id] = (S.notebook[q.id] || 0) + 1;
      // 物語の中の決まった問題は、間違えたら後ろに回して、もう一度出す
      if (B.queue && !B.fromNote) B.queue.push(q.id);
      if (sg.queue) {
        const i = B.squeue.findIndex(id => (Questions.LIST.find(x => x.id === id) || {}).anyOk);
        if (i < 0) B.squeue.push(q.id); else B.squeue.splice(i, 0, q.id);
      }
      if (E.practice) {
        lines.push(`${choice < 0 ? '時間切れ。' : '不正解。'}${B.fromNote ? '（練習なのでダメージはない）' : '（ダメージはない。あとで、もう一度）'}`);
      } else {
        let dmg = Math.max(1, B.atk - B.stink - B.dr);
        if (B.shadowCfg === 'R') dmg += Math.min(B.missStreak || 0, 3) * 4;    // (R) の影は、続けて間違えるほど強くなる
        if (B.shadowCfg) B.missStreak = (B.missStreak || 0) + 1;
        if (S.cfg === 'S' && trait) dmg = Math.max(1, Math.round(dmg * 0.75));
        if (B.guard) { dmg = 0; B.guard--; lines.push('ブトキが立ちはだかった！'); }
        if (E.duo) {
          B.allyHp = Math.max(1, B.allyHp - dmg);
          lines.push(`${choice < 0 ? '時間切れ！ ' : '不正解……。'}${E.ally.name}は ${dmg} のダメージを受けた。`);
        } else {
          // 負けない段階（ボーカの最後の出題）では、HP は 1 より下がらない
          S.hp = sg.noLose ? Math.max(1, S.hp - dmg) : Math.max(0, S.hp - dmg);
          lines.push(`${choice < 0 ? '時間切れ！ ' : '不正解……。'}カーボは ${dmg} のダメージを受けた。`);
        }
        if (counts) lines.push('この問題を復習ノートに書きとめた。');
        if (dmg > 0) UI.fx.push({ t: 'heroHit', v: dmg });
      }
      lines.push(`${B.name}「${taunt(voiceOf(B, E).miss)}」`);
      Sound.se('ng'); if (!E.practice) setTimeout(() => Sound.se('hurt'), 150);
    }
    // ケト形とエノール形の入れ替わり（数問ごと）
    if (E.forms && B.hp > 0 && S.hp > 0 && ++B.answered % E.switchEvery === 0) {
      B.form = B.form === 'keto' ? 'enol' : 'keto';
      const F = E.forms[B.form];
      talk.push(`${F.name}「${F.into}」`, `（エノラスの姿が変わった。出題の分野が変わる）`);
      pending.push(() => { B.name = F.name; B.sprite = F.sprite; UI.fx.push({ t: 'swap' }); });
    }
    // 弁が全開の段階：問題ごとに、ボーカの攻撃力が上がる
    if (sg.atkRise) B.atk = Math.min(E.atk + (sg.atkRiseMax || 99), B.atk + sg.atkRise);
    B.result = { ok, choice, lines };
    B.talk = talk; B.pending = pending;
    B.state = 'result';
    render();
  }

  function battleNext() {
    const B = UI.battle, E = ENEMIES[B.key];
    if (B.state === 'intro') return nextQuestion();
    if (B.state === 'result') {
      if (S.hp <= 0) { B.state = 'lose'; Sound.se('lose'); return render(); }
      const practiceDone = B.queue && !B.queue.length;
      if (B.hp <= 0 || practiceDone) return winBattle();
      // 形態変化などのセリフがあれば、次の問題の前に、問題と同じ場所に出す
      if (B.talk && B.talk.length) {
        // 長い会話は「---」の行でページに分けて、1 ページずつ出す
        const pages = [[]];
        for (const l of B.talk) { if (l.trim() === '---') pages.push([]); else pages[pages.length - 1].push(l); }
        B.talk = pages.shift(); B.talkPages = pages.filter(p => p.length);
        B.state = 'talk'; B.pending.forEach(fn => fn()); B.pending = []; return render();
      }
      return nextQuestion();
    }
    if (B.state === 'talk') {
      if (B.talkPages && B.talkPages.length) { B.talk = B.talkPages.shift(); return render(); }
      B.talk = null; return nextQuestion();
    }
    if (B.state === 'win') return B.levels > 0 ? (B.state = 'levelup', render()) : endBattle(true);
    if (B.state === 'levelup') return; // 技を選ぶまで進まない
    if (B.state === 'lose') return endBattle(false);
    void E;
  }

  function winBattle() {
    const B = UI.battle, E = ENEMIES[B.key];
    B.state = 'win';
    B.lines = E.winLines ? [...E.winLines] : [`${B.name}「${E.win}」`];
    if (!E.practice) {
      if (!E.winLines) B.lines.push(`${B.name}をたおした！`);
      if (E.exp || E.money) B.lines.push(E.money ? `経験値 ${E.exp} と、研究費 ${yen(E.money)} を手に入れた。` : `経験値 ${E.exp} を手に入れた。`);
      S.exp += E.exp; S.money += E.money;
      while (S.exp >= expToNext(S.lv)) {
        S.exp -= expToNext(S.lv); S.lv++;
        S.maxHp += HP_PER_LV; S.hp = Math.min(S.maxHp, S.hp + HP_PER_LV);
        B.levels++;
        B.lines.push(`レベルが上がった！ カーボは Lv${S.lv} になった。最大 HP +${HP_PER_LV}`);
      }
      Sound.se(B.levels ? 'level' : 'win');
    }
    render();
  }

  function upgradeSkill(id) {
    const B = UI.battle;
    if (!B || B.state !== 'levelup') return;
    if (id && skillLv(id) < SKILL_MAX) {
      S.skillLv[id] = skillLv(id) + 1;
      flash(`${comp(id).name}の「${comp(id).skill.name}」が Lv${S.skillLv[id]} になった！`);
      Sound.se('heal');
    }
    B.levels--;
    if (B.levels > 0) return render();
    endBattle(true);
  }

  function endBattle(won) {
    stopTimer();
    const B = UI.battle;
    UI.battle = null;
    if (!won) { UI.scene = null; UI.screen = 'over'; return render(); }
    save();
    if (B && B.fromNote) { UI.screen = 'note'; return render(); }
    UI.screen = 'world';
    render();
    if (UI.scene) { runCommands(); }
  }

  function useSkill(id) {
    const B = UI.battle;
    if (B.state !== 'q' || !(B.uses[id] > 0)) return;
    const c = comp(id), sk = c.skill.id, L = skillAt(id);
    if (sk === 'heal' && S.hp >= S.maxHp) return flash('HP は満タンだ');
    B.uses[id]--;
    flash(`${c.name}の「${c.skill.name}」！ ${L.desc.replace(/（1 バトル \d 回）/, '')}`);
    if (sk === 'heal') { S.hp = Math.min(S.maxHp, S.hp + L.v); Sound.se('heal'); UI.fx.push({ t: 'heroHeal', v: L.v }); }
    else Sound.se('blip');
    if (sk === 'power') B.power = L.v;
    if (sk === 'stink') B.stink = Math.max(B.stink, L.v);
    if (sk === 'guard') { B.guard++; B.dr = Math.max(B.dr, L.v); }
    if (sk === 'time') { B.timeLeft += L.v; B.timeCap = Math.max(B.timeCap, B.timeLeft); }
    if (sk === 'retry') { B.retry = true; if (L.t) { B.timeLeft += L.t; B.timeCap = Math.max(B.timeCap, B.timeLeft); } }
    if (sk === 'drain') B.drain = Math.max(B.drain || 0, L.v);
    if (sk === 'fifty') { removeWrong(L.v); if (L.t) { B.timeLeft += L.t; B.timeCap = Math.max(B.timeCap, B.timeLeft); } }
    render();
  }
  function removeWrong(n) {
    const B = UI.battle;
    const wrong = shuffle([0, 1, 2, 3].filter(i => i !== B.q.a && !B.removed.has(i)));
    wrong.slice(0, n).forEach(i => B.removed.add(i));
  }
  function useItem(id) {
    const B = UI.battle, it = ITEMS[id];
    if (B.state !== 'q' || !S.items[id]) return;
    if (it.heal) { if (S.hp >= S.maxHp) return; S.hp = Math.min(S.maxHp, S.hp + it.heal); Sound.se('heal'); UI.fx.push({ t: 'heroHeal', v: it.heal }); }
    if (id === 'book') { removeWrong(1); Sound.se('blip'); }
    flash(`${it.name}を使った！ ${it.desc}`);
    S.items[id]--;
    render();
  }

  function flash(text, cls = 'good') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = `toast ${cls}`; el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  // ---- 演出（ダメージの数字・揺れ・変身の光） ----------------------
  function applyFx() {
    const list = UI.fx; UI.fx = [];
    if (!list.length) return;
    const pop = (target, text, cls) => {
      if (!target) return;
      const el = document.createElement('div');
      el.className = `dmg ${cls}`; el.textContent = text;
      target.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    };
    for (const f of list) {
      if (f.t === 'enemyHit') {
        const box = document.querySelector('.enemy-box');
        pop(box, `−${f.v}`, 'to-enemy');
        const c = document.getElementById('ecv');
        if (c) { c.classList.remove('hit'); void c.offsetWidth; c.classList.add('hit'); }
      }
      if (f.t === 'heroHit') {
        pop(document.querySelector('.hero-bar'), `−${f.v}`, 'to-hero');
        const b = document.querySelector('.battle');
        if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
      }
      if (f.t === 'heroHeal') pop(document.querySelector('.hero-bar'), `+${f.v}`, 'heal');
      if (f.t === 'swap') {
        const w = document.createElement('div');
        w.className = 'whiteout soft';
        document.body.appendChild(w);
        setTimeout(() => w.remove(), 700);
        Sound.se('encounter');
      }
      if (f.t === 'transform') {
        const w = document.createElement('div');
        w.className = 'whiteout';
        document.body.appendChild(w);
        setTimeout(() => w.remove(), 900);
        Sound.se('transform');
      }
    }
  }

  // ---- バトル画面 -------------------------------------------------
  // 選択肢 1 つ分の中身（構造式の問題なら構造式、結果表示では名前も添える）
  // 問題文に出てくる化合物の構造式（名前つきで並べる）
  const narrow = () => window.matchMedia && window.matchMedia('(max-width: 560px)').matches;
  const molsRow = (q, maxW = 300) => q.mols ? `<div class="q-mols">${q.mols.map(([label, smi]) =>
    `<figure>${narrow() ? Mol.autoTag(smi, '', 96, Math.min(maxW, 170)) : Mol.autoTag(smi, '', 120, maxW)}<figcaption>${esc(label)}</figcaption></figure>`).join('')}</div>` : '';
  function choiceInner(q, i, reveal) {
    const smi = q.cs && q.cs[i];
    // cm: 名前はそのまま見せて、構造式を添える
    if (!smi && q.cm && q.cm[i]) return `<span class="c-text">${esc(q.choices[i])}</span>${narrow() ? Mol.autoTag(q.cm[i], 'c-mol', 96, 200) : Mol.autoTag(q.cm[i], 'c-mol', 110, 260)}`;
    if (!smi) return esc(q.choices[i]);
    const note = q.cl && q.cl[i] ? `<span class="c-note">${esc(q.cl[i])}</span>` : '';
    return `${narrow() ? Mol.svgTag(smi, 140, 80) : Mol.svgTag(smi, 170, 100)}${note}${reveal ? `<span class="c-name">${esc(q.choices[i])}</span>` : ''}`;
  }

  function vBattle() {
    const B = UI.battle, E = ENEMIES[B.key];
    let body = '';
    if (B.state === 'talk') {
      // 「名前「台詞」」は話者と台詞に分け、（　）はト書きとして出す
      const rows = B.talk.map((l, i) => {
        const m = !l.startsWith('（') && l.match(/^([^「]+)「([\s\S]*)」$/);
        if (!m) return `<p class="t-narr">${esc(l)}</p>`;
        return `<div class="t-line">${faceFor(m[1], B) ? `<canvas class="t-face" data-i="${i}" width="96" height="96"></canvas>` : ''}<div><div class="speaker">${esc(m[1])}</div><div class="t-text">${esc(m[2])}</div></div></div>`;
      }).join('');
      body = win(`<div class="talk">${rows}</div><div class="center"><button class="btn big" data-act="bNext">つぎへ</button></div>`, 'qwin talkwin');
    } else if (B.state === 'intro' || B.state === 'win' || B.state === 'lose') {
      const lines = B.state === 'lose' ? ['カーボは力尽きた……'] : B.lines;
      body = win(`${lines.map(l => `<p>${esc(l)}</p>`).join('')}<div class="center"><button class="btn big" data-act="bNext">${B.state === 'intro' ? (E.practice ? 'はじめる' : 'たたかう') : 'つぎへ'}</button>
        ${B.state === 'intro' && B.random ? '<button class="btn" data-act="run">にげる</button>' : ''}</div>`, 'msg');
    } else if (B.state === 'levelup') {
      const opts = S.party.map((id, k) => {
        const c = comp(id), lv = skillLv(id), max = lv >= SKILL_MAX;
        return `<button class="skill up" style="--ac:${c.color}" data-act="upgrade" data-arg="${id}" ${max ? 'disabled' : ''}>
          <span class="sk-name"><span class="sk-key">${k + 1}</span>${c.name}「${c.skill.name}」 Lv${lv}${max ? '（最大）' : ` → Lv${lv + 1}`}</span>
          <span class="sk-desc">いま: ${esc(skillAt(id).desc)}</span>
          ${max ? '' : `<span class="sk-desc accent">強化後: ${esc(skillAt(id, lv + 1).desc)}</span>`}</button>`;
      }).join('');
      const allMax = S.party.every(id => skillLv(id) >= SKILL_MAX);
      body = win(`<h3>レベルアップ！ 強化する技を 1 つ選ぶ</h3>
        <p class="small dim">Lv${S.lv}　最大 HP ${S.maxHp}${B.levels > 1 ? `　（あと ${B.levels} 回選べる）` : ''}</p>
        <div class="skills">${opts}</div>
        ${allMax ? '<div class="center"><button class="btn" data-act="upgrade" data-arg="">技はすべて最大。つぎへ</button></div>' : ''}`, 'msg');
    } else {
      const q = B.q;
      // 分野の名前がそのまま正解になる問題があるので、分野は答えたあとに見せる
      const head = `<div class="q-head">${q.special ? '' : `<span class="chip dim">${esc(Questions.DIFFS[q.diff].name)}</span>`}${B.state === 'q' && !q.special ? '' : `<span class="chip ${q.anyOk ? 'ok' : 'dim'}">${esc(q.topic)}</span>`}${q.cs ? '<span class="chip ok">構造式で答える</span>' : ''}${S.notebook[q.id] ? '<span class="chip bad">復習ノートの問題</span>' : ''}</div>`;
      const qbox = `${head}<p class="q-text">${esc(q.q)}</p>${q.smiles ? `<div class="q-mol">${Mol.svgTag(q.smiles, 220, 130, 'big')}</div>` : ''}${molsRow(q)}`;
      const grid = q.cs ? 'choices struct' : q.cm ? 'choices withmol' : 'choices';
      if (B.state === 'q') {
        const choices = B.order.map((i, k) => `<button class="choice" data-act="answer" data-arg="${i}" ${B.removed.has(i) ? 'disabled' : ''}><span class="c-key">${k + 1}</span>${choiceInner(q, i, false)}</button>`).join('');
        const skills = S.party.map(id => { const c = comp(id), L = skillAt(id), left = B.uses[id];
          return `<button class="skill" style="--ac:${c.color}" data-act="skill" data-arg="${id}" ${left > 0 ? '' : 'disabled'}>
            <span class="sk-name">${c.name}「${c.skill.name}」 Lv${skillLv(id)}${left > 0 ? (L.uses > 1 ? `<span class="sk-used">あと ${left} 回</span>` : '') : '<span class="sk-used">使用済み</span>'}</span>
            <span class="sk-desc">${esc(L.desc)}</span></button>`; }).join('');
        const items = Object.keys(ITEMS).filter(id => S.items[id]).map(id => {
          const full = ITEMS[id].heal && S.hp >= S.maxHp;
          return `<button class="skill item" data-act="item" data-arg="${id}" ${full ? 'disabled' : ''}>
            <span class="sk-name">${ITEMS[id].name} ×${S.items[id]}${full ? '<span class="sk-used">HP 満タン</span>' : ''}</span>
            <span class="sk-desc">${esc(ITEMS[id].desc)}</span></button>`; }).join('');
        const flags = [B.power ? '背面攻撃 準備中' : '', B.guard ? '立体障害で守っている' : '', B.dr ? `被ダメージ −${B.dr}` : '', B.stink ? `悪臭で敵がひるんでいる（−${B.stink}）` : '', B.retry ? '保護基で守っている（1 回答え直せる）' : '', B.drain ? `連鎖：正解するたびに HP +${B.drain}` : '',
          E.barrier && B.phase < 1 ? '鏡面の結界：R/S の特性が効かない' : '', B.shadowCfg ? `${E.mirror ? '影' : B.name}は (${B.shadowCfg})：${B.shadowCfg === 'S' ? 'こちらの与えるダメージ −25%' : '続けて間違えるほど、攻撃が上がる'}` : '',
          stageOf(B, E).atkRise ? '弁が全開：問題ごとに攻撃が強くなる' : ''].filter(Boolean).map(t => `<span class="chip ok">${t}</span>`).join('');
        const timer = q.anyOk ? '' : `<div class="timer"><div class="bar time"><div id="qtime" style="width:${B.timeLeft / B.timeCap * 100}%"></div></div><span id="qtnum" class="small">${Math.ceil(B.timeLeft)}</span></div>`;
        body = win(`${qbox}${timer}`, 'qwin')
          + `<div class="${grid}">${choices}</div>`
          + (E.practice || E.noSkills || q.anyOk ? '' : `<div class="skills-head small dim">仲間の技・どうぐ</div><div class="skills">${skills}${items}</div>`)
          + (flags && !q.anyOk ? `<div class="status">${flags}</div>` : '');
      } else {
        const r = B.result;
        // ボーカの問いは、選んだ答えだけを示す（正解も不正解もない）
        const right = q.anyOk ? r.choice : q.a;
        const choices = B.order.map(i => `<div class="choice shown ${i === right ? 'right' : i === r.choice ? 'wrong' : ''}"><span class="c-key">${i === right ? '○' : i === r.choice ? '×' : '　'}</span>${choiceInner(q, i, true)}</div>`).join('');
        body = win(qbox, 'qwin') + `<div class="${grid}">${choices}</div>`
          + win(`${q.anyOk ? '' : `<p class="${r.ok ? 'accent' : 'bad-text'}"><b>${r.ok ? '正解！' : r.choice < 0 ? '時間切れ' : '不正解'}</b></p><p class="explain">${esc(q.explain)}</p>`}
              <div class="dlog" id="dtext" data-full="${esc(r.lines.join('\n'))}"></div>
              <div class="center"><button class="btn big" data-act="bNext">つぎへ</button></div>`, 'msg');
      }
    }
    return `<div class="battle">
      <div class="enemy-box win">
        <canvas id="ecv" width="128" height="128"></canvas>
        <div class="enemy-info"><h3>${esc(B.name)}</h3>${hpBar(B.hp, B.maxHp, 'enemy')}<div class="small dim">${E.practice ? `残り ${B.queue ? B.queue.length + (B.state === 'q' ? 1 : 0) : 0} 問` : E.duo ? `仮面のひび ${Math.round((1 - B.hp / B.maxHp) * 100)}%` : `攻撃力 ${Math.max(1, B.atk - B.stink)}`}</div></div>
        <div class="b-mute">${muteBtn()}</div>
      </div>
      ${body}
      <div class="hero-bar win small">${E.duo ? `${E.ally.name}　HP ${B.allyHp}/${B.allyMax} ${hpBar(B.allyHp, B.allyMax, 'hp')}` : `${heroName()} Lv${S.lv}　HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}${S.cfg === 'R' && B.streak ? `<span class="chip ok">${B.streak} 連続正解</span>` : ''}`}</div>
    </div>`;
  }

  // バトルのセリフの画面の顔
  function drawTalkFaces() {
    const B = UI.battle;
    if (!B || B.state !== 'talk') return;
    document.querySelectorAll('.t-face').forEach(cv => {
      const m = B.talk[+cv.dataset.i].match(/^([^「]+)「/), face = m && faceFor(m[1], B);
      if (face) drawFace(cv, face);
    });
  }
  function drawEnemy() {
    const c = document.getElementById('ecv');
    if (!c || !UI.battle) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    const duo = UI.battle.sprite === 'mesoDuo', s = duo ? 80 : 112;
    Sprites.drawChar(g, UI.battle.sprite, (c.width - s) / 2, c.height - s, s, { colors: S.party.map(id => comp(id).color) });
  }

  // ---- 復習ノート --------------------------------------------------
  function vNote() {
    const ids = Object.keys(S.notebook);
    const qs = ids.map(id => Questions.LIST.find(q => q.id === id)).filter(Boolean);
    const topics = Object.entries(S.topics).sort((a, b) => (a[1].c / a[1].t) - (b[1].c / b[1].t));
    const trows = topics.map(([t, v]) => { const r = Math.round(v.c / v.t * 100);
      return `<tr><td>${esc(t)}</td><td class="num">${v.c}/${v.t}</td><td class="rate"><div class="bar ${r >= 70 ? 'hp' : r >= 40 ? 'yield' : 'enemy'}"><div style="width:${r}%"></div></div></td><td class="num">${r}%</td></tr>`; }).join('');
    const cards = qs.map(q => `<details class="note-q">
        <summary><span class="chip dim">${esc(q.topic)}</span><span class="chip dim">${esc(Questions.DIFFS[q.diff].name)}</span> ${esc(q.q)} <span class="small bad-text">×${S.notebook[q.id]}</span></summary>
        ${q.smiles ? `<div class="q-mol">${Mol.svgTag(q.smiles, 200, 120)}</div>` : ''}${molsRow(q, 240)}
        <p>正解: <b class="accent">${esc(q.choices[q.a])}</b></p>
        ${(q.cs && q.cs[q.a]) || (q.cm && q.cm[q.a]) ? `<div class="q-mol">${Mol.svgTag((q.cs && q.cs[q.a]) || q.cm[q.a], 180, 100)}</div>` : ''}
        <p class="explain">${esc(q.explain)}</p>
      </details>`).join('');
    return `<h2 class="screen-title">復習ノート</h2>
      ${win(`<h3>分野ごとの正答率</h3>${topics.length ? `<table class="results"><tbody>${trows}</tbody></table>` : '<p class="dim">まだ問題に答えていない。</p>'}`)}
      ${win(`<h3>間違えた問題（${qs.length} 問）</h3>
        <p class="small dim">バトルや練習で正解すると、ノートから消える。タップで解説を開く。</p>
        ${qs.length ? cards : '<p class="dim">いまは間違えた問題がない。</p>'}
        <div class="center">${qs.length ? `<button class="btn big" data-act="practice">分子模型くんと練習する（${Math.min(10, qs.length)} 問）</button>` : ''}
        <button class="btn" data-act="closeNote">もどる</button></div>`)}`;
  }

  // ---- 最後の一枚絵：棚に並んだ 2 本の瓶。文字はアルファベットと数字だけ ----
  function vEnding() {
    return `<div class="ending" data-act="endingNext"><canvas id="endcv" width="960" height="600" role="img" aria-label="(${S.cfg})-carbo / (${opp(S.cfg)})-obrac"></canvas><div class="end-next">▶</div></div>`;
  }
  function drawEnding() {
    const c = document.getElementById('endcv');
    if (!c) return;
    const g = c.getContext('2d'), W = c.width / 2, H = c.height / 2;
    g.imageSmoothingEnabled = false;
    g.setTransform(2, 0, 0, 2, 0, 0);
    // 朝の光の研究所の壁と、窓の光
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f7e7c4'); bg.addColorStop(1, '#d9c39a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255, 250, 230, .55)';
    g.beginPath(); g.moveTo(W * 0.62, 0); g.lineTo(W * 0.86, 0); g.lineTo(W * 0.66, H); g.lineTo(W * 0.38, H); g.closePath(); g.fill();
    // 棚板
    g.fillStyle = '#8a5f33'; g.fillRect(30, 222, W - 60, 14);
    g.fillStyle = '#a8763f'; g.fillRect(30, 222, W - 60, 4);
    g.fillStyle = '#5e3d1f'; g.fillRect(30, 236, W - 60, 4);
    const date = (() => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; })();
    const me = S.cfg || 'R', other = opp(me);
    // 2 本の瓶（左が carbo、右が obrac。中の結晶は鏡合わせ）
    [[W / 2 - 110, `(${me})-carbo`, 1], [W / 2 + 14, `(${other})-obrac`, -1]].forEach(([x, label, twist]) => {
      const y = 88, w = 96, h = 134;
      g.fillStyle = 'rgba(0, 0, 0, .12)'; g.fillRect(x + 6, y + h - 4, w, 6);                  // 影
      g.fillStyle = 'rgba(230, 245, 255, .55)'; g.fillRect(x, y + 22, w, h - 22);              // 瓶
      g.fillStyle = 'rgba(255, 255, 255, .7)'; g.fillRect(x + 6, y + 30, 6, h - 40);
      g.strokeStyle = '#7f98ad'; g.lineWidth = 3; g.strokeRect(x, y + 22, w, h - 22);
      g.fillStyle = '#2f3a48'; g.fillRect(x + 8, y, w - 16, 24);                                // ふた
      g.fillStyle = '#4a5868'; g.fillRect(x + 8, y, w - 16, 6);
      // 結晶（ねじれの向きが逆）
      const cx = x + w / 2, cy = y + h - 30;
      g.save(); g.translate(cx, cy); g.scale(twist * 1.3, 1.3);
      g.fillStyle = twist > 0 ? '#bfe8ff' : '#ffd9f2'; g.strokeStyle = twist > 0 ? '#5aa8d8' : '#d878b8'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-12, 16); g.lineTo(-4, -22); g.lineTo(12, -10); g.lineTo(6, 16); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255, 255, 255, .8)'; g.fillRect(-4, -12, 3, 18);
      g.restore();
      // ラベル（手書き風。アルファベットと数字だけ）
      g.fillStyle = '#fbf8ef'; g.fillRect(x + 4, y + 30, w - 8, 40);
      g.strokeStyle = '#c9bfa6'; g.lineWidth = 1; g.strokeRect(x + 4, y + 30, w - 8, 40);
      g.fillStyle = '#2a2a3a'; g.textAlign = 'center';
      g.font = 'italic bold 15px "Courier New", monospace'; g.fillText(label, x + w / 2, y + 48);
      g.font = '12px "Courier New", monospace'; g.fillText(date, x + w / 2, y + 64);
    });
  }

  // ---- ゲームオーバー・クリア・シェア --------------------------------
  function vOver() {
    return `<h2 class="screen-title">カーボは倒れた……</h2>
      ${win(`<p class="story">……気を失っていたらしい。仲間たちが手を引いて、最後に休んだ場所まで連れ戻してくれた。</p>`, 'msg')}
      <div class="center"><button class="btn big" data-act="continue">最後のセーブから再開</button><button class="btn" data-act="toTitle">タイトルへ</button></div>`;
  }

  const TITLES = [[90, '不斉の勇者'], [75, '求核の剣士'], [60, '見習い化学者'], [0, 'ラセミの迷い子']];
  const CHAPTERS = { 1: '第1章「求核の森」', 2: '第2章「カルボニル港」', 3: '第3章「芳香族の王国」', 4: '第4章「鏡の回廊」', 5: '第5章「廃液街」' };
  const NEXT = { 1: '第2章「カルボニル港」', 2: '第3章「芳香族の王国」', 3: '第4章「鏡の回廊」', 4: '第5章「廃液街」' };
  const NEXT_ACT = { 1: 'toCh2', 2: 'toCh3', 3: 'toCh4', 4: 'toCh5' };
  const clearCh = () => UI.clearCh || (S.flags.clear5 ? 5 : S.flags.clear4 ? 4 : S.flags.clear3 ? 3 : S.flags.clear2 ? 2 : 1);
  function clearResult() {
    const ch = clearCh();
    const cs = S.chStats[ch], st = cs ? { correct: cs.c, total: cs.t } : S.stats;
    const rate = st.total ? Math.round(st.correct / st.total * 100) : 0;
    const title = TITLES.find(([th]) => rate >= th)[1];
    return { st, rate, title };
  }
  // ネタバレを含まない共有用の文面
  function shareText() {
    const { st, rate, title } = clearResult();
    return `CarbonRPG ${CHAPTERS[clearCh()]}をクリア！\n`
      + `難易度：${Questions.DIFFS[S.diff].name}／正答率 ${rate}%（${st.correct}/${st.total} 問）\n`
      + `称号：${title}${S.cfg ? `　(${S.cfg})-カーボ Lv${S.lv}` : ''}\n#CarbonRPG #有機化学`;
  }
  function vClear() {
    const { st, rate, title } = clearResult();
    const text = shareText();
    const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(GAME_URL)}&text=${encodeURIComponent(text)}`;
    const ch = clearCh();
    return `<h2 class="screen-title">${CHAPTERS[ch]}クリア！</h2>
      ${win(`<p class="center">難易度: ${Questions.DIFFS[S.diff].name}</p>
        <p class="center big-cfg">正答率 ${rate}%</p><p class="center small">${st.correct} / ${st.total} 問正解</p>
        <p class="center">称号「<span class="accent">${title}</span>」</p>
        <p class="center small dim">${S.cfg ? `${heroName()} Lv${S.lv}　${heroFormula(S.party)}` : ''}</p>`, 'msg')}
      ${win(`<h3>結果をシェアする</h3>
        <pre class="share-text">${esc(text)}\n${GAME_URL}</pre>
        <div class="share-btns">
          ${navigator.share ? '<button class="btn" data-act="shareNative">共有…</button>' : ''}
          <a class="btn" href="${xUrl}" target="_blank" rel="noopener noreferrer">X でポスト</a>
          <a class="btn" href="${lineUrl}" target="_blank" rel="noopener noreferrer">LINE で送る</a>
          <button class="btn" data-act="shareCopy">文面をコピー</button>
        </div>
        <p class="small dim">ストーリーのネタバレは含まれません。</p>`)}
      ${NEXT_ACT[ch] ? `<div class="center"><button class="btn big" data-act="${NEXT_ACT[ch]}">▶ ${NEXT[ch]}へ進む</button></div>`
        : `<p class="center accent">全 5 章クリア！ 最後まで遊んでくれて、ありがとう。</p><div class="center"><button class="btn big" data-act="afterClear">▶ その後の世界を歩く</button></div>`}
      <div class="center"><button class="btn" data-act="clearNote">復習ノートを見る</button><button class="btn" data-act="toTitle">タイトルへ</button></div>`;
  }
  function fallbackCopy(t) {
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (!ok) flash('コピーできませんでした。上の文面を長押しでコピーしてください', 'bad');
    return ok;
  }

  // =================================================================
  // 入力
  // =================================================================
  const actions = {
    newGame() { UI.screen = 'diff'; render(); },
    devTap() {
      const now = Date.now();
      UI.devTaps = [...(UI.devTaps || []).filter(t => now - t < 2000), now];
      if (UI.devTaps.length < 5 || typeof DevStart === 'undefined') return;
      UI.devTaps = []; UI.dev = UI.dev || { diff: 2, cfg: 'S' };
      Sound.se('level'); UI.screen = 'dev'; render();
    },
    devDiff(d) { UI.dev.diff = +d; render(); },
    devCfg(c) { UI.dev.cfg = c; render(); },
    devStart(n) {
      n = +n;
      if (n === 1) return actions.pickDiff(UI.dev.diff);
      S = devState(n, UI.dev.diff, UI.dev.cfg);
      UI.shadow = null; UI.scene = null; UI.msg = null; UI.menu = false; UI.shop = false; UI.clearCh = null;
      if (n <= 5) return actions[`toCh${n}`]();
      S.map = 'lab'; S.x = 5; S.y = 5; S.dir = 'up';
      save(); UI.screen = 'world'; render();
    },
    continue() {
      const s = loadSave();
      if (!s) return;
      S = normalize(s);
      if (S.hp <= 0 || UI.screen === 'over') S.hp = S.maxHp;
      UI.shadow = null;   // 鏡の広間の影は、読み込んだ位置に合わせて置き直す
      UI.scene = null; UI.msg = null; UI.menu = false; UI.shop = false;
      UI.screen = 'world';
      render();
      if (!S.cfg) return playScene('prologue');
      enterScene();
    },
    pickDiff(d) {
      S = freshState(+d);
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 何もしない */ }
      UI.screen = 'world';
      render();
      playScene('prologue');
    },
    toggleComp(id) {
      if (UI.swap && !S.owned.includes(id)) return;
      const i = UI.pick.indexOf(id);
      if (i >= 0) UI.pick.splice(i, 1); else if (UI.pick.length < 4) UI.pick.push(id);
      keepCfg();
      Sound.se('blip');
      render();
    },
    unbond(i) { UI.pick.splice(+i, 1); render(); },
    swap() { if (UI.pick.length === 4 && !UI.swap) { [UI.pick[2], UI.pick[3]] = [UI.pick[3], UI.pick[2]]; render(); } },
    bondDone() {
      if (UI.pick.length !== 4) return;
      if (UI.swap) {
        // 付け替え：R/S はそのまま（keepCfg で並びを合わせる）。技のレベルは仲間ごとに残る
        keepCfg();
        if (heroCfg(UI.pick) !== S.cfg) return;
        S.party = [...UI.pick];
        S.party.forEach(id => { if (!S.skillLv[id]) S.skillLv[id] = 1; });
        UI.swap = false; UI.screen = 'world';
        save(); render(); Sound.se('heal');
        flash(`結合しなおした！ ${heroName()}　${heroFormula(S.party)}`);
        return;
      }
      S.party = [...UI.pick];
      S.owned = [...new Set([...S.owned, ...S.party])];
      S.cfg = heroCfg(S.party);
      S.maxHp = maxHpFor(S.lv, S.cfg);
      S.hp = S.maxHp;
      S.party.forEach(id => { S.skillLv[id] = 1; });
      save();
      UI.screen = 'world';
      render();
      runCommands();
    },
    openSwap() { UI.menu = false; UI.swap = true; UI.pick = [...S.party]; UI.screen = 'party'; render(); },
    cancelSwap() { UI.swap = false; UI.screen = 'world'; render(); },
    buyComp(id) {
      const c = comp(id);
      if (!c || S.owned.includes(id) || S.money < priceOf(c)) return;
      S.money -= priceOf(c); S.owned.push(id);
      if (!S.skillLv[id]) S.skillLv[id] = 1;
      Sound.se('level'); save(); refreshHud(); renderOverlay();
      flash(`${c.name}が仲間になった！ メニューの「仲間を付け替える」で結合できる`);
    },
    advance() { advance(); },
    menu() { if (UI.scene || UI.msg || UI.shop) return; UI.menu = !UI.menu; Sound.se('blip'); renderOverlay(); },
    drink(id) {
      const it = ITEMS[id];
      if (S.items[id] > 0 && it.heal && S.hp < S.maxHp) { S.items[id]--; S.hp = Math.min(S.maxHp, S.hp + it.heal); Sound.se('heal'); refreshHud(); renderOverlay(); }
    },
    buy(id) {
      const it = ITEMS[id];
      if (S.money < it.price) return;
      S.money -= it.price; S.items[id] = (S.items[id] || 0) + 1;
      Sound.se('coin'); save(); refreshHud(); renderOverlay();
      flash(`${it.name}を買った！`);
    },
    closeShop() { UI.shop = false; renderOverlay(); },
    saveNow() { save(); UI.menu = false; message('セーブしました。'); },
    openNote() { UI.menu = false; UI.screen = 'note'; render(); },
    closeNote() { UI.screen = 'world'; render(); },
    clearNote() { UI.noteFromClear = true; UI.screen = 'note'; render(); },
    choose(i) { choose(i); },
    toCh2() {
      S.ch = 2; S.hp = S.maxHp; UI.clearCh = null;
      S.map = 'town'; S.x = 19; S.y = 5; S.dir = 'right';
      save(); UI.screen = 'world'; render();
      if (!S.flags.ch2) playScene('c2_start');
    },
    toCh3() {
      S.ch = 3; S.hp = S.maxHp; UI.clearCh = null;
      S.map = 'port'; S.x = 13; S.y = 15; S.dir = 'left';
      save(); UI.screen = 'world'; render();
      if (!S.flags.ch3) playScene('c3_start');
    },
    toCh4() {
      S.ch = 4; S.hp = S.maxHp; UI.clearCh = null;
      S.map = 'lab'; S.x = 5; S.y = 5; S.dir = 'up';
      save(); UI.screen = 'world'; render();
      if (!S.flags.ch4) playScene('c4_start');
    },
    toCh5() {
      S.ch = 5; S.hp = S.maxHp; UI.clearCh = null;
      S.map = 'lab'; S.x = 5; S.y = 5; S.dir = 'up';
      save(); UI.screen = 'world'; render();
      if (!S.flags.ch5) playScene('c5_start');
    },
    // 全章クリアのあと、その後の世界を歩く
    afterClear() { UI.clearCh = null; UI.screen = 'world'; render(); },
    // 最後の一枚絵から、クリア画面へ
    endingNext() { UI.screen = 'world'; render(); runCommands(); },
    practice() {
      const ids = shuffle(Object.keys(S.notebook)).slice(0, 10);
      if (ids.length) startBattle('practice', false, ids);
    },
    bNext() { battleNext(); },
    answer(i) { answer(+i); },
    skill(id) { useSkill(id); },
    item(id) { useItem(id); },
    upgrade(id) { upgradeSkill(id); },
    run() { const B = UI.battle; if (B && B.random) { UI.battle = null; UI.screen = 'world'; render(); message('うまく にげきれた。'); } },
    mute() { Sound.setMuted(!Sound.isMuted()); document.querySelectorAll('[data-act=mute]').forEach(b => { b.textContent = Sound.isMuted() ? '♪ 音: OFF' : '♪ 音: ON'; }); },
    toTitle() { stopTimer(); UI.screen = 'title'; UI.scene = null; UI.msg = null; render(); },
    shareNative() { navigator.share({ title: 'CarbonRPG', text: shareText(), url: GAME_URL }).catch(() => { /* 閉じられたときは何もしない */ }); },
    shareCopy() {
      const t = `${shareText()}\n${GAME_URL}`;
      const done = () => flash('文面をコピーしました');
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t) && done());
      else if (fallbackCopy(t)) done();
    },
  };
  // クリア画面から開いたノートは、閉じるとクリア画面に戻る
  const closeNote0 = actions.closeNote;
  actions.closeNote = () => { if (UI.noteFromClear) { UI.noteFromClear = false; UI.screen = 'clear'; render(); } else closeNote0(); };

  // 最初の操作で音を有効にする（ブラウザの自動再生の決まり）
  const unlock = () => Sound.init();
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  app.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.act];
    if (fn) fn(el.dataset.arg);
  });

  // 操作パッド（押している間は歩き続ける）
  app.addEventListener('pointerdown', e => {
    const b = e.target.closest('.pd');
    if (!b) return;
    e.preventDefault();
    if (b.dataset.dir) { if (!busy()) UI.held = b.dataset.dir; }
    else if (b.dataset.key === 'a') action();
  });
  const release = () => { UI.held = null; };
  app.addEventListener('pointerup', release);
  app.addEventListener('pointercancel', release);
  app.addEventListener('pointerleave', release);

  const KEYDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  window.addEventListener('keydown', e => {
    // タイトル：上下キーでメニューを選び、Enter で決める（決定はボタンの標準の動き）
    if (UI.screen === 'title' && ['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
      const bs = [...document.querySelectorAll('.title-menu .tbtn')];
      if (!bs.length) return;
      e.preventDefault();
      const i = bs.indexOf(document.activeElement), d = ['ArrowUp', 'w'].includes(e.key) ? -1 : 1;
      bs[(i < 0 ? 0 : i + d + bs.length) % bs.length].focus();
      Sound.se('blip');
      return;
    }
    if (UI.screen === 'battle') {
      const B = UI.battle;
      if (B && B.state === 'q' && ['1', '2', '3', '4'].includes(e.key)) { const i = B.order[+e.key - 1]; if (i !== undefined && !B.removed.has(i)) answer(i); }
      // レベルアップ：1〜4 キーで強化する技を選ぶ（技がすべて最大なら Enter で進む）
      else if (B && B.state === 'levelup' && !e.repeat) {
        const id = S.party[+e.key - 1];
        if (id && skillLv(id) < SKILL_MAX) upgradeSkill(id);
        else if (['Enter', ' ', 'z', 'Z'].includes(e.key) && S.party.every(p => skillLv(p) >= SKILL_MAX)) { e.preventDefault(); upgradeSkill(''); }
      }
      else if (['Enter', ' ', 'z', 'Z'].includes(e.key) && B && !['q', 'levelup'].includes(B.state)) { e.preventDefault(); if (!finishTyping()) battleNext(); }
      return;
    }
    if (UI.screen === 'ending' && ['Enter', ' ', 'z', 'Z'].includes(e.key)) { e.preventDefault(); actions.endingNext(); return; }
    if (UI.screen !== 'world') return;
    if (UI.choice && ['1', '2', '3', '4'].includes(e.key)) { choose(+e.key - 1); return; }
    if (KEYDIR[e.key]) { e.preventDefault(); if (!busy()) UI.held = KEYDIR[e.key]; return; }
    if (['Enter', ' ', 'z', 'Z'].includes(e.key)) { e.preventDefault(); if (!e.repeat) action(); return; }
    if (['x', 'X', 'Escape'].includes(e.key)) { e.preventDefault(); if (UI.shop) actions.closeShop(); else actions.menu(); }
  });
  window.addEventListener('keyup', e => { if (KEYDIR[e.key] && UI.held === KEYDIR[e.key]) UI.held = null; });
  window.addEventListener('blur', release);

  render();
  requestAnimationFrame(loop);
  // 動作確認用（アニメーションを待たずに 1 歩進める）
  const debugStep = dir => { if (busy()) return; tryMove(dir); if (UI.move) { UI.move = null; afterStep(); } };
  window.__carbon = { get S() { return S; }, UI, actions, render, startBattle, warp, playScene, step: debugStep, action, mapCanvas };
})();
