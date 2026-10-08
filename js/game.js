// =============================================================
// game.js — 画面の切り替え、マップ探索、台本の再生、問題バトル、
//           成長と購買部、復習ノート、セーブ
// =============================================================
(() => {
  const { COMPANIONS, SKILL_MAX, ITEMS, SHOP, ENEMIES, RANDOM_ENEMIES, expToNext, HP_PER_LV } = GameData;
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
  const fill = t => t.replace(/〈自分〉/g, S && S.cfg ? `(${S.cfg})` : '').replace(/〈逆〉/g, S && S.cfg ? `(${opp(S.cfg)})` : '');
  const resolve = (v, ...a) => typeof v === 'function' ? v(...a) : v;
  const map = () => MAPS[S.map];
  const heroName = () => S.cfg ? `(${S.cfg})-カーボ` : 'カーボ';
  const yen = n => `${n} 円`;

  function freshState(diff) {
    return {
      diff, party: [], cfg: null, hp: BASE_HP, maxHp: BASE_HP, lv: 1, exp: 0, money: 0, skillLv: {},
      items: { coffee: 1, energy: 0, book: 0 }, map: 'lab', x: 5, y: 5, dir: 'up',
      flags: {}, used: {}, stats: { correct: 0, total: 0 }, chStats: {}, notebook: {}, topics: {}, ch: 1,
    };
  }
  // 古いセーブにない項目を補う
  function normalize(s) {
    const d = freshState(s.diff || 2);
    for (const k of Object.keys(d)) if (s[k] === undefined) s[k] = d[k];
    for (const id of s.party) if (!s.skillLv[id]) s.skillLv[id] = 1;
    for (const id of Object.keys(ITEMS)) if (s.items[id] === undefined) s.items[id] = 0;
    return s;
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 保存できない環境でも遊べる */ } }
  function loadSave() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }

  const skillLv = id => S.skillLv[id] || 1;
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
    const fn = { title: vTitle, diff: vDiff, party: vParty, world: vWorld, battle: vBattle, over: vOver, clear: vClear, note: vNote }[UI.screen];
    app.innerHTML = fn();
    if (UI.screen === 'world') { setupCanvas(); renderOverlay(); }
    if (UI.screen === 'battle') { drawEnemy(); startTyping(); }
    Mol.drawAll(app);
    applyFx();
    Sound.bgm(musicFor());
  }
  function musicFor() {
    if (UI.screen === 'battle') return UI.battle && ENEMIES[UI.battle.key].boss ? 'boss' : UI.battle && UI.battle.key === 'practice' ? 'town' : 'battle';
    if (UI.screen === 'world') {
      if (S.map === 'forest') return S.flags.boss ? 'town' : 'forest';
      if (MAPS[S.map].ch === 2) return S.flags.night ? 'night' : 'port';
      return 'town';
    }
    if (UI.screen === 'over' || UI.screen === 'clear') return null;
    return 'town';
  }
  const win = (inner, cls = '') => `<section class="win ${cls}">${inner}</section>`;
  const muteBtn = () => `<button class="btn small-btn" data-act="mute">${Sound.isMuted() ? '♪ 音: OFF' : '♪ 音: ON'}</button>`;

  function vTitle() {
    const has = !!loadSave();
    return `<div class="title-screen">
      <h1 class="logo">CarbonRPG</h1>
      <p class="subtitle">炭素の勇者 ── 第2章「カルボニル港」まで</p>
      ${win(`<p class="story">炭素の国カルボニア。原子たちは手を取り合い、分子となって穏やかに暮らしていた。</p>
        <p class="story">ところがある日、森の分子たちが次々と「平ら」にされ、利き手を失いはじめた。</p>
        <p class="story">闇の組織「メソ教団」。その名が、ささやかれている。</p>`, 'msg')}
      <div class="center">
        <button class="btn big" data-act="newGame">▶ はじめから</button>
        ${has ? '<button class="btn big" data-act="continue">▶ つづきから</button>' : ''}
      </div>
      <div class="center">${muteBtn()}</div>
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
        <span class="comp-cards">技「${c.skill.name}」: ${c.skill.lv[0].desc}</span>
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
        <p class="small dim">仲間の技は、バトルごとに使える。レベルが上がるたびに、強化する技を 1 つ選べる。</p>
        <div class="center"><button class="btn big" data-act="bondDone" ${UI.pick.length === 4 ? '' : 'disabled'}>▶ この 4 人と結合する</button></div>
      </div>
    </div>`;
  }

  function hpBar(cur, max, cls) { return `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, cur / max * 100))}%"></div></div>`; }
  const hudStatus = () => `${heroName()} Lv${S.lv}　HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}`;

  function vWorld() {
    return `<div class="world">
      <div class="hud">
        <span><b>${map().name}${map().ch === 2 ? (S.flags.night ? '（夜）' : '（昼）') : ''}</b></span>
        <span class="hp-box">${hudStatus()}</span>
        <span class="hud-btns"><span class="money">研究費 ${yen(S.money)}</span>${muteBtn()}<button class="btn small-btn" data-act="menu">メニュー</button></span>
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
    let w = st.w || null;
    if (w && w.startsWith('@')) w = S.party.length ? comp(S.party[(+w.slice(1)) % S.party.length]).name : '仲間';
    return { w, t: fill(st.t) };
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
      ${S.party.length ? `<p class="small">${heroFormula(S.party)}</p><ul class="mlist">${party}</ul>` : ''}
      <h3>どうぐ</h3><ul class="mlist">${items}</ul>
      <div class="center">
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
    return `<div class="menu win">
      <h3>購買部</h3>
      <p class="small">「いらっしゃい！ 研究費はちゃんと残しておくんだよ」</p>
      <p>研究費 <b class="accent">${yen(S.money)}</b></p>
      <ul class="shop-list">${rows}</ul>
      <div class="center"><button class="btn" data-act="closeShop">とじる</button></div>
    </div>`;
  }

  // ---- 台本の再生 ------------------------------------------------
  function playScene(id, onDone) {
    UI.scene = { steps: SCENES[id].map(x => ({ ...x })), i: 0, onDone };
    UI.held = null;
    runCommands();
  }
  function runCommands() {
    const sc = UI.scene;
    while (sc && sc.i < sc.steps.length && sc.steps[sc.i].do) {
      const st = sc.steps[sc.i];
      if (st.do === 'flag') { S.flags[st.f] = true; save(); sc.i++; continue; }
      if (st.do === 'heal') { S.hp = S.maxHp; sc.i++; continue; }
      if (st.do === 'night' || st.do === 'day') { S.flags.night = st.do === 'night'; sc.i++; save(); if (UI.screen === 'world') render(); continue; }
      if (st.do === 'warp') { S.map = st.map; S.x = st.x; S.y = st.y; S.dir = st.dir || S.dir; UI.move = null; sc.i++; save(); render(); continue; }
      if (st.do === 'choice') { sc.i++; UI.choice = st.opts; renderOverlay(); return; }
      if (st.do === 'bond') {
        const lines = S.party.map(id => ({ w: comp(id).name, t: comp(id).bond }));
        sc.steps.splice(sc.i, 1, ...lines);
        continue;
      }
      if (st.do === 'party') { sc.i++; UI.pick = []; UI.screen = 'party'; render(); return; }
      if (st.do === 'battle') { sc.i++; startBattle(st.e, false); return; }
      if (st.do === 'clear') {
        sc.i++; UI.scene = null;
        const ch = MAPS[S.map].ch || 1;
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
  function choose(i) {
    const o = UI.choice && UI.choice[+i];
    if (!o) return;
    UI.choice = null;
    const sc = UI.scene; UI.scene = null;
    if (o.go) playScene(o.go, sc && sc.onDone);
    else { renderOverlay(); if (sc && sc.onDone) sc.onDone(); }
  }

  function refreshHud() {
    const hp = document.querySelector('.hud .hp-box');
    if (hp) hp.innerHTML = hudStatus();
    const m = document.querySelector('.hud .money');
    if (m) m.textContent = `研究費 ${yen(S.money)}`;
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
      Sprites.drawTile(g, ch, x * TILE, y * TILE, TILE, x, y, (dx, dy) => (m.grid[y + dy] && m.grid[y + dy][x + dx]) || 'T');
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
    if (S.flags.night && m.ch === 2) { ctx.fillStyle = 'rgba(10, 18, 52, 0.55)'; ctx.fillRect(0, 0, cv.width, cv.height); }
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
    if (ev.scene) return playScene(resolve(ev.scene, S.flags));
    if (ev.text) return message(ev.text);
    if (ev.shop) { UI.shop = true; UI.held = null; Sound.se('blip'); return renderOverlay(); }
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
  function questionPool(B) {
    const E = ENEMIES[B.key], d = S.diff, ch = E.ch || 1;
    const diffs = E.boss ? [d, Math.min(4, d + 1)] : B.key === 'duo' ? [d] : [d, Math.max(1, d - 1)];
    let pool = Questions.LIST.filter(q => q.ch === ch && diffs.includes(q.diff));
    // ボスの形態や中ボスの得意分野に合わせて絞る（足りなければ絞らない）
    const tag = B.form ? E.forms[B.form].tag : E.tag;
    if (tag) { const t = pool.filter(q => q.tag === tag); if (t.length >= 4) pool = t; }
    return pool;
  }
  function pickQuestion(B) {
    if (B.queue) { const id = B.queue.shift(); return Questions.LIST.find(q => q.id === id); }
    const pool = questionPool(B);
    // いまの難易度の問題を優先し、未出題のものから選ぶ
    let cand = pool.filter(q => !S.used[q.id] && q.diff === S.diff);
    if (!cand.length) cand = pool.filter(q => !S.used[q.id]);
    // 中ボスなどの得意分野は、未出題のものがあれば優先する
    const E = ENEMIES[B.key];
    if (E.topics) { const pref = pool.filter(q => !S.used[q.id] && E.topics.includes(q.topic)); if (pref.length) cand = pref; }
    if (!cand.length) { pool.forEach(q => delete S.used[q.id]); cand = pool; }
    const q = cand[Math.floor(Math.random() * cand.length)];
    S.used[q.id] = true;
    return q;
  }

  function startBattle(key, random, queue) {
    const E = ENEMIES[key];
    const hp = queue ? queue.length * 10 : E.hp;
    UI.battle = {
      key, random, name: E.name, sprite: E.sprite, hp, maxHp: hp, atk: E.atk, phase: 0,
      state: 'intro', lines: [`${E.name}があらわれた！`, `${E.name}「${E.start}」`],
      q: null, order: [], removed: new Set(), streak: 0, power: 0, guard: 0, stink: 0, dr: 0,
      uses: Object.fromEntries(S.party.map(id => [id, skillAt(id).uses])),
      timeMax: S.diff >= 4 ? 120 : 90, timeLeft: 0, queue: queue ? [...queue] : null, levels: 0,
    };
    if (queue) UI.battle.lines = [`${E.name}「${E.start}」`, `ノートの問題 ${queue.length} 問に挑戦する。`];
    if (E.forms) { const F = E.forms.keto; Object.assign(UI.battle, { form: 'keto', name: F.name, sprite: F.sprite, answered: 0 }); }
    UI.screen = 'battle';
    if (!queue) Sound.se('encounter');
    render();
  }

  let qTimer = null;
  function stopTimer() { if (qTimer) { clearInterval(qTimer); qTimer = null; } }
  function nextQuestion() {
    const B = UI.battle;
    B.q = pickQuestion(B);
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
    const B = UI.battle, E = ENEMIES[B.key], q = B.q;
    if (B.state !== 'q') return;
    stopTimer();
    const ok = choice === q.a;
    const lines = [];
    if (!E.practice) {
      S.stats.total++;
      const cs = S.chStats[E.ch || 1] || (S.chStats[E.ch || 1] = { c: 0, t: 0 }); cs.t++; if (ok) cs.c++;
      const tp = S.topics[q.topic] || (S.topics[q.topic] = { c: 0, t: 0 });
      tp.t++; if (ok) tp.c++;
    }
    if (ok) {
      if (!E.practice) S.stats.correct++;
      let dmg = E.practice ? 10 : 10 + (S.lv - 1) + (S.cfg === 'R' ? Math.min(B.streak, 3) * 4 : 0);
      if (B.power && !E.practice) { dmg = Math.round(dmg * B.power); B.power = 0; lines.push('アジーの背面攻撃が決まった！'); }
      B.streak++;
      B.hp = Math.max(0, B.hp - dmg);
      lines.push(`正解！ ${B.name}に ${dmg} のダメージ！${S.cfg === 'R' && B.streak > 1 && !E.practice ? `（${B.streak} 連続正解）` : ''}`);
      if (S.notebook[q.id]) { delete S.notebook[q.id]; lines.push('復習ノートの問題を克服した！'); }
      if (B.hp > 0) lines.push(`${B.name}「${taunt((B.form ? E.forms[B.form] : E).hit)}」`);
      UI.fx.push({ t: 'enemyHit', v: dmg }); Sound.se('ok'); setTimeout(() => Sound.se('hit'), 120);
      for (const [i, ph] of (E.phases || []).entries()) {
        if (B.phase < i + 1 && B.hp / B.maxHp <= ph.at && B.hp > 0) {
          B.phase = i + 1;
          lines.push(...ph.text.split('\n'));
          if (ph.transform) { B.sprite = ph.transform; B.name = ph.name; B.atk += ph.atkUp || 0; UI.fx.push({ t: 'transform' }); }
        }
      }
    } else {
      B.streak = 0;
      if (!E.practice) S.notebook[q.id] = (S.notebook[q.id] || 0) + 1;
      if (E.practice) {
        lines.push(`${choice < 0 ? '時間切れ。' : '不正解。'}（練習なのでダメージはない）`);
      } else {
        let dmg = Math.max(1, B.atk - B.stink - B.dr);
        if (S.cfg === 'S') dmg = Math.max(1, Math.round(dmg * 0.75));
        if (B.guard) { dmg = 0; B.guard--; lines.push('ブトキが立ちはだかった！'); }
        S.hp = Math.max(0, S.hp - dmg);
        lines.push(`${choice < 0 ? '時間切れ！ ' : '不正解……。'}カーボは ${dmg} のダメージを受けた。`);
        lines.push('この問題を復習ノートに書きとめた。');
        if (dmg > 0) UI.fx.push({ t: 'heroHit', v: dmg });
      }
      lines.push(`${B.name}「${taunt((B.form ? E.forms[B.form] : E).miss)}」`);
      Sound.se('ng'); if (!E.practice) setTimeout(() => Sound.se('hurt'), 150);
    }
    // ケト形とエノール形の入れ替わり（数問ごと）
    if (E.forms && B.hp > 0 && S.hp > 0 && ++B.answered % E.switchEvery === 0) {
      B.form = B.form === 'keto' ? 'enol' : 'keto';
      const F = E.forms[B.form];
      lines.push(`${F.name}「${F.into}」`, `（エノラスの姿が変わった。出題の分野が変わる）`);
      B.name = F.name; B.sprite = F.sprite;
      UI.fx.push({ t: 'swap' });
    }
    B.result = { ok, choice, lines };
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
      return nextQuestion();
    }
    if (B.state === 'win') return B.levels > 0 ? (B.state = 'levelup', render()) : endBattle(true);
    if (B.state === 'levelup') return; // 技を選ぶまで進まない
    if (B.state === 'lose') return endBattle(false);
    void E;
  }

  function winBattle() {
    const B = UI.battle, E = ENEMIES[B.key];
    B.state = 'win';
    B.lines = [`${B.name}「${E.win}」`];
    if (!E.practice) {
      B.lines.push(`${B.name}をたおした！`, `経験値 ${E.exp} と、研究費 ${yen(E.money)} を手に入れた。`);
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
    if (B && B.queue) { UI.screen = 'note'; return render(); }
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
  function choiceInner(q, i, reveal) {
    const smi = q.cs && q.cs[i];
    if (!smi) return esc(q.choices[i]);
    const note = q.cl && q.cl[i] ? `<span class="c-note">${esc(q.cl[i])}</span>` : '';
    return `${Mol.svgTag(smi, 170, 100)}${note}${reveal ? `<span class="c-name">${esc(q.choices[i])}</span>` : ''}`;
  }

  function vBattle() {
    const B = UI.battle, E = ENEMIES[B.key];
    let body = '';
    if (B.state === 'intro' || B.state === 'win' || B.state === 'lose') {
      const lines = B.state === 'lose' ? ['カーボは力尽きた……'] : B.lines;
      body = win(`${lines.map(l => `<p>${esc(l)}</p>`).join('')}<div class="center"><button class="btn big" data-act="bNext">${B.state === 'intro' ? 'たたかう' : 'つぎへ'}</button>
        ${B.state === 'intro' && B.random ? '<button class="btn" data-act="run">にげる</button>' : ''}</div>`, 'msg');
    } else if (B.state === 'levelup') {
      const opts = S.party.map(id => {
        const c = comp(id), lv = skillLv(id), max = lv >= SKILL_MAX;
        return `<button class="skill up" style="--ac:${c.color}" data-act="upgrade" data-arg="${id}" ${max ? 'disabled' : ''}>
          <span class="sk-name">${c.name}「${c.skill.name}」 Lv${lv}${max ? '（最大）' : ` → Lv${lv + 1}`}</span>
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
      const head = `<div class="q-head"><span class="chip dim">${esc(Questions.DIFFS[q.diff].name)}</span><span class="chip dim">${esc(q.topic)}</span>${q.cs ? '<span class="chip ok">構造式で答える</span>' : ''}${S.notebook[q.id] ? '<span class="chip bad">復習ノートの問題</span>' : ''}</div>`;
      const qbox = `${head}<p class="q-text">${esc(q.q)}</p>${q.smiles ? `<div class="q-mol">${Mol.svgTag(q.smiles, 220, 130, 'big')}</div>` : ''}`;
      const grid = q.cs ? 'choices struct' : 'choices';
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
        const flags = [B.power ? '背面攻撃 準備中' : '', B.guard ? '立体障害で守っている' : '', B.dr ? `被ダメージ −${B.dr}` : '', B.stink ? `悪臭で敵がひるんでいる（−${B.stink}）` : ''].filter(Boolean).map(t => `<span class="chip ok">${t}</span>`).join('');
        body = win(`${qbox}<div class="timer"><div class="bar time"><div id="qtime" style="width:${B.timeLeft / B.timeCap * 100}%"></div></div><span id="qtnum" class="small">${Math.ceil(B.timeLeft)}</span></div>`, 'qwin')
          + `<div class="${grid}">${choices}</div>`
          + (E.practice ? '' : `<div class="skills-head small dim">仲間の技・どうぐ</div><div class="skills">${skills}${items}</div>`)
          + (flags ? `<div class="status">${flags}</div>` : '');
      } else {
        const r = B.result;
        const choices = B.order.map(i => `<div class="choice shown ${i === q.a ? 'right' : i === r.choice ? 'wrong' : ''}"><span class="c-key">${i === q.a ? '○' : i === r.choice ? '×' : '　'}</span>${choiceInner(q, i, true)}</div>`).join('');
        body = win(qbox, 'qwin') + `<div class="${grid}">${choices}</div>`
          + win(`<p class="${r.ok ? 'accent' : 'bad-text'}"><b>${r.ok ? '正解！' : r.choice < 0 ? '時間切れ' : '不正解'}</b></p><p class="explain">${esc(q.explain)}</p>
              <div class="dlog" id="dtext" data-full="${esc(r.lines.join('\n'))}"></div>
              <div class="center"><button class="btn big" data-act="bNext">つぎへ</button></div>`, 'msg');
      }
    }
    return `<div class="battle">
      <div class="enemy-box win">
        <canvas id="ecv" width="128" height="128"></canvas>
        <div class="enemy-info"><h3>${esc(B.name)}</h3>${hpBar(B.hp, B.maxHp, 'enemy')}<div class="small dim">${E.practice ? `残り ${B.queue ? B.queue.length + (B.state === 'q' ? 1 : 0) : 0} 問` : `攻撃力 ${Math.max(1, B.atk - B.stink)}`}</div></div>
        <div class="b-mute">${muteBtn()}</div>
      </div>
      ${body}
      <div class="hero-bar win small">${heroName()} Lv${S.lv}　HP ${Math.max(0, S.hp)}/${S.maxHp} ${hpBar(S.hp, S.maxHp, 'hp')}${S.cfg === 'R' && B.streak ? `<span class="chip ok">${B.streak} 連続正解</span>` : ''}</div>
    </div>`;
  }

  function drawEnemy() {
    const c = document.getElementById('ecv');
    if (!c || !UI.battle) return;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    const duo = UI.battle.sprite === 'mesoDuo', s = duo ? 80 : 112;
    Sprites.drawChar(g, UI.battle.sprite, (c.width - s) / 2, c.height - s, s);
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
        ${q.smiles ? `<div class="q-mol">${Mol.svgTag(q.smiles, 200, 120)}</div>` : ''}
        <p>正解: <b class="accent">${esc(q.choices[q.a])}</b></p>
        ${q.cs && q.cs[q.a] ? `<div class="q-mol">${Mol.svgTag(q.cs[q.a], 180, 100)}</div>` : ''}
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

  // ---- ゲームオーバー・クリア・シェア --------------------------------
  function vOver() {
    return `<h2 class="screen-title">カーボは倒れた……</h2>
      ${win(`<p class="story">……気を失っていたらしい。仲間たちが手を引いて、最後に休んだ場所まで連れ戻してくれた。</p>`, 'msg')}
      <div class="center"><button class="btn big" data-act="continue">最後のセーブから再開</button><button class="btn" data-act="toTitle">タイトルへ</button></div>`;
  }

  const TITLES = [[90, '不斉の勇者'], [75, '求核の剣士'], [60, '見習い化学者'], [0, 'ラセミの迷い子']];
  const CHAPTERS = { 1: '第1章「求核の森」', 2: '第2章「カルボニル港」' };
  const NEXT = { 1: '第2章「カルボニル港」', 2: '第3章「芳香族の王国」' };
  const clearCh = () => UI.clearCh || (S.flags.clear2 ? 2 : 1);
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
      ${ch === 1 ? `<div class="center"><button class="btn big" data-act="toCh2">▶ ${NEXT[1]}へ進む</button></div>` : `<p class="center dim">${NEXT[ch]}へ続く……（未実装）</p>`}
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
    continue() {
      const s = loadSave();
      if (!s) return;
      S = normalize(s);
      if (S.hp <= 0 || UI.screen === 'over') S.hp = S.maxHp;
      UI.scene = null; UI.msg = null; UI.menu = false; UI.shop = false;
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
      Sound.se('blip');
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
      S.party.forEach(id => { S.skillLv[id] = 1; });
      save();
      UI.screen = 'world';
      render();
      runCommands();
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
    if (UI.screen === 'battle') {
      const B = UI.battle;
      if (B && B.state === 'q' && ['1', '2', '3', '4'].includes(e.key)) { const i = B.order[+e.key - 1]; if (!B.removed.has(i)) answer(i); }
      else if (['Enter', ' ', 'z', 'Z'].includes(e.key) && B && !['q', 'levelup'].includes(B.state)) { e.preventDefault(); if (!finishTyping()) battleNext(); }
      return;
    }
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
  window.__carbon = { get S() { return S; }, UI, actions, render, startBattle, warp, playScene, step: debugStep, action };
})();
