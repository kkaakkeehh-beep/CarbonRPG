// =============================================================
// mol.js — SmilesDrawer で構造式を描く
// 描画対象: <svg data-smiles="..." width="W" height="H">
// =============================================================
const Mol = (() => {
  const THEME = {
    C: '#f4f4f4', O: '#ff7b72', N: '#79c0ff', F: '#7ee787', CL: '#7ee787', BR: '#ffa657',
    I: '#d2a8ff', P: '#ffa657', S: '#f2cc60', B: '#ffa657', SI: '#ffa657', H: '#c9d1d9',
    BACKGROUND: '#000000',
  };

  function svgTag(smiles, w, h, cls = '') {
    return `<svg class="mol ${cls}" data-smiles="${smiles}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"></svg>`;
  }
  // 原子の数に合わせて描く枠の大きさを決める（大きな分子が小さく潰れないように）
  function autoTag(smiles, cls = '', minW = 120, maxW = 300) {
    const n = (smiles.replace(/\[[^\]]*\]/g, 'X').match(/Cl|Br|[A-Z]|[cnosp]/g) || []).length;
    const w = Math.round(Math.min(maxW, Math.max(minW, 40 + n * 13)));
    const h = Math.round(Math.min(150, Math.max(70, w * 0.55)));
    return svgTag(smiles, w, h, cls);
  }

  // SmilesDrawer は正方形の viewBox を作るので、横に長い分子が小さくなる。
  // 描いた範囲にぴったり合わせ、小さな分子は大きくしすぎない（最大 1.6 倍）
  function fitView(el, w, h) {
    let b;
    try { b = el.getBBox(); } catch (e) { return; }
    if (!b || !b.width || !b.height) return;
    const pad = 4, bw = b.width + pad * 2, bh = b.height + pad * 2;
    const scale = Math.min(w / bw, h / bh, 1.6);
    const vw = w / scale, vh = h / scale;
    el.setAttribute('viewBox', `${b.x + b.width / 2 - vw / 2} ${b.y + b.height / 2 - vh / 2} ${vw} ${vh}`);
  }

  // SmilesDrawer は、共役した二重結合（C/C=C/C=C\C など）の E/Z を描き違えることがある。
  // 配置が済んだあとで、SMILES の / \ と描いた形を比べ、逆なら片側を二重結合の軸で折り返す
  function fixEZ(g) {
    const V = g.vertices, flip = c => (c === '/' ? '\\' : '/');
    // x の隣（other 以外）で / \ の結合を持つ原子。before：その原子が x より先に書かれている
    const dirOf = (x, other) => {
      for (const n of V[x].neighbours) {
        const e = n !== other && g.getEdge(x, n);
        if (e && (e.bondType === '/' || e.bondType === '\\')) return { n, c: e.bondType, before: e.sourceId === n };
      }
    };
    for (const e of g.edges) {
      if (e.bondType !== '=') continue;
      const a = e.sourceId, b = e.targetId, p = dirOf(a, b), q = dirOf(b, a);
      if (!p || !q) continue;
      // 左から右へ読んだときの向きにそろえる。同じ向きなら trans
      const trans = (p.before ? p.c : flip(p.c)) === (q.before ? flip(q.c) : q.c);
      const A = V[a].position, B = V[b].position, dx = B.x - A.x, dy = B.y - A.y;
      const side = i => Math.sign(dx * (V[i].position.y - A.y) - dy * (V[i].position.x - A.x));
      if (trans === (side(p.n) !== side(q.n))) continue;
      // b の側（a を通らずにたどれる原子）を折り返す。環の中の二重結合はそのまま
      const seen = new Set([b]), st = [b];
      let ring = false;
      while (st.length && !ring) {
        const x = st.pop();
        for (const n of V[x].neighbours) {
          if (n === a) { if (x !== b) ring = true; continue; }
          if (!seen.has(n)) { seen.add(n); st.push(n); }
        }
      }
      if (ring) continue;
      const L = dx * dx + dy * dy;
      for (const i of seen) {
        const P = V[i].position, t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / L;
        P.x = 2 * (A.x + t * dx) - P.x; P.y = 2 * (A.y + t * dy) - P.y;
      }
    }
  }
  function newDrawer(opts) {
    const drawer = new SmilesDrawer.SvgDrawer(opts), pre = drawer.preprocessor, run = pre.processGraph.bind(pre);
    pre.processGraph = () => { run(); fixEZ(pre.graph); };
    return drawer;
  }

  function drawAll(root) {
    const els = root.querySelectorAll('svg[data-smiles]');
    if (!window.SmilesDrawer) {
      els.forEach(el => { el.outerHTML = `<code class="mol-fallback">${el.dataset.smiles}</code>`; });
      return;
    }
    els.forEach(el => {
      const smi = el.dataset.smiles;
      const w = +el.getAttribute('width'), h = +el.getAttribute('height');
      const drawer = newDrawer({
        width: w, height: h, padding: 6, bondThickness: 1.2, bondLength: 22,
        fontSizeLarge: 9, fontSizeSmall: 6, compactDrawing: false,
        themes: { dq: THEME },
      });
      SmilesDrawer.parse(smi,
        tree => {
          drawer.draw(tree, el, 'dq');
          el.setAttribute('width', w); el.setAttribute('height', h);
          el.style.width = w + 'px'; el.style.height = h + 'px';
          fitView(el, w, h);
        },
        () => { el.outerHTML = `<code class="mol-fallback">${smi}</code>`; });
    });
  }

  return { svgTag, autoTag, drawAll, newDrawer };
})();
