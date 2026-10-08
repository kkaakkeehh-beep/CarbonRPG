// =============================================================
// game.js — 画面の切り替え、マップ探索、台本の再生、問題バトル、セーブ
// =============================================================
(() => {
  const { COMPANIONS, ITEMS, ENEMIES, RANDOM_ENEMIES } = GameData;
  const { MAPS } = Maps;
  const { SCENES } = Story;
  const TILE = 32, VW = 15, VH = 11, STEP_MS = 140;
  const SAVE_KEY = 'carbonrpg-save-v2';
  const BASE_HP = 30;
  const app = document.getElementById('app');

  let S = null;   // セーブされる状態
  const UI = { screen: 'title', scene: null, msg: null, menu: false, battle: null, move: null, held: null, steps: 0 };

  // ---- 小物 -----------------------------------------------------
  const comp = id => COMPANIONS.find(c => c.id === id);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const opp = c => c === 'R' ? 'S' : 'R';
  const fill = t => t.replace(/〈自分〉/g, S && S.cfg ? `(${S.cfg})` : '').replace(/〈逆〉/g, S && S.cfg ? `(${opp(S.cfg)})` : '');
  const resolve = (v, ...a) => typeof v === 'function' ? v(...a) : v;
  const map = () => MAPS[S.map];

  function freshState(diff) {
    return { diff, party: [], cfg: null, hp: BASE_HP, maxHp: BASE_HP, items: { coffee: 1, book: 0 }, map: 'lab', x: 5, y: 5, dir: 'up', flags: {}, used: {}, stats: { correct: 0, total: 0 } };
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 保存できない環境でも遊べる */ } }
  function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }

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
    const fn = { title: vTitle, diff: vDiff, party: vParty, world: vWorld, battle: vBattle, over: vOver, clear: vClear }[UI.screen];
    app.innerHTML = fn();
    if (UI.screen === 'world') { setupCanvas(); renderOverlay(); }
    if (UI.screen === 'battle') { drawEnemy(); Mol.drawAll(app); startTyping(); }
  }
  const win = (inner, cls = '') => `<section class="win ${cls}">${inner}</section>`;

  function vTitle() {
    const has = !!loadSave();
    return `<div class="title-screen">
      <h1 class="logo">CarbonRPG</h1>
      <p class="subtitle">炭素の勇者 ── 第1章「求核の森」</p>
      ${win(`<p class="story">炭素の国カルボニア。原子たちは手を取り合い、分子となって穏やかに暮らしていた。</p>
        <p class="story">ところがある日、森の分子たちが次々と「平ら」にされ、利き手を失いはじめた。</p>
        <p class="story">闇の組織「メソ教団」。その名が、ささやかれている。</p>`, 'msg')}
      <div class="center">
        <button class="btn big" data-act="newGame">▶ はじめから</button>
        ${has ? '<button class="btn big" data-act="continue">▶ つづきから</button>' : ''}
      </div>
      <p class="small dim">化学がわかる人向けの試作版です。問題に正解すると敵にダメージ、間違えると自分がダメージを受けます。</p>
    </div>`;
  }

  function vDiff() {
    return `<h2 class="screen-title">難易度を選ぶ</h2>
      <p class="center dim small">バトルで出る問題の難しさが変わります。あとから変えることはできません。</p>
      <div class="diff-list">${[1, 2, 3, 4].map(d => `<button class="diff-btn" data-act="pickDiff" data-arg="${d}">
        <span class="diff-name">${Questions.DIFFS[d].name}</span><span class="small dim">${Questions.DIFFS[d].desc}</span></button>`).join('')}</div>`;
  }

  function vParty() {
    const cfg = heroCfg(UI.pick);
    const trait = cfg === 'R' ? '攻撃型: 続けて正解するほどダメージが上がる' : cfg === 'S' ? '防御型: 最大 HP +10、間違えたときのダメージ −25%' : '';
    const list = COMPANIONS.map(c => {
      const on = UI.pick.includes(c.id);
      return `<button class="comp ${on ? 'on' : ''}" style="--ac:${c.color}" data-act="toggleComp" data-arg="${c.id}">
        <span class="comp-atom">${c.group}</span>
        <span class="comp-name">${c.name}<small>${c.role}</small></span>
        <span class="comp-cards">技「${c.skill.name}」: ${c.skill.desc}</span>
        <span class="comp-line">${c.bond}</span>
      </button>`;
    }).join('');
    return `<h2 class="screen-title">4 本の手に、仲間を結ぶ</h2>
    <div class="party-grid">
      ${win(`<div class="hero-wrap">${heroSvg(UI.pick)}</div>
        <p class="center">${UI.pick.length}/4 結合</p>
        ${cfg ? `<p class="center big-cfg">(${cfg})-カーボ</p><p class="center small">${heroFormula(UI.pick)}</p><p class="center small accent">${trait}</p>
          <div class="center"><button class="btn" data-act="swap">くさびと破線を入れ替える（R/S 反転）</button></div>`
        : '<p class="center small dim">4 人そろうと、置換基の CIP 順位からカーボの R/S が決まる。</p>'}`, 'hero-win')}
      <div>
        <div class="comp-list">${list}</div>
        <p class="small dim">仲間の技は、バトル 1 回につき 1 度ずつ使える。</p>
        <div class="center"><button class="btn big" data-act="bondDone" ${UI.pick.length === 4 ? '' : 'disabled'}>▶ この 4 人と結合する</button></div>
      </div>
    </div>`;
  }

  function hpBar(cur, max, cls) { return `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, cur / max * 100))}%"></div></div>`; }

  function vWorld() {
    return `<div class="world">
      <div class="hud">
        <span><b>${map().name}</b></span>
        <span class="hp-box">${S.cfg ? `(${S.cfg})-カーボ` : 'カーボ'} HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}</span>
        <button class="btn small-btn" data-act="menu">メニュー</button>
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

  // ---- オーバーレイ（会話・メッセージ・メニュー） ----------------
  function renderOverlay() {
    const ov = document.getElementById('overlay');
    if (!ov) return;
    stopTyping();
    if (UI.menu) { ov.innerHTML = vMenu(); return; }
    const line = currentLine();
    if (!line) { ov.innerHTML = ''; return; }
    ov.innerHTML = `<div class="dialog" data-act="advance">
      ${line.w ? `<div class="speaker">${esc(line.w)}</div>` : ''}
      <div class="dtext" id="dtext" data-full="${esc(line.t)}"></div>
      <div class="dnext">▼</div></div>`;
    startTyping();
  }

  let typeTimer = null;
  function startTyping() {
    const el = document.getElementById('dtext');
    if (!el) return;
    const full = el.dataset.full.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
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
      el.textContent = el.dataset.full.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
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
    let w = st.w || null;
    if (w && w.startsWith('@')) w = S.party.length ? comp(S.party[(+w.slice(1)) % S.party.length]).name : '仲間';
    return { w, t: fill(st.t) };
  }

  function vMenu() {
    const party = S.party.map(id => { const c = comp(id); return `<li><b style="color:${c.color}">${c.name}</b>（${c.group}）技「${c.skill.name}」: ${c.skill.desc}</li>`; }).join('');
    const items = Object.entries(S.items).filter(([, n]) => n > 0).map(([id, n]) =>
      `<li>${ITEMS[id].name} ×${n} <span class="dim small">${ITEMS[id].desc}</span>${id === 'coffee' ? ` <button class="btn small-btn" data-act="useCoffee">飲む</button>` : ''}</li>`).join('') || '<li class="dim">なし</li>';
    const st = S.stats.total ? `${S.stats.correct}/${S.stats.total} 問正解（${Math.round(S.stats.correct / S.stats.total * 100)}%）` : 'まだ問題に答えていない';
    return `<div class="menu win">
      <h3>${S.cfg ? `(${S.cfg})-カーボ` : 'カーボ'}　HP ${S.hp}/${S.maxHp}</h3>
      <p class="small">難易度: ${Questions.DIFFS[S.diff].name}　｜　${st}</p>
      ${S.party.length ? `<p class="small">${heroFormula(S.party)}</p><ul class="mlist">${party}</ul>` : ''}
      <h3>どうぐ</h3><ul class="mlist">${items}</ul>
      <div class="center"><button class="btn" data-act="saveNow">セーブ</button><button class="btn" data-act="menu">とじる</button></div>
    </div>`;
  }

  // ---- 台本の再生 ------------------------------------------------
  function playScene(id, onDone) {
    UI.scene = { steps: SCENES[id].map(x => ({ ...x })), i: 0, onDone };
    UI.held = null;
    runCommands();
  }
  // いまの行がコマンドなら実行して進める
  function runCommands() {
    const sc = UI.scene;
    while (sc && sc.i < sc.steps.length && sc.steps[sc.i].do) {
      const st = sc.steps[sc.i];
      if (st.do === 'flag') { S.flags[st.f] = true; save(); sc.i++; continue; }
      if (st.do === 'heal') { S.hp = S.maxHp; sc.i++; continue; }
      if (st.do === 'bond') {
        const lines = S.party.map(id => ({ w: comp(id).name, t: comp(id).bond }));
        sc.steps.splice(sc.i, 1, ...lines);
        continue;
      }
      if (st.do === 'party') { sc.i++; UI.pick = []; UI.screen = 'party'; render(); return; }
      if (st.do === 'battle') { sc.i++; startBattle(st.e, false); return; }
      if (st.do === 'clear') { sc.i++; UI.scene = null; S.flags.clear = true; save(); UI.screen = 'clear'; render(); return; }
      sc.i++;
    }
    if (sc && sc.i >= sc.steps.length) {
      UI.scene = null;
      if (sc.onDone) sc.onDone();
    }
    if (UI.screen === 'world') { renderOverlay(); refreshHud(); }
  }
  function advance() {
    if (finishTyping()) return;
    if (UI.msg) { UI.msg.shift(); if (!UI.msg.length) { const cb = UI.msgDone; UI.msg = null; UI.msgDone = null; if (cb) cb(); } renderOverlay(); return; }
    if (UI.scene) { UI.scene.i++; runCommands(); }
  }
  function message(lines, done) { UI.msg = Array.isArray(lines) ? [...lines] : [lines]; UI.msgDone = done || null; UI.held = null; renderOverlay(); }
  const busy = () => !!(UI.scene || UI.msg || UI.menu);

  function refreshHud() {
    const hp = document.querySelector('.hud .hp-box');
    if (hp) hp.innerHTML = `${S.cfg ? `(${S.cfg})-カーボ` : 'カーボ'} HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}`;
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
  const activeEvents = () => (map().events || []).filter(e => !e.when || e.when(S.flags));
  const eventAt = (x, y, on) => activeEvents().find(e => e.x === x && e.y === y && (!on || e.on === on));

  function mapCanvas() {
    const m = map(), key = S.map + (S.flags.duo ? 1 : 0);
    if (mapCache.key === key) return mapCache.canvas;
    const W = m.grid[0].length, H = m.grid.length;
    const c = document.createElement('canvas');
    c.width = W * TILE; c.height = H * TILE;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let ch = m.grid[y][x];
      if (ch === 'M' && passableTile('M')) ch = 'm';
      Sprites.drawTile(g, ch, x * TILE, y * TILE, TILE, x, y);
    }
    mapCache = { key, canvas: c };
    return c;
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
    for (const e of activeEvents()) {
      if (!e.sprite) continue;
      const sx = (e.x - camX) * TILE, sy = (e.y - camY) * TILE;
      const id = e.chest && S.flags[e.chest.flag] ? 'chestOpen' : e.sprite;
      if (e.mirror) { ctx.save(); ctx.translate(sx + TILE, sy); ctx.scale(-1, 1); Sprites.drawChar(ctx, id, 0, 0, TILE); ctx.restore(); }
      else Sprites.drawChar(ctx, id, sx, sy, TILE);
    }
    const colors = S.party.length ? S.party.map(id => comp(id).color) : null;
    Sprites.drawChar(ctx, 'hero', (hx - camX) * TILE, (hy - camY) * TILE, TILE, { colors, dir: S.dir });
  }

  function loop() {
    if (UI.screen === 'world') {
      if (UI.move && performance.now() - UI.move.t0 >= STEP_MS) { UI.move = null; afterStep(); }
      if (!UI.move && UI.held && !busy()) tryMove(UI.held);
      draw();
    }
    requestAnimationFrame(loop);
  }

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function tryMove(dir) {
    S.dir = dir;
    const [dx, dy] = DIRS[dir], nx = S.x + dx, ny = S.y + dy;
    const ev = eventAt(nx, ny, 'bump');
    if (ev) { UI.held = null; return trigger(ev); }
    const ch = tileAt(nx, ny);
    if (!passableTile(ch)) {
      const bt = map().blockedText && map().blockedText[ch];
      if (bt) message(resolve(bt, S.flags));
      return;
    }
    UI.move = { fx: S.x, fy: S.y, t0: performance.now() };
    S.x = nx; S.y = ny;
  }

  function afterStep() {
    const ev = eventAt(S.x, S.y, 'step');
    if (ev) { UI.held = null; return trigger(ev); }
    if (map().encounters && tileAt(S.x, S.y) === 'g' && S.flags.f_entry && !S.flags.boss) {
      UI.steps++;
      if (UI.steps > 4 && Math.random() < 1 / 10) {
        UI.steps = 0; UI.held = null;
        const e = RANDOM_ENEMIES[Math.floor(Math.random() * RANDOM_ENEMIES.length)];
        startBattle(e, true);
      }
    }
  }

  function action() {
    if (UI.menu) return;
    if (UI.scene || UI.msg) return advance();
    const [dx, dy] = DIRS[S.dir], fx = S.x + dx, fy = S.y + dy;
    const ev = eventAt(fx, fy, 'bump');
    if (ev) return trigger(ev);
    const ins = map().inspect && map().inspect[tileAt(fx, fy)];
    if (ins) {
      if (ins.rest) { S.hp = S.maxHp; save(); refreshHud(); return message(['ベッドで仮眠をとった。', 'HP が全回復した。（セーブしました）']); }
      return message(ins);
    }
  }

  function trigger(ev) {
    if (ev.scene) return playScene(resolve(ev.scene, S.flags));
    if (ev.text) return message(ev.text);
    if (ev.chest) {
      if (S.flags[ev.chest.flag]) return message('宝箱はからっぽだ。');
      S.flags[ev.chest.flag] = true;
      S.items[ev.chest.item] = (S.items[ev.chest.item] || 0) + 1;
      save();
      return message(`宝箱を開けた！ ${ITEMS[ev.chest.item].name}を手に入れた。`);
    }
    if (ev.gate) {
      if (S.flags.elder) return warp({ map: 'forest', x: 15, y: 22, dir: 'up' });
      return playScene('gate_block', () => { S.y = 1; S.dir = 'down'; });
    }
    if (ev.warp) return warp(ev.warp);
  }

  function warp(w) {
    S.map = w.map; S.x = w.x; S.y = w.y; S.dir = w.dir || S.dir;
    UI.move = null; UI.steps = 0;
    save();
    render();
    const oe = map().onEnter;
    if (oe && !S.flags[oe.flag]) { S.flags[oe.flag] = true; playScene(oe.scene); }
  }

  // =================================================================
  // 問題バトル
  // =================================================================
  function questionPool(key) {
    const d = S.diff;
    const diffs = ENEMIES[key].boss ? [d, Math.min(4, d + 1)] : key === 'duo' ? [d] : [d, Math.max(1, d - 1)];
    return Questions.LIST.filter(q => q.ch === 1 && diffs.includes(q.diff));
  }
  function pickQuestion(key) {
    const pool = questionPool(key);
    // いまの難易度の問題を優先し、未出題のものから選ぶ
    let cand = pool.filter(q => !S.used[q.id] && q.diff === S.diff);
    if (!cand.length) cand = pool.filter(q => !S.used[q.id]);
    if (!cand.length) { pool.forEach(q => delete S.used[q.id]); cand = pool; }
    const q = cand[Math.floor(Math.random() * cand.length)];
    S.used[q.id] = true;
    return q;
  }

  function startBattle(key, random) {
    const E = ENEMIES[key];
    UI.battle = {
      key, random, name: E.name, sprite: E.sprite, hp: E.hp, maxHp: E.hp, atk: E.atk, phase: 0,
      state: 'intro', lines: [`${E.name}があらわれた！`, `${E.name}「${E.start}」`],
      q: null, order: [], removed: new Set(), streak: 0, skills: new Set(), power: false, guard: false, stink: false,
      timeMax: S.diff >= 4 ? 120 : 90, timeLeft: 0,
    };
    UI.screen = 'battle';
    render();
  }

  let qTimer = null;
  function stopTimer() { if (qTimer) { clearInterval(qTimer); qTimer = null; } }
  function nextQuestion() {
    const B = UI.battle;
    B.q = pickQuestion(B.key);
    B.order = shuffle([0, 1, 2, 3]);
    B.removed = new Set();
    B.timeLeft = B.timeCap = B.timeMax;
    B.state = 'q';
    render();
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
    const B = UI.battle, E = ENEMIES[B.key];
    if (B.state !== 'q') return;
    stopTimer();
    const ok = choice === B.q.a;
    S.stats.total++;
    const lines = [];
    if (ok) {
      S.stats.correct++;
      let dmg = 10 + (S.cfg === 'R' ? Math.min(B.streak, 3) * 4 : 0);
      if (B.power) { dmg = Math.round(dmg * 1.5); B.power = false; lines.push('アジーの背面攻撃が決まった！'); }
      B.streak++;
      B.hp = Math.max(0, B.hp - dmg);
      lines.push(`正解！ ${B.name}に ${dmg} のダメージ！${S.cfg === 'R' && B.streak > 1 ? `（${B.streak} 連続正解）` : ''}`);
      if (B.hp > 0) lines.push(`${B.name}「${taunt(E.hit)}」`);
      for (const ph of E.phases || []) {
        if (B.phase < (E.phases.indexOf(ph) + 1) && B.hp / B.maxHp <= ph.at && B.hp > 0) {
          B.phase = E.phases.indexOf(ph) + 1;
          lines.push(...ph.text.split('\n'));
          if (ph.transform) { B.sprite = ph.transform; B.name = ph.name; B.atk += ph.atkUp || 0; }
        }
      }
    } else {
      B.streak = 0;
      let dmg = Math.max(1, B.atk - (B.stink ? 3 : 0));
      if (S.cfg === 'S') dmg = Math.max(1, Math.round(dmg * 0.75));
      if (B.guard) { dmg = 0; B.guard = false; lines.push('ブトキが立ちはだかった！'); }
      S.hp = Math.max(0, S.hp - dmg);
      lines.push(`${choice < 0 ? '時間切れ！ ' : '不正解……。'}カーボは ${dmg} のダメージを受けた。`);
      lines.push(`${B.name}「${taunt(E.miss)}」`);
    }
    B.result = { ok, choice, lines };
    B.state = 'result';
    render();
  }

  function battleNext() {
    const B = UI.battle, E = ENEMIES[B.key];
    if (B.state === 'intro') return nextQuestion();
    if (B.state === 'result') {
      if (S.hp <= 0) { B.state = 'lose'; return render(); }
      if (B.hp <= 0) { B.state = 'win'; B.lines = [`${B.name}「${E.win}」`, `${B.name}をたおした！`]; return render(); }
      return nextQuestion();
    }
    if (B.state === 'win') return endBattle(true);
    if (B.state === 'lose') return endBattle(false);
  }

  function endBattle(won) {
    stopTimer();
    const B = UI.battle;
    UI.battle = null;
    if (!won) { UI.scene = null; UI.screen = 'over'; return render(); }
    save();
    UI.screen = 'world';
    render();
    if (UI.scene) { runCommands(); }
    void B;
  }

  function useSkill(id) {
    const B = UI.battle;
    if (B.state !== 'q' || B.skills.has(id)) return;
    const c = comp(id), sk = c.skill.id;
    B.skills.add(id);
    flash(`${c.name}の「${c.skill.name}」！ ${c.skill.desc}`);
    if (sk === 'heal') S.hp = Math.min(S.maxHp, S.hp + 12);
    if (sk === 'power') B.power = true;
    if (sk === 'stink') B.stink = true;
    if (sk === 'guard') B.guard = true;
    if (sk === 'time') { B.timeLeft += 60; B.timeCap = Math.max(B.timeCap, B.timeLeft); }
    if (sk === 'fifty') removeWrong(2);
    render();
  }
  function removeWrong(n) {
    const B = UI.battle;
    const wrong = shuffle([0, 1, 2, 3].filter(i => i !== B.q.a && !B.removed.has(i)));
    wrong.slice(0, n).forEach(i => B.removed.add(i));
  }
  function useItem(id) {
    const B = UI.battle;
    if (B.state !== 'q' || !S.items[id]) return;
    if (id === 'coffee') { if (S.hp >= S.maxHp) return; S.hp = Math.min(S.maxHp, S.hp + ITEMS.coffee.heal); }
    if (id === 'book') removeWrong(1);
    flash(`${ITEMS[id].name}を使った！ ${ITEMS[id].desc}`);
    S.items[id]--;
    render();
  }

  function flash(text) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = 'toast good'; el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function vBattle() {
    const B = UI.battle;
    let body = '';
    if (B.state === 'intro' || B.state === 'win' || B.state === 'lose') {
      const lines = B.state === 'lose' ? ['カーボは力尽きた……'] : B.lines;
      body = win(`${lines.map(l => `<p>${esc(l)}</p>`).join('')}<div class="center"><button class="btn big" data-act="bNext">${B.state === 'intro' ? 'たたかう' : 'つぎへ'}</button>
        ${B.state === 'intro' && B.random ? '<button class="btn" data-act="run">にげる</button>' : ''}</div>`, 'msg');
    } else {
      const q = B.q;
      const head = `<div class="q-head"><span class="chip dim">${esc(Questions.DIFFS[q.diff].name)}</span><span class="chip dim">${esc(q.topic)}</span></div>`;
      const qbox = `${head}<p class="q-text">${esc(q.q)}</p>${q.smiles ? `<div class="q-mol">${Mol.svgTag(q.smiles, 220, 130, 'big')}</div>` : ''}`;
      if (B.state === 'q') {
        const choices = B.order.map(i => `<button class="choice" data-act="answer" data-arg="${i}" ${B.removed.has(i) ? 'disabled' : ''}>${esc(q.choices[i])}</button>`).join('');
        const skills = S.party.map(id => { const c = comp(id), used = B.skills.has(id);
          return `<button class="skill" style="--ac:${c.color}" data-act="skill" data-arg="${id}" ${used ? 'disabled' : ''}>
            <span class="sk-name">${c.name}「${c.skill.name}」${used ? '<span class="sk-used">使用済み</span>' : ''}</span>
            <span class="sk-desc">${esc(c.skill.desc)}</span></button>`; }).join('');
        const items = ['coffee', 'book'].filter(id => S.items[id]).map(id => {
          const full = id === 'coffee' && S.hp >= S.maxHp;
          return `<button class="skill item" data-act="item" data-arg="${id}" ${full ? 'disabled' : ''}>
            <span class="sk-name">${ITEMS[id].name} ×${S.items[id]}${full ? '<span class="sk-used">HP 満タン</span>' : ''}</span>
            <span class="sk-desc">${esc(ITEMS[id].desc)}</span></button>`; }).join('');
        const flags = [B.power ? '背面攻撃 準備中' : '', B.guard ? '立体障害で守っている' : '', B.stink ? '悪臭で敵がひるんでいる' : ''].filter(Boolean).map(t => `<span class="chip ok">${t}</span>`).join('');
        body = win(`${qbox}<div class="timer"><div class="bar time"><div id="qtime" style="width:${B.timeLeft / B.timeCap * 100}%"></div></div><span id="qtnum" class="small">${Math.ceil(B.timeLeft)}</span></div>`, 'qwin')
          + `<div class="choices">${choices}</div>`
          + `<div class="skills-head small dim">仲間の技（バトルごとに 1 回ずつ）・どうぐ</div><div class="skills">${skills}${items}</div>${flags ? `<div class="status">${flags}</div>` : ''}`;
      } else {
        const r = B.result;
        const choices = B.order.map(i => `<div class="choice shown ${i === q.a ? 'right' : i === r.choice ? 'wrong' : ''}">${i === q.a ? '○ ' : i === r.choice ? '× ' : ''}${esc(q.choices[i])}</div>`).join('');
        body = win(qbox, 'qwin') + `<div class="choices">${choices}</div>`
          + win(`<p class="${r.ok ? 'accent' : 'bad-text'}"><b>${r.ok ? '正解！' : r.choice < 0 ? '時間切れ' : '不正解'}</b></p><p class="explain">${esc(q.explain)}</p>
              <div class="dlog" id="dtext" data-full="${esc(r.lines.join('\n'))}"></div>
              <div class="center"><button class="btn big" data-act="bNext">つぎへ</button></div>`, 'msg');
      }
    }
    return `<div class="battle">
      <div class="enemy-box win">
        <canvas id="ecv" width="128" height="128"></canvas>
        <div class="enemy-info"><h3>${esc(B.name)}</h3>${hpBar(B.hp, B.maxHp, 'enemy')}<div class="small dim">攻撃力 ${B.atk - (B.stink ? 3 : 0)}</div></div>
      </div>
      ${body}
      <div class="hero-bar win small">${S.cfg ? `(${S.cfg})-カーボ` : 'カーボ'}　HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}${S.cfg === 'R' && B.streak ? `<span class="chip ok">${B.streak} 連続正解</span>` : ''}</div>
    </div>`;
  }

  function drawEnemy() {
    const c = document.getElementById('ecv');
    if (!c || !UI.battle) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    const s = UI.battle.sprite === 'mesoDuo' ? 80 : 112;
    Sprites.drawChar(g, UI.battle.sprite, (c.width - s * (UI.battle.sprite === 'mesoDuo' ? 1 : 1)) / 2, c.height - s, s);
  }

  // ---- ゲームオーバー・クリア --------------------------------------
  function vOver() {
    return `<h2 class="screen-title">カーボは倒れた……</h2>
      ${win(`<p class="story">……気を失っていたらしい。仲間たちが手を引いて、最後に休んだ場所まで連れ戻してくれた。</p>`, 'msg')}
      <div class="center"><button class="btn big" data-act="continue">最後のセーブから再開</button><button class="btn" data-act="toTitle">タイトルへ</button></div>`;
  }
  function vClear() {
    const st = S.stats, rate = st.total ? Math.round(st.correct / st.total * 100) : 0;
    return `<h2 class="screen-title">第1章「求核の森」クリア！</h2>
      ${win(`<p class="center">難易度: ${Questions.DIFFS[S.diff].name}</p>
        <p class="center big-cfg">正答率 ${rate}%</p><p class="center small">${st.correct} / ${st.total} 問正解</p>
        <p class="center small dim">${S.cfg ? `(${S.cfg})-カーボ　${heroFormula(S.party)}` : ''}</p>`, 'msg')}
      <p class="center dim">第2章「カルボニル港」へ続く……（未実装）</p>
      <div class="center"><button class="btn big" data-act="toTitle">タイトルへ</button></div>`;
  }

  // =================================================================
  // 入力
  // =================================================================
  const actions = {
    newGame() { UI.screen = 'diff'; render(); },
    continue() {
      const s = loadSave();
      if (!s) return;
      S = s;
      if (S.hp <= 0) S.hp = S.maxHp;
      if (UI.screen === 'over') { S.hp = S.maxHp; }
      UI.scene = null; UI.msg = null; UI.menu = false;
      UI.screen = 'world';
      render();
      if (!S.cfg) return playScene('prologue');
      const oe = map().onEnter;
      if (oe && !S.flags[oe.flag]) { S.flags[oe.flag] = true; playScene(oe.scene); }
    },
    pickDiff(d) {
      S = freshState(+d);
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 何もしない */ }
      UI.screen = 'world';
      render();
      playScene('prologue');
    },
    toggleComp(id) {
      const i = UI.pick.indexOf(id);
      if (i >= 0) UI.pick.splice(i, 1); else if (UI.pick.length < 4) UI.pick.push(id);
      render();
    },
    unbond(i) { UI.pick.splice(+i, 1); render(); },
    swap() { if (UI.pick.length === 4) { [UI.pick[2], UI.pick[3]] = [UI.pick[3], UI.pick[2]]; render(); } },
    bondDone() {
      if (UI.pick.length !== 4) return;
      S.party = [...UI.pick];
      S.cfg = heroCfg(S.party);
      S.maxHp = BASE_HP + (S.cfg === 'S' ? 10 : 0);
      S.hp = S.maxHp;
      save();
      UI.screen = 'world';
      render();
      runCommands();
    },
    advance() { advance(); },
    menu() { if (UI.scene || UI.msg) return; UI.menu = !UI.menu; renderOverlay(); },
    useCoffee() { if (S.items.coffee > 0 && S.hp < S.maxHp) { S.items.coffee--; S.hp = Math.min(S.maxHp, S.hp + ITEMS.coffee.heal); refreshHud(); renderOverlay(); } },
    saveNow() { save(); UI.menu = false; message('セーブしました。'); },
    bNext() { battleNext(); },
    answer(i) { answer(+i); },
    skill(id) { useSkill(id); },
    item(id) { useItem(id); },
    run() { const B = UI.battle; if (B && B.random) { UI.battle = null; UI.screen = 'world'; render(); message('うまく にげきれた。'); } },
    toTitle() { stopTimer(); UI.screen = 'title'; UI.scene = null; UI.msg = null; render(); },
  };

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
    if (UI.screen === 'battle') {
      const B = UI.battle;
      if (B && B.state === 'q' && ['1', '2', '3', '4'].includes(e.key)) { const i = B.order[+e.key - 1]; if (!B.removed.has(i)) answer(i); }
      else if (['Enter', ' ', 'z', 'Z'].includes(e.key) && B && B.state !== 'q') { e.preventDefault(); if (!finishTyping()) battleNext(); }
      return;
    }
    if (UI.screen !== 'world') return;
    if (KEYDIR[e.key]) { e.preventDefault(); if (!busy()) UI.held = KEYDIR[e.key]; return; }
    if (['Enter', ' ', 'z', 'Z'].includes(e.key)) { e.preventDefault(); if (!e.repeat) action(); return; }
    if (['x', 'X', 'Escape'].includes(e.key)) { e.preventDefault(); actions.menu(); }
  });
  window.addEventListener('keyup', e => { if (KEYDIR[e.key] && UI.held === KEYDIR[e.key]) UI.held = null; });
  window.addEventListener('blur', release);

  render();
  requestAnimationFrame(loop);
  window.__carbon = { get S() { return S; }, UI, actions, render, startBattle, warp, playScene };
})();
