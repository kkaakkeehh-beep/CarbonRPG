// =============================================================
// i18n.js — 表示する言語の切り替え（日本語 / English）
//
// ゲームの中身（セーブ・フラグ・分野の名前など）は、すべて日本語のまま持つ。
// 画面に出す直前に、ここで選んだ言語に置き換える。訳がないところは日本語のまま出す。
//
//   I18N.tr(s)           日本語の文字列 → いまの言語（辞書 text にあれば置き換える）
//   I18N.T(key, ...a)    tr(key) の {0} {1} … を a で埋める（画面の決まり文句）
//   I18N.say(w, t)       「名前「台詞」」の形（英語では Name: "line"）
//   I18N.scene(id)       台本 id の英語のセリフ（t のある行を順に並べた配列）
//   I18N.qv(q)           問題を、いまの言語で見せる形にしたもの（中身の判定には元の q を使う）
//
// 訳の本体は js/lang/en-*.js が I18N.add('en', { text, scenes, q }) で足す。
// =============================================================
const I18N = (() => {
  const KEY = 'carbonrpg-lang';
  const LANGS = { ja: '日本語', en: 'English' };
  const packs = { en: { text: {}, scenes: {}, q: {} } };
  let lang = 'ja';
  // 選んだことがなければ、ブラウザの言語が日本語でないときは英語にする
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* 何もしない */ }
  if (LANGS[saved]) lang = saved;
  else if (typeof navigator !== 'undefined' && navigator.language && !/^ja/i.test(navigator.language)) lang = 'en';

  const pack = () => (lang === 'ja' ? null : packs[lang]);
  function add(l, p) {
    const d = packs[l] || (packs[l] = { text: {}, scenes: {}, q: {} });
    for (const k of ['text', 'scenes', 'q']) if (p[k]) Object.assign(d[k], p[k]);
  }
  function tr(s) {
    const p = pack();
    if (!p || typeof s !== 'string') return s;
    const v = p.text[s];
    return v === undefined ? s : v;
  }
  const T = (key, ...a) => tr(key).replace(/\{(\d)\}/g, (m, i) => (a[i] === undefined ? m : a[i]));
  const say = (w, t) => (lang === 'ja' ? `${w}「${t}」` : `${w}: “${t}”`);
  const scene = id => { const p = pack(); return (p && p.scenes[id]) || null; };
  // 英語にない問題（日本語の名前の付け方を問うものなど）は、その言語では出さない
  const skipQ = id => { const p = pack(); return !!(p && p.q[id] && p.q[id].skip); };
  function qv(q) {
    const p = pack(), e = p && p.q[q.id];
    if (!p) return q;
    const v = { ...q, topic: tr(q.topic) };
    if (!e) return v;
    for (const k of ['q', 'choices', 'explain', 'cl', 'replies']) if (e[k]) v[k] = e[k];
    if (q.mols) v.mols = q.mols.map(([n, smi], i) => [(e.mols && e.mols[i]) || tr(n), smi]);
    return v;
  }
  function setLang(l) {
    if (!LANGS[l]) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* 何もしない */ }
    showLang();
  }
  // ページの言語と、タブの題名
  const TITLE = { ja: 'CarbonRPG — 炭素の勇者', en: 'CarbonRPG — Hero of Carbon' };
  function showLang() { document.documentElement.lang = lang; if (document.getElementById('app')) document.title = TITLE[lang] || TITLE.ja; }
  showLang();
  return { LANGS, add, tr, T, say, scene, skipQ, qv, setLang, packs, get lang() { return lang; } };
})();
