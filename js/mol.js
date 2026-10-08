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

  function drawAll(root) {
    const els = root.querySelectorAll('svg[data-smiles]');
    if (!window.SmilesDrawer) {
      els.forEach(el => { el.outerHTML = `<code class="mol-fallback">${el.dataset.smiles}</code>`; });
      return;
    }
    els.forEach(el => {
      const smi = el.dataset.smiles;
      const w = +el.getAttribute('width'), h = +el.getAttribute('height');
      const drawer = new SmilesDrawer.SvgDrawer({
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

  return { svgTag, autoTag, drawAll };
})();
