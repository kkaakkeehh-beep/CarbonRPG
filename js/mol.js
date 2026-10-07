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
        },
        () => { el.outerHTML = `<code class="mol-fallback">${smi}</code>`; });
    });
  }

  return { svgTag, drawAll };
})();
