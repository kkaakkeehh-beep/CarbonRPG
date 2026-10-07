// =============================================================
// game.js — 画面・ターン進行
// =============================================================
(() => {
  const { CARDS, COMPANIONS, BASIC_DECK, BATTLES, RANKS } = GameData;
  const app = document.getElementById('app');
  const BASE_HP = 50, HAND = 6, ENERGY = 3, HEAL = 10;
  const SOLVENT_GROUPS = [['非プロトン性', ['DMSO', 'DMF', 'acetone', 'THF']], ['プロトン性', ['MeOH', 'EtOH', 'tBuOH', 'H2O']]];

  let S = null;

  // ---- 小物 -----------------------------------------------------
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const comp = id => COMPANIONS.find(c => c.id === id);
  const name = k => Chem.describe(k).name;
  const fmt = v => v >= 99.5 ? '100' : v < 0.5 && v > 0 ? '<1' : String(Math.round(v));
  const battle = () => BATTLES[S.bi];

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
  function heroFormula(party) {
    const sorted = [...party].sort((a, b) => cmpRank(comp(b).rank, comp(a).rank));
    return 'C' + sorted.map(id => `(${comp(id).group})`).join('');
  }

  function heroSvg(party, size = 220) {
    const P = [[110, 22], [28, 150], [170, 170], [196, 92]];
    const C = [110, 110];
    const lbl = i => party[i] ? comp(party[i]) : null;
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
      const c = lbl(i), [x, y] = P[i];
      if (!c) return `<g data-act="slot" data-arg="${i}" class="slot empty"><circle cx="${x}" cy="${y}" r="20" fill="#000" stroke="#666" stroke-dasharray="4 3" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" fill="#666" font-size="14">空</text></g>`;
      return `<g data-act="slot" data-arg="${i}" class="slot atom-${c.atom}"><circle cx="${x}" cy="${y}" r="21" fill="#000" stroke="currentColor" stroke-width="2.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="currentColor" font-size="${c.group.length > 3 ? 10 : 13}">${c.group}</text></g>`;
    };
    return `<svg class="hero" viewBox="0 0 220 220" width="${size}" height="${size}" role="img" aria-label="カーボと4つの結合">
      ${[0, 1, 2, 3].map(bond).join('')}
      <circle cx="${C[0]}" cy="${C[1]}" r="22" fill="#111" stroke="#fff" stroke-width="3"/>
      <text x="${C[0]}" y="${C[1] + 7}" text-anchor="middle" fill="#fff" font-size="22">C</text>
      ${[0, 1, 2, 3].map(node).join('')}
    </svg>`;
  }

  // ---- ゲーム開始 -----------------------------------------------
  function newGame() {
    S = { screen: 'title', party: [], hero: { hp: BASE_HP, maxHp: BASE_HP, cfg: null }, deck: [], bi: 0, results: [], rewards: [], b: null };
  }

  function startRun() {
    const cfg = heroCfg(S.party);
    S.hero.cfg = cfg;
    S.hero.maxHp = BASE_HP + (cfg === 'S' ? 10 : 0);
    S.hero.hp = S.hero.maxHp;
    S.deck = [...BASIC_DECK, ...S.party.flatMap(id => comp(id).cards)];
    S.bi = 0; S.results = [];
    startBattle();
  }

  function startBattle() {
    const B = battle();
    S.screen = 'battle';
    S.b = {
      flask: { ...B.start }, draw: shuffle([...S.deck]), hand: [], discard: [],
      energy: ENERGY, turn: 1, ii: 0, humid: false, heat: false, nextHumid: false, nextHeat: false,
      sel: { reagent: null, supports: [] }, solvent: 'DMSO', temp: 'rt',
      log: [{ type: 'sys', text: B.intro }], showHint: false,
      snapshot: { hp: S.hero.hp, deck: [...S.deck] },
    };
    drawCards(HAND + (S.hero.cfg === 'R' ? 1 : 0));
  }

  function drawCards(n) {
    const b = S.b;
    for (let i = 0; i < n; i++) {
      if (!b.draw.length) { if (!b.discard.length) break; b.draw = shuffle(b.discard); b.discard = []; }
      b.hand.push(b.draw.pop());
    }
  }

  // ---- 条件とコスト -----------------------------------------------
  const selCards = () => {
    const b = S.b;
    return { reagent: b.sel.reagent != null ? b.hand[b.sel.reagent] : null, supports: b.sel.supports.map(i => b.hand[i]) };
  };
  function plannedCost(sel = S.b.sel) {
    const b = S.b;
    return (sel.reagent != null ? CARDS[b.hand[sel.reagent]].cost : 0) + sel.supports.reduce((s, i) => s + CARDS[b.hand[i]].cost, 0);
  }
  function conds() {
    const b = S.b, sc = selCards();
    const heatForced = b.heat && !sc.supports.includes('ice');
    return {
      reagent: sc.reagent, solvent: b.solvent, temp: heatForced ? 'reflux' : b.temp,
      humid: b.humid && !sc.supports.includes('MS4A'),
      ag: sc.supports.includes('Ag'), crown: sc.supports.includes('crown'),
      heatForced,
    };
  }

  // ---- 戦況 -------------------------------------------------------
  function tally() {
    const B = battle(), f = S.b.flask;
    let target = 0, enemy = 0, side = 0;
    for (const [k, v] of Object.entries(f)) {
      if (B.isTarget(k)) target += v;
      else if (isEnemy(k)) enemy += v;
      else side += v;
    }
    return { target, enemy, side };
  }
  // 目的物と同じ骨格で、まだ反応しうるもの = 敵
  const isEnemy = k => Chem.isReactive(k) && Chem.parse(k).sk === battle().sk;
  function enemyForm() {
    const B = battle(), f = S.b.flask;
    const cands = Object.entries(f).filter(([k]) => !B.isTarget(k) && isEnemy(k)).sort((a, b) => b[1] - a[1]);
    return cands.length ? cands[0][0] : null;
  }
  const secondForm = () => battle().boss && Object.entries(S.b.flask).filter(([k]) => k.startsWith('tAm:')).reduce((s, [, v]) => s + v, 0) >= 5;

  // ---- 行動 ------------------------------------------------------
  const actions = {
    start() { S.screen = 'party'; },
    toggleComp(id) {
      const i = S.party.indexOf(id);
      if (i >= 0) S.party.splice(i, 1);
      else if (S.party.length < 4) S.party.push(id);
    },
    swap() { if (S.party.length === 4) [S.party[2], S.party[3]] = [S.party[3], S.party[2]]; },
    slot(i) { if (S.screen === 'party' && S.party[i]) S.party.splice(+i, 1); },
    go() { if (S.party.length === 4) startRun(); },

    card(i) {
      i = +i;
      const b = S.b, id = b.hand[i], C = CARDS[id];
      const free = b.energy - plannedCost();
      if (C.type === 'action') {
        if (C.cost > free) return flash('エネルギーが足りない');
        b.energy -= C.cost;
        removeFromHand(i);
        b.discard.push(id);
        if (id === 'lit') { drawCards(2); log('sys', '文献調査: カードを 2 枚引いた'); }
        if (id === 'allnighter') { b.energy += 2; S.hero.hp -= 4; log('sys', '徹夜した。エネルギー +2、HP −4'); if (S.hero.hp <= 0) return gameOver(); }
        return;
      }
      if (C.type === 'reagent') {
        if (b.sel.reagent === i) { b.sel.reagent = null; return; }
        const nsel = { reagent: i, supports: b.sel.supports };
        if (plannedCost(nsel) > b.energy) return flash('エネルギーが足りない');
        b.sel.reagent = i;
        return;
      }
      const j = b.sel.supports.indexOf(i);
      if (j >= 0) { b.sel.supports.splice(j, 1); return; }
      if (plannedCost({ reagent: b.sel.reagent, supports: [...b.sel.supports, i] }) > b.energy) return flash('エネルギーが足りない');
      b.sel.supports.push(i);
    },
    solvent(id) { S.b.solvent = id; },
    temp(t) { S.b.temp = t; },
    hint() { S.b.showHint = !S.b.showHint; },

    react() {
      const b = S.b, c = conds(), sc = selCards();
      const res = Chem.react(b.flask, c);
      b.flask = res.flask;
      b.energy -= plannedCost();
      b.log.unshift({ type: 'rx', cond: c, supports: sc.supports, report: res.report, turn: b.turn });
      endPlayerTurn();
    },
    wait() { log('sys', '様子を見た……'); endPlayerTurn(); },
    workup() { S.b.confirmWorkup = true; },
    workupYes() { finishBattle(); },
    workupNo() { S.b.confirmWorkup = false; },

    reward(id) { if (id) S.deck.push(id); S.bi++; startBattle(); },
    retryBattle() { S.hero.hp = S.hero.maxHp; S.deck = [...S.b.snapshot.deck]; startBattle(); },
    restart() { newGame(); S.screen = 'party'; },
    title() { newGame(); },
  };

  function removeFromHand(i) {
    const b = S.b;
    b.hand.splice(i, 1);
    if (b.sel.reagent != null) { if (b.sel.reagent === i) b.sel.reagent = null; else if (b.sel.reagent > i) b.sel.reagent--; }
    b.sel.supports = b.sel.supports.filter(x => x !== i).map(x => x > i ? x - 1 : x);
  }

  function log(type, text) { S.b.log.unshift({ type, text }); }
  let flashMsg = '';
  function flash(m) { flashMsg = m; }

  function endPlayerTurn() {
    const b = S.b;
    b.discard.push(...b.hand); b.hand = [];
    b.sel = { reagent: null, supports: [] };
    if (tally().enemy < 2.5) return finishBattle();  // 原料がほぼ消えたら自動で精製
    enemyAct();
    if (S.hero.hp <= 0) return gameOver();
    b.turn++;
    b.humid = b.nextHumid; b.heat = b.nextHeat; b.nextHumid = b.nextHeat = false;
    b.energy = ENERGY;
    drawCards(HAND);
  }

  function currentIntent() {
    const B = battle(), it = B.intents[S.b.ii % B.intents.length];
    if (it.t === 'atk' && secondForm()) return { ...it, v: it.v + 2 };
    return it;
  }
  function intentText(it) {
    if (it.t === 'atk') return `アルキル化攻撃（${it.v} ダメージ）`;
    if (it.t === 'humid') return '湿気を送り込む（次のターン、フラスコが湿る）';
    return 'ホットプレートを暴走させる（次のターン、強制的に還流）';
  }
  function enemyAct() {
    const B = battle(), b = S.b, it = currentIntent();
    const who = B.monster + (secondForm() ? '（第2形態）' : '');
    if (it.t === 'atk') { S.hero.hp -= it.v; log('enemy', `${who}のアルキル化攻撃！ カーボは ${it.v} のダメージを受けた`); }
    else if (it.t === 'humid') { b.nextHumid = true; log('enemy', `${who}は湿気を送り込んだ！ 次のターン、フラスコに水が混入する`); }
    else { b.nextHeat = true; log('enemy', `${who}はホットプレートを暴走させた！ 次のターンは強制的に還流`); }
    b.ii++;
  }

  function finishBattle() {
    const B = battle(), t = tally();
    S.results.push({ monster: B.monster, target: B.targetLabel, yield: t.target, flask: { ...S.b.flask }, lastRx: S.b.log.find(e => e.type === 'rx') });
    S.hero.hp = Math.min(S.hero.maxHp, S.hero.hp + HEAL);
    if (S.bi >= BATTLES.length - 1) { S.screen = 'end'; return; }
    const nextKeys = BATTLES[S.bi + 1].keys;
    const key = pick(nextKeys);
    const pool = Object.keys(CARDS).filter(id => id !== key && !nextKeys.includes(id) && id !== 'Mitsunobu');
    S.rewards = shuffle([key, ...shuffle(pool).slice(0, 2)]);
    S.screen = 'reward';
  }

  function gameOver() { S.screen = 'over'; }

  // ---- 描画 ------------------------------------------------------
  function render() {
    const fn = { title: vTitle, party: vParty, battle: vBattle, reward: vReward, end: vEnd, over: vOver }[S.screen];
    app.innerHTML = fn();
    Mol.drawAll(app);
    if (flashMsg) {
      const el = document.createElement('div');
      el.className = 'toast'; el.textContent = flashMsg;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
      flashMsg = '';
    }
  }

  const win = (inner, cls = '') => `<section class="win ${cls}">${inner}</section>`;

  function vTitle() {
    return `<div class="title-screen">
      <h1 class="logo">CarbonRPG</h1>
      <p class="subtitle">炭素の勇者 ── 第1章「求核の森」</p>
      ${win(`<p class="story">炭素の国カルボニア。原子たちは手を取り合い、分子となって穏やかに暮らしていた。</p>
      <p class="story">ところがある日、森の分子たちが暴走を始めた。脱離基を振りかざし、通りがかりの者をアルキル化して回っているという。</p>
      <p class="story">芳香族の長老ベンゼンは言った。<br>「わしは付加反応はせん主義でな……。若いの、頼んだぞ」</p>
      <p class="story">4本の手を持つ sp³ 炭素、カーボの旅が始まる。</p>`, 'msg')}
      <button class="btn big" data-act="start">▶ はじめる</button>
      <p class="small dim">化学がわかる人向けの試作版です。反応の結果は教科書レベルの経験則で決まります。</p>
    </div>`;
  }

  function vParty() {
    const cfg = heroCfg(S.party);
    const bonus = cfg === 'R' ? '右回りの加護: 各戦闘の 1 ターン目、手札 +1 枚' : cfg === 'S' ? '左回りの加護: 最大 HP +10' : '';
    const comps = COMPANIONS.map(c => {
      const on = S.party.includes(c.id);
      return `<button class="comp ${on ? 'on' : ''}" style="--ac: var(--${c.atom})" data-act="toggleComp" data-arg="${c.id}">
        <span class="comp-atom">${c.group}</span>
        <span class="comp-name">${c.name}<small>${c.role}</small></span>
        <span class="comp-cards">${c.cards.map(id => CARDS[id].name).join(' / ')}</span>
        <span class="comp-line">「${c.line}」</span>
      </button>`;
    }).join('');
    const quests = BATTLES.map((B, i) => `<li><span class="q-no">${i + 1}</span><b>${B.monster}</b>　${name(Object.keys(B.start)[0])} → ${B.targetLabel}</li>`).join('');
    return `<h2 class="screen-title">結合パートナーを選ぶ</h2>
    <div class="party-grid">
      ${win(`<h3>カーボの 4 本の手</h3>
        <div class="hero-wrap">${heroSvg(S.party)}</div>
        <p class="center">${S.party.length}/4 結合</p>
        ${cfg ? `<p class="center big-cfg">(${cfg})-カーボ</p><p class="center small">${heroFormula(S.party)}</p><p class="center small accent">${bonus}</p>
          <div class="center"><button class="btn" data-act="swap">くさびと破線を入れ替える（R/S 反転）</button></div>` : '<p class="center small dim">仲間を 4 人選ぶと、カーボは不斉炭素になる。</p>'}
        <p class="small dim">仲間はそれぞれ 3 枚のカードをデッキに加える。全員共通の基本カード: ${BASIC_DECK.map(id => CARDS[id].name).join('、')}</p>`, 'hero-win')}
      <div>
        <div class="comp-list">${comps}</div>
        ${win(`<h3>長老ベンゼンからの依頼（第1章）</h3><ol class="quests">${quests}</ol>
          <p class="small dim">各戦闘のあと、次の依頼に役立つカードが報酬の候補に 1 枚は混ざる。</p>`)}
        <div class="center"><button class="btn big" data-act="go" ${S.party.length === 4 ? '' : 'disabled'}>▶ 求核の森へ</button></div>
      </div>
    </div>`;
  }

  function hpBar(cur, max, cls) {
    return `<div class="bar ${cls}"><div style="width:${Math.max(0, Math.min(100, cur / max * 100))}%"></div></div>`;
  }

  function vBattle() {
    const B = battle(), b = S.b, t = tally(), c = conds(), it = currentIntent();
    const form = enemyForm();
    const formDesc = form ? Chem.describe(form) : null;
    const startKey = Object.keys(B.start)[0];
    const sc = selCards();

    const status = [
      b.humid ? `<span class="chip ${c.humid ? 'bad' : 'ok'}">湿気${c.humid ? '' : '（MS 4Å で打ち消し）'}</span>` : '',
      b.heat ? `<span class="chip ${c.heatForced ? 'bad' : 'ok'}">加熱の呪い${c.heatForced ? '' : '（氷浴で打ち消し）'}</span>` : '',
    ].join('');

    const flaskRows = Object.entries(b.flask).filter(([, v]) => v >= 0.5).sort((x, y) => y[1] - x[1]).map(([k, v]) => {
      const d = Chem.describe(k), isT = B.isTarget(k), re = isEnemy(k);
      const role = isT ? '<span class="chip ok">★ 目的物</span>' : re ? '<span class="chip bad">敵</span>' : '<span class="chip dim">副生成物</span>';
      return `<div class="sp-row ${isT ? 'is-target' : ''}">
        ${Mol.svgTag(d.smiles, 120, 80)}
        <div class="sp-info"><div class="sp-name">${d.name}</div>${role}
          <div class="bar ${isT ? 'yield' : re ? 'enemy' : 'side'}"><div style="width:${v}%"></div></div>
          <div class="small">${fmt(v)}%</div></div>
      </div>`;
    }).join('');

    const solv = SOLVENT_GROUPS.map(([g, ids]) => `<div class="opt-row"><span class="opt-label">${g}</span>${ids.map(id =>
      `<button class="opt ${b.solvent === id ? 'on' : ''}" data-act="solvent" data-arg="${id}">${Chem.SOLVENTS[id].label}</button>`).join('')}</div>`).join('');
    const temps = Object.entries(Chem.TEMPS).map(([id, T]) =>
      `<button class="opt ${c.temp === id ? 'on' : ''}" data-act="temp" data-arg="${id}" ${c.heatForced ? 'disabled' : ''}>${T.label}</button>`).join('');

    const free = b.energy - plannedCost();
    const hand = b.hand.map((id, i) => {
      const C = CARDS[id];
      const sel = b.sel.reagent === i || b.sel.supports.includes(i);
      const afford = sel || C.cost <= free;
      return `<button class="card t-${C.type} ${sel ? 'sel' : ''} ${afford ? '' : 'na'} ${C.rare ? 'rare' : ''}" data-act="card" data-arg="${i}">
        <span class="cost">${C.cost}</span><span class="tag">${C.tag}</span>
        <span class="cname">${C.name}</span><span class="cfull">${C.full}</span>
        <span class="cdesc">${C.desc}</span><span class="cflav">${C.flavor}</span>
      </button>`;
    }).join('');

    const recipe = `<div class="recipe">
      <span class="slotbox ${sc.reagent ? 'filled' : ''}">${sc.reagent ? CARDS[sc.reagent].name : '試薬なし（溶媒だけ）'}</span>
      ${sc.supports.map(id => `<span class="slotbox filled sup">+ ${CARDS[id].name}</span>`).join('')}
      <span class="slotbox">${Chem.SOLVENTS[b.solvent].label}</span>
      <span class="slotbox ${c.heatForced ? 'bad' : ''}">${Chem.TEMPS[c.temp].label}</span>
      ${c.humid ? '<span class="slotbox bad">含水</span>' : ''}
    </div>`;

    const logs = b.log.slice(0, 8).map(vLog).join('');

    return `<header class="topbar">
      <div><b>第1章 求核の森</b> <span class="dim">戦闘 ${S.bi + 1}/${BATTLES.length}・ターン ${b.turn}</span></div>
      <div class="hp-box">(${S.hero.cfg})-カーボ HP ${Math.max(0, S.hero.hp)}/${S.hero.maxHp} ${hpBar(S.hero.hp, S.hero.maxHp, 'hp')}</div>
      <div class="energy">エネルギー ${'◆'.repeat(Math.max(0, free))}${'◇'.repeat(Math.max(0, b.energy - free))} <span class="dim">${free}/${b.energy}</span></div>
    </header>
    <div class="battle-grid">
      <div class="col">
        ${win(`<div class="enemy-head"><h3>${B.monster}${secondForm() ? '<span class="chip bad">第2形態</span>' : ''} <small>Lv.${B.lv}</small></h3>
            <div class="small">残り ${fmt(t.enemy)}% ${hpBar(t.enemy, 100, 'enemy')}</div></div>
          <div class="enemy-body">
            ${formDesc ? Mol.svgTag(formDesc.smiles, 240, 150, 'big') : '<p class="dim">（もう反応する相手はいない）</p>'}
            <div class="small">${formDesc ? `いまの姿: ${formDesc.name}` : ''}</div>
          </div>
          <div class="intent">次の行動: <b>${intentText(it)}</b></div>
          ${status ? `<div class="status">このターン: ${status}</div>` : ''}`, 'enemy-win')}
        ${win(`<h3>依頼</h3>
          <p>「${B.order}」</p>
          <div class="target-line">${B.targetSmiles ? Mol.svgTag(B.targetSmiles, 130, 80) : ''}<div><div class="small dim">${name(startKey)} →</div><b>${B.targetLabel}</b></div></div>
          <p class="small">現在の収率 <b class="accent">${fmt(t.target)}%</b>　副生成物 ${fmt(t.side)}%</p>
          <button class="btn small-btn" data-act="hint">${b.showHint ? 'ヒントを隠す' : 'ヒント'}</button>
          ${b.showHint ? `<p class="small hint">${B.hint}</p>` : ''}`)}
        ${win(`<h3>フラスコの中身</h3>${flaskRows}`)}
      </div>
      <div class="col">
        ${win(`<h3>反応条件</h3>
          ${recipe}
          <div class="small dim">溶媒</div>${solv}
          <div class="opt-row"><span class="opt-label">温度</span>${temps}</div>
          <div class="actions">
            <button class="btn big" data-act="react">⚗ 反応開始</button>
            <button class="btn" data-act="wait">何もせず待つ</button>
            <button class="btn ${t.enemy < 15 && t.target > 0 ? 'glow' : ''}" data-act="workup">後処理して精製</button>
          </div>
          ${b.confirmWorkup ? `<div class="confirm">反応を止めて精製します。いまフラスコにある目的物（${fmt(t.target)}%）が収率になります。
            <div><button class="btn" data-act="workupYes">精製する</button> <button class="btn" data-act="workupNo">やめる</button></div></div>` : ''}`, 'setup-win')}
        <div class="hand-head small dim">手札 ${b.hand.length} 枚・山札 ${b.draw.length}・捨て札 ${b.discard.length}　（試薬は 1 枚、補助は何枚でも。反応すると 1 日＝1 ターンが終わる）</div>
        <div class="hand">${hand || '<p class="dim">手札がない</p>'}</div>
        ${win(`<h3>実験ノート</h3><div class="log">${logs}</div>`, 'log-win')}
      </div>
    </div>`;
  }

  function vLog(e) {
    if (e.type === 'sys') return `<div class="log-e sys">${e.text}</div>`;
    if (e.type === 'enemy') return `<div class="log-e enemy">${e.text}</div>`;
    const c = e.cond;
    const head = [c.reagent ? CARDS[c.reagent].name : '試薬なし', ...e.supports.map(id => CARDS[id].name), Chem.SOLVENTS[c.solvent].label + (c.humid ? '（含水）' : ''), Chem.TEMPS[c.temp].label].join(' / ');
    const body = e.report.map(r => {
      const reacted = r.converted > 0.05;
      const prods = {};
      for (const [k, v] of r.products) prods[k] = (prods[k] || 0) + v;
      const plist = Object.entries(prods).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 0.5)
        .map(([k, v]) => `<li>${name(k)} <b>${fmt(v)}%</b>${battle().isTarget(k) ? ' ★' : ''}</li>`).join('');
      return `<div class="rx-sp">
        <div><b>${name(r.from)}</b>（${fmt(r.amount)}%）${reacted ? ` → <span class="mech">${r.mech}</span>・変換 ${fmt(r.converted)}%` : ' → 変化なし'}</div>
        ${r.notes.length ? `<ul class="notes">${r.notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}
        ${reacted && plist ? `<ul class="prods">${plist}</ul>` : ''}
      </div>`;
    }).join('');
    return `<div class="log-e rx"><div class="rx-head">ターン ${e.turn}: ${head}</div>${body}</div>`;
  }

  function vReward() {
    const r = S.results[S.results.length - 1];
    const next = BATTLES[S.bi + 1];
    return `<h2 class="screen-title">${r.monster}を倒した！</h2>
      ${win(`<p class="center">目的物: ${r.target}</p>
        <p class="center big-cfg">収率 ${fmt(r.yield)}%</p>
        <p class="center small">${r.yield >= 90 ? '「見事じゃ！」' : r.yield >= 60 ? '「まずまずじゃな」' : r.yield >= 30 ? '「うーむ、もう少しほしかったのう」' : '「……これは別の化合物じゃな」'}</p>
        <p class="center small dim">コーヒー休憩: HP が ${HEAL} 回復した（${S.hero.hp}/${S.hero.maxHp}）</p>`, 'msg')}
      ${r.lastRx ? win(`<h3>決め手の反応</h3>${vLog(r.lastRx)}`) : ''}
      ${win(`<h3>報酬: カードを 1 枚デッキに加える</h3>
        <p class="small dim">次の相手: ${next.monster}　${name(Object.keys(next.start)[0])} → ${next.targetLabel}</p>
        <div class="hand">${S.rewards.map(id => { const C = CARDS[id]; return `<button class="card t-${C.type} ${C.rare ? 'rare' : ''}" data-act="reward" data-arg="${id}">
          <span class="cost">${C.cost}</span><span class="tag">${C.tag}</span><span class="cname">${C.name}</span><span class="cfull">${C.full}</span><span class="cdesc">${C.desc}</span><span class="cflav">${C.flavor}</span></button>`; }).join('')}</div>
        <div class="center"><button class="btn" data-act="reward" data-arg="">何も取らない</button></div>`)}`;
  }

  function vEnd() {
    const avg = S.results.reduce((s, r) => s + r.yield, 0) / S.results.length;
    const [, rank, msg] = RANKS.find(([th]) => avg >= th);
    const rows = S.results.map((r, i) => `<tr><td>${i + 1}</td><td>${r.monster}</td><td>${r.target}</td><td class="num">${fmt(r.yield)}%</td></tr>`).join('');
    return `<h2 class="screen-title">第1章 クリア！</h2>
      ${win(`<p class="story">転位竜メーヤワインは、ついに一度もカチオンを見せることなく静かになった。</p>
        <p class="story">長老ベンゼン「見事じゃ。だが森の奥、芳香族の王国では、もっと手ごわい者たちが待っておる……」</p>`, 'msg')}
      ${win(`<table class="results"><thead><tr><th>#</th><th>相手</th><th>目的物</th><th>収率</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="center">平均収率 <b class="accent">${fmt(avg)}%</b></p>
        <p class="center big-cfg">ランク ${rank}</p><p class="center">${msg}</p>`)}
      <p class="center dim">第2章「芳香族の王国」へ続く……（未実装）</p>
      <div class="center"><button class="btn big" data-act="restart">もう一度あそぶ</button></div>`;
  }

  function vOver() {
    return `<h2 class="screen-title">カーボは倒れた……</h2>
      ${win(`<p class="story">気がつくと、研究室の床で目が覚めた。ドラフトのファンの音だけが響いている。</p>
        <p class="small dim">アルキル化剤の扱いには気をつけよう。</p>`, 'msg')}
      <div class="center"><button class="btn big" data-act="retryBattle">この戦闘からやり直す</button>
      <button class="btn" data-act="restart">仲間選びからやり直す</button></div>`;
  }

  // ---- 入力 ------------------------------------------------------
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.act];
    if (!fn) return;
    fn(el.dataset.arg);
    render();
  });

  newGame();
  render();
  window.__carbon = { get state() { return S; }, heroCfg, actions, render };
})();
