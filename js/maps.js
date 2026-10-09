// =============================================================
// maps.js — マップとイベント
//
// タイル: . 草 / g 草むら / , 道 / T 木 / ~ 水 / = 橋 / f 花 / m 霧 / M 濃い霧
//         r 岩 / # 壁 / _ 床 / B ベッド / S 棚 / F ドラフト / W 建物の壁 / R 屋根
//         h 小屋の壁 / E 小屋の入口 / D ドア
//         （第 2 章）o 石畳 / s 砂浜 / p 桟橋 / O 噴水 / K 屋台 / G 倉庫街の門 / w 倉庫の床 / X 木箱
//         L 灯台 / > 下り階段 / < 上り階段 / c じゅうたん / k 机 / d 土の床 / q 石の床 / | 手すり / Y 灯台の灯
//         （第 3 章）Z 城壁 / Q 城門 / I 塔 / l 荒れ地 / b 王都の石畳 / n ベンジル通りの石畳
//         J オルト・パラの門 / V メタの門 / N パラ区の門 / i 開いた門 / U 青い屋根 / P 王宮の壁 / A 王宮の屋根
//         t 玉座 / u 紫の光が当たる床 / y 紫外線ランプ / e 王都の屋台 / a 六角形の噴水
// イベント:
//   sprite があれば人や物として描く（関数なら f を受け取って sprite を返す）。on: 'bump'（ぶつかる・話しかける）/ 'step'（踏む）
//   when(f): 表示・発動の条件（f はフラグ）
//   scene: 台本の ID（関数なら f を受け取って ID を返す）/ warp / chest / text
// =============================================================
const Maps = (() => {
  // 章が進むと台詞が変わる住人：id に _2（森の霧が晴れたあと）/ _3（港の灯台のあと）/ _4（王国のあと）/ _5（神殿のあと）を
  // つけた台本があれば、いまの章までのうち、いちばん新しいものを使う
  const staged = (id, f) => {
    const st = f.c4_boss ? 5 : f.c3_boss ? 4 : f.c2_boss ? 3 : f.boss ? 2 : 1;
    for (let s = st; s >= 2; s--) if (Story.SCENES[`${id}_${s}`]) return `${id}_${s}`;
    return id;
  };
  // 子どもたちは、ケトー卿の居場所をそれとなく教えてくれる
  const kidsScene = f => f.c2_boss ? staged('c2_kids2', f) : f.c2_reveal ? 'c2_kids2' : f.c2_chase ? 'c2_kids_home' : (f.c2_lens && !f.c2_pier) ? 'c2_kids_pier' : 'c2_kids';

  // 第 3 章：王国の 6 本の柱。話が進むと 1 本ずつ消え、戦いのあとで戻る
  const pillarsLit = f => f.c3_boss ? 6 : f.c3_lastpillar ? 1 : 6 - [f.c3_mid, f.c3_king2, f.c3_tempo].filter(Boolean).length;
  const pillar = n => f => n < pillarsLit(f) ? 'pillarOn' : 'pillarOff';
  const pillarText = n => f => f.c3_boss ? '柱に光が戻っている。表面には、塩素の小さな傷が残っている。'
    : n < pillarsLit(f) ? '王国を守る柱だ。π 電子の光が、柱のまわりを静かに巡っている。'
    : ['柱の光が消えている。', '表面に、塩素がびっしりと付加している……。'];
  // 家督争い：アニリン家に勝ったあとで負けても、メタ伯爵からやり直せる
  const familyScene = f => f.c3_emblem ? (f.c3_boss ? 'c3_family_end' : 'c3_family_after') : f.c3_duel1 ? 'c3_family2' : 'c3_family';

  // ---- いまの目的（HUD に出す文と、マップの上に印をつける場所 [map, x, y]） ----
  const G = (t, ...at) => ({ t, at, to: at });
  // 場所を台詞で言われていない目的：印は出さない。to は実際の場所（テストと自動プレイだけが使う）
  const V = (t, ...to) => ({ t, at: [], to });
  const INN = ['port', 19, 4];
  // 第 2 章は昼と夜で出来事が変わる。時間が合わないときは、宿の主人に印をつける
  const atNight = (f, t, ...at) => f.night ? G(t, ...at) : G(`${t}（宿で夜まで休む）`, INN);
  const atDay = (f, t, ...at) => f.night ? G(`${t}（宿で朝まで休む）`, INN) : G(t, ...at);
  // here: いまいるマップ。第 3 章のあいだに港や村へ戻ったときは、船で王国へ戻るよう案内する
  function goalOf(f, here) {
    if (!f.started) return null;
    if (here && f.ch3 && !f.c3_boss && MAPS[here] && MAPS[here].ch !== 3) return G('グリニャの船で、王国へ戻る', ['port', 12, 15]);
    // 第 3 章のあと、王国に残っているときは、まず船で港へ戻る
    if (here && f.clear3 && !f.c4_boss && MAPS[here] && MAPS[here].ch === 3) return G('グリニャの船で、港へ戻る', ['shore', 12, 17]);
    // いまの章。前の章の記録が欠けていても（古いセーブなど）、先の章の記録を優先して、前の章の目的に戻らない
    const stage = (f.clear3 || f.ch4) ? 4 : (f.ch3 || f.c2_boss || f.clear2) ? 3 : (f.clear || f.ch2 || f.c2_arrive) ? 2 : 1;
    // 目的の文は、台詞で「どこへ行け」と言われた分だけ書く。言われていないときは場所を書かず、印もつけない
    // 第 1 章
    if (stage === 1 && !f.elder) return G('村の東の庵で、長老ベンゼンに会う', ['town', 16, 4]);
    if (stage === 1 && !f.f_entry) return G('村の北の、求核の森へ', ['town', 10, 0], ['town', 11, 0]);
    if (stage === 1 && !f.boss) {
      if (!f.sisters) return V('森の奥へ進む', ['forest', 5, 4], ['forest', 6, 4]);
      if (!f.duo) return V('霧の奥へ進む', ['forest', 14, 8], ['forest', 15, 8]);
      return V('森の奥で、幹部カチオーネを探す', ['forest', 14, 3]);
    }
    // 第 2 章
    if (stage <= 2 && !f.c2_boss) {
      if (!f.c2_arrive) return G('村の東の街道から、カルボニル港へ', ['town', 21, 5]);
      if (!f.c2_met) return V('港町を歩いて、話を聞く', ['port', 14, 7]);
      if (!f.c2_lens) return atNight(f, '夜の倉庫街を調べる', ['port', 23, 8]);
      if (!f.c2_pier) return atDay(f, '昼、白い船のことをケトー卿に知らせる', ['port', 6, 15]);
      if (!f.c2_kidnap) return atDay(f, '市場の騒ぎを見に行く', ['port', 6, 8]);
      if (!f.c2_rescued) return atNight(f, '夜、倉庫街の奥の階段から地下へ', ['port', 28, 10], ['cellar', 17, 11]);
      if (!f.c2_clue2) return atNight(f, '夜の双子に、話を聞く', ['port', 13, 7]);
      if (!f.c2_clue3) return atDay(f, '昼、灯台守に話を聞く', ['port', 23, 20]);
      if (!f.c2_chase) return atNight(f, '夜、灯台へ', ['port', 24, 21]);
      if (!f.c2_reveal) return atDay(f, '昼、ケトー卿の屋敷へ', ['port', 12, 3], ['mansion', 6, 3]);
      return atNight(f, '夜、灯台の頂上へ', ['port', 25, 20], ['top', 4, 2]);
    }
    // 第 3 章
    if (stage <= 3 && !f.ch3) return G('グリニャの船で、芳香族の王国へ', ['port', 12, 15]);
    if (stage <= 3 && !f.c3_boss) {
      if (!f.c3_gate) return G('北の坂の上の城門へ', ['shore', 14, 1], ['shore', 15, 1]);
      if (!f.c3_radika1) return G('南の城門区で、話を聞く', ['capital', 16, 21]);
      if (!f.c3_emblem) return V('城門区の人たちに、話を聞いて回る', ['capital', 25, 26]);
      if (!f.c3_mid) return { ...V('メタ区で、臭素の匂いのもとを探す', ['capital', 10, 8], ['capital', 5, 4], ['workshop', 5, 2]), at: [['capital', 10, 8]] };
      if (!f.c3_king2) return G('王宮で、ナフタ王に話を聞く', ['capital', 16, 12], ['palace', 6, 2]);
      if (!f.c3_tempo) return G('城の外の東、テンポの塔へ', ['capital', 16, 29], ['shore', 27, 5], ['tempo', 4, 3]);
      if (!f.c3_lastpillar) return G('王宮の北、パラ区の門へ', ['shore', 14, 1], ['capital', 16, 5]);
      return G('光の塔を登って、光を止める', ['capital', 16, 3], ['ltower', 1, 1], ['ltop', 4, 3]);
    }
    // 第 4 章
    if (stage < 4) return null;
    if (!f.c4_boss) {
      if (!f.ch4) return G('研究所へ戻る', ['town', 5, 11], ['lab', 5, 3]);
      if (!f.c4_mount) return G('森の北の端から、山道へ', ['town', 10, 0], ['town', 11, 0], ['forest', 14, 0], ['forest', 15, 0]);
      if (!f.c4_lake) return G('山道を登る', ['mount', 10, 0], ['mount', 11, 0]);
      if (!f.c4_bull) return V('湖の岸の門番を探す', ['lake', 13, 21]);
      if (!f.c4_in) return V('神殿の入口を探す', ['lake', 12, 14]);
      for (const [n, y] of [[1, 22], [2, 16], [3, 10], [4, 4]]) if (!f['c4_door' + n]) return V('回転の扉を開けて、回廊の奥へ', ['lake', 12, 14], ['kairo', 6, y]);
      for (const [fl, [lx, ly], [rx, ry]] of [['c4_mh1', [1, 13], [13, 13]], ['c4_mh2', [1, 7], [8, 7]], ['c4_mh3', [1, 1], [11, 1]]]) if (!f[fl]) return V('鏡の広間を抜ける', ['kairo', 6, 0], ['mhall', rx, ry], ['mhall', lx, ly]);
      if (!f.c4_shadow) return V('ガラスの向こうの影と、向き合う', ['mhall', 7, 3]);
      if (!f.c4_wed) return V('開いた格子の先へ', ['mhall', 3, 0], ['chapel', 8, 9]);
      if (!f.c4_guards) return G('祭壇の奥の扉から、奥の院へ', ['chapel', 8, 0], ['oku', 7, 13]);
      return G('奥の院で、総帥アキラルと向き合う', ['oku', 7, 4]);
    }
    return null;
  }

  // ---- 第 4 章：鏡の回廊の外観（タイルの上に、1 枚の絵として描く。湖への映り込みは game.js で重ねる） ----
  // 中心は x = 12.5 タイル。破風・丸い鏡の窓・金の帯・柱廊・大扉・左右の塔・月
  function paintTemple(g, T, f) {
    const P = n => n * T, cx = P(12.5);
    const marble = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#fdfcf8'); gr.addColorStop(1, '#d6d0c0'); return gr; };
    g.save();
    // 月（神殿は左右対称、月だけが右に寄っている）
    g.save(); g.shadowColor = '#fff6d0'; g.shadowBlur = T * 0.9;
    g.fillStyle = '#fff4cf'; g.beginPath(); g.arc(P(20.6), P(0.95), T * 0.5, 0, Math.PI * 2); g.fill(); g.restore();
    g.fillStyle = '#efe1b0'; g.beginPath(); g.arc(P(20.75), P(0.85), T * 0.12, 0, Math.PI * 2); g.fill();
    // 左右の塔
    for (const tx of [2, 21]) {
      const x0 = P(tx) + T * 0.1, w = T * 1.8;
      g.fillStyle = marble(P(2.4), P(10)); g.fillRect(x0, P(2.4), w, P(10) - P(2.4));
      g.fillStyle = '#cdc6b4'; g.fillRect(x0 + w - T * 0.25, P(2.4), T * 0.25, P(10) - P(2.4));
      g.fillStyle = '#d4af37'; g.fillRect(x0 - T * 0.1, P(2.4), w + T * 0.2, T * 0.14); g.fillRect(x0 - T * 0.1, P(6), w + T * 0.2, T * 0.1);
      g.beginPath(); g.moveTo(x0 - T * 0.15, P(2.45)); g.lineTo(x0 + w / 2, P(0.55)); g.lineTo(x0 + w + T * 0.15, P(2.45)); g.closePath();
      g.fillStyle = '#e9e5d8'; g.fill(); g.strokeStyle = '#d4af37'; g.lineWidth = 2; g.stroke();
      g.save(); g.shadowColor = '#9fd0ff'; g.shadowBlur = T * 0.4; g.fillStyle = '#cfe8ff';
      g.beginPath(); g.arc(x0 + w / 2, P(0.5), T * 0.13, 0, Math.PI * 2); g.fill();
      for (const wy of [3.3, 4.6, 7.2]) { g.fillStyle = '#7fc4ff'; g.fillRect(x0 + w / 2 - T * 0.12, P(wy), T * 0.24, T * 0.6); }
      g.restore();
    }
    // 破風（三角形の屋根）
    const L = P(4.6), R = P(20.4), base = P(5.05), top = P(1.0);
    g.beginPath(); g.moveTo(L, base); g.lineTo(cx, top); g.lineTo(R, base); g.closePath();
    g.fillStyle = marble(top, base); g.fill(); g.strokeStyle = '#d4af37'; g.lineWidth = 3; g.stroke();
    const k = 0.78, iL = cx - (cx - L) * k, iR = cx + (R - cx) * k, iTop = base - (base - top) * k;
    g.beginPath(); g.moveTo(iL, base - T * 0.12); g.lineTo(cx, iTop); g.lineTo(iR, base - T * 0.12); g.closePath();
    g.fillStyle = '#ece8dc'; g.fill(); g.strokeStyle = '#c9b98f'; g.lineWidth = 1.5; g.stroke();
    // 破風の飾り：鏡に映したように左右に広がる金の線
    g.strokeStyle = '#d4af37'; g.lineWidth = 1.5;
    for (const sgn of [-1, 1]) for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.moveTo(cx + sgn * T * (0.9 + i * 0.9), base - T * 0.25); g.quadraticCurveTo(cx + sgn * T * (0.6 + i * 0.6), P(3.4) - i * 2, cx + sgn * T * 1.0, P(3.45)); g.stroke();
    }
    // 丸い鏡の窓（バラ窓）
    const ry = P(3.45), rr = T * 0.95;
    const rg = g.createRadialGradient(cx - rr * 0.3, ry - rr * 0.3, rr * 0.1, cx, ry, rr);
    rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.5, '#b9d2f2'); rg.addColorStop(1, '#55709f');
    g.save(); g.shadowColor = '#bfe0ff'; g.shadowBlur = T * 0.6; g.fillStyle = rg; g.beginPath(); g.arc(cx, ry, rr, 0, Math.PI * 2); g.fill(); g.restore();
    g.strokeStyle = '#d4af37'; g.lineWidth = 3; g.beginPath(); g.arc(cx, ry, rr, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(212,175,55,.8)';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * rr * 0.35, ry + Math.sin(a) * rr * 0.35); g.lineTo(cx + Math.cos(a) * rr, ry + Math.sin(a) * rr); g.stroke(); }
    g.beginPath(); g.arc(cx, ry, rr * 0.35, 0, Math.PI * 2); g.stroke();
    if (f.c4_boss) {    // 鏡が割れたあと
      g.strokeStyle = '#2a3150'; g.lineWidth = 1.5; g.beginPath();
      g.moveTo(cx - rr * 0.2, ry - rr); g.lineTo(cx + rr * 0.1, ry - rr * 0.1); g.lineTo(cx - rr * 0.4, ry + rr * 0.5);
      g.moveTo(cx + rr * 0.1, ry - rr * 0.1); g.lineTo(cx + rr * 0.8, ry + rr * 0.3); g.stroke();
    } else { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(cx - rr * 0.38, ry - rr * 0.4, rr * 0.18, rr * 0.08, -0.6, 0, Math.PI * 2); g.fill(); }
    // てっぺんと両端の飾り
    g.fillStyle = '#d4af37';
    for (const [ax, ay] of [[cx, top], [L, base], [R, base]]) { g.beginPath(); g.moveTo(ax, ay - T * 0.45); g.lineTo(ax + T * 0.18, ay); g.lineTo(ax - T * 0.18, ay); g.closePath(); g.fill(); }
    // 金の帯（鏡に映した三角形が並ぶ）
    const fg = g.createLinearGradient(0, P(5.05), 0, P(6));
    fg.addColorStop(0, '#f2d27a'); fg.addColorStop(1, '#a8841f');
    g.fillStyle = fg; g.fillRect(L, P(5.05), R - L, P(6) - P(5.05));
    g.fillStyle = '#7a5f14';
    for (let i = 0; i < 16; i++) {
      const x0 = L + (R - L) * i / 16, w = (R - L) / 16;
      g.beginPath(); g.moveTo(x0 + w * 0.15, P(5.25)); g.lineTo(x0 + w * 0.5, P(5.55)); g.lineTo(x0 + w * 0.15, P(5.85)); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x0 + w * 0.85, P(5.25)); g.lineTo(x0 + w * 0.5, P(5.55)); g.lineTo(x0 + w * 0.85, P(5.85)); g.closePath(); g.fill();
    }
    // 柱廊の奥の暗がりと、大扉
    const dg = g.createLinearGradient(0, P(6), 0, P(9));
    dg.addColorStop(0, '#0d0e22'); dg.addColorStop(1, '#2a2c52');
    g.fillStyle = dg; g.fillRect(P(5), P(6), P(15), P(3));
    const doorL = P(11.3), doorR = P(13.7), doorTop = P(6.7);
    g.save(); g.shadowColor = '#9fd0ff'; g.shadowBlur = T * 0.7;
    const sg = g.createLinearGradient(doorL, 0, doorR, 0);
    sg.addColorStop(0, '#9aa9c6'); sg.addColorStop(0.5, f.c4_boss ? '#7b86a0' : '#eef4ff'); sg.addColorStop(1, '#9aa9c6');
    g.fillStyle = sg; g.beginPath(); g.moveTo(doorL, P(9)); g.lineTo(doorL, doorTop + T * 0.4); g.quadraticCurveTo(cx, doorTop - T * 0.5, doorR, doorTop + T * 0.4); g.lineTo(doorR, P(9)); g.closePath(); g.fill();
    g.restore();
    g.strokeStyle = '#d4af37'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#7b86a0'; g.fillRect(cx - 1, doorTop, 2, P(9) - doorTop);
    g.fillStyle = '#d4af37'; g.beginPath(); g.arc(cx - T * 0.2, P(8.1), 2.5, 0, Math.PI * 2); g.arc(cx + T * 0.2, P(8.1), 2.5, 0, Math.PI * 2); g.fill();
    // 柱（縦溝・柱頭・柱礎）
    for (const colX of [5.15, 6.5, 8.5, 10.5, 14.5, 16.5, 18.5, 19.85]) {
      const xL = P(colX) - T * 0.31, w = T * 0.62;
      g.fillStyle = marble(P(6), P(9)); g.fillRect(xL, P(6.15), w, P(9) - P(6.15));
      g.fillStyle = '#cfc9b9'; g.fillRect(xL + w * 0.72, P(6.15), w * 0.28, P(9) - P(6.15));
      g.fillStyle = '#ffffff'; g.fillRect(xL + w * 0.08, P(6.15), w * 0.14, P(9) - P(6.15));
      g.fillStyle = '#ddd7c8'; for (let i = 1; i < 4; i++) g.fillRect(xL + w * i / 4, P(6.3), 1, P(8.8) - P(6.3));
      g.fillStyle = '#d4af37'; g.fillRect(xL - T * 0.1, P(6), w + T * 0.2, T * 0.18);
      g.fillStyle = '#b9b3a2'; g.fillRect(xL - T * 0.08, P(8.85), w + T * 0.16, T * 0.15);
    }
    // かがり火の光
    for (const bx of [4.5, 20.5]) {
      const gl = g.createRadialGradient(P(bx), P(10.3), 1, P(bx), P(10.3), T * 1.6);
      gl.addColorStop(0, 'rgba(127,212,255,.35)'); gl.addColorStop(1, 'rgba(127,212,255,0)');
      g.fillStyle = gl; g.fillRect(P(bx) - T * 1.6, P(10.3) - T * 1.6, T * 3.2, T * 3.2);
    }
    g.restore();
  }

  const MAPS = {
    lab: {
      name: 'カルボニア中央研究所',
      grid: [
        '############',
        '#FF__SS__BB#',
        '#__________#',
        '#__________#',
        '#__________#',
        '#SS______FF#',
        '#__________#',
        '#__________#',
        '#####D######',
      ],
      inspect: {
        F: 'ドラフトのファンが、静かに回っている。',
        S: '試薬棚だ。NaN₃、TsCl、PBr₃……見慣れた瓶が並んでいる。',
        B: { rest: true },
      },
      events: [
        { x: 5, y: 3, sprite: 'prof', on: 'bump', scene: f => f.c4_boss ? 'lab_prof_c4end' : f.ch4 ? 'lab_prof_c4' : f.clear3 ? 'c4_start' : f.c3_boss ? 'lab_prof_c3end' : f.ch3 ? 'lab_prof_c3' : f.c2_boss ? 'lab_prof_c2end' : f.clear ? 'lab_prof3' : f.elder ? 'lab_prof2' : 'lab_prof' },
        { x: 5, y: 8, on: 'step', warp: { map: 'town', x: 5, y: 12, dir: 'down' } },
      ],
    },

    town: {
      name: 'カルボニアの村',
      grid: [
        'TTTTTTTTTT,,TTTTTTTTTT',
        'T.........,,.........T',
        'T..ff.....,,...RRRR..T',
        'T..ff.....,,...hhhh..T',
        'T.........,,...hEhh..T',
        'T.........,,,,,,,,,,,,',
        'T..~~~....,,.........T',
        'T..~~~....,,...ggg...T',
        'T.........,,.........T',
        'T...RRRR..,,.........T',
        'T...WWWW..,,.........T',
        'T...WDWW..,,.........T',
        'T...,,,,,,,,.........T',
        'T....................T',
        'TTTTTTTTTTTTTTTTTTTTTT',
      ],
      events: [
        { x: 16, y: 4, sprite: f => f.c3_lastpillar ? 'elderCl' : 'elder', on: 'bump', when: f => !f.ch3 || f.c3_boss, scene: f => f.c4_boss ? 'elder_c4end' : f.c3_boss ? 'elder_c3' : f.boss ? 'elder_after2' : f.elder ? 'elder_after' : 'elder' },
        { x: 5, y: 11, on: 'step', warp: { map: 'lab', x: 5, y: 7, dir: 'up' } },
        { x: 10, y: 0, on: 'step', gate: true },
        { x: 11, y: 0, on: 'step', gate: true },
        { x: 13, y: 1, sprite: 'guard', on: 'bump', scene: f => f.boss ? staged('guard3', f) : f.elder ? 'guard2' : 'guard' },
        { x: 6, y: 6, sprite: 'water', on: 'bump', scene: f => staged('water', f) },
        { x: 8, y: 8, sprite: 'methane', on: 'bump', scene: f => staged('methane', f) },
        { x: 3, y: 12, sprite: 'shop', on: 'bump', shop: true },
        { x: 21, y: 5, on: 'step', eastGate: true },
        { x: 3, y: 11, sprite: 'sign', on: 'bump', text: '購買部　コーヒー・エナジードリンク・参考書あります' },
      ],
    },

    forest: {
      name: '求核の森',
      encounters: { tiles: ['g'], when: f => f.f_entry && !f.boss, enemies: ['meso', 'meso', 'mesoTartaric', 'mesoCis'] },
      grid: [
        'TTTTTTTTTTTTTTxxTTTTTTTTTTTTTT',
        'TTTTTTTTTTTmmmmmmmmTTTTTTTTTTT',
        'TTTTTTTTTTmmmmmmmmmmTTTTTTTTTT',
        'T.....fffTmmmmmmmmmmT..ggggg.T',
        'T..ffffffTmmmmmmmmmmT..ggggg.T',
        'T..ffffffTTmmmmmmmmTT........T',
        'T...ffff..TTmmmmmmTT...ggg...T',
        'T.....,...TTTmmmmTTT...ggg...T',
        'T..ggg,....TTMMMMTT..........T',
        'T..ggg,,,,,,,,,,,,,,,,,,,....T',
        'T...........,TTTT..,..TTT....T',
        'TTT...ggg...,TTTT..,..TTT.r..T',
        'T~~~~~~~~~~~=~~~~~~=~~~~~~~~~T',
        'T.....,,,,,,,......,.........T',
        'T..gggg.....,..ggg.,....gggg.T',
        'T..gggg.....,..ggg.,....gggg.T',
        'T...........,,,,,,,,.........T',
        'TTTT....TTT....,.....TTTT....T',
        'T.......TTT....,.....TTTT....T',
        'T..ggg.........,.............T',
        'T..ggg.........,......ggg....T',
        'T..............,......ggg....T',
        'TTTTTTTTTTTTTT,,,TTTTTTTTTTTTT',
        'TTTTTTTTTTTTTT,,,TTTTTTTTTTTTT',
      ],
      onEnter: { flag: 'f_entry', scene: 'forest_entry' },
      // 濃い霧 M は、2 人組を倒すまで通れない
      passable: { M: f => f.duo, x: f => f.ch4 },
      openTile: { x: ',' },
      blockedText: { M: f => f.sisters ? '霧が濃くて進めない。' : '霧が濃くて進めない。西の花畑のほうから、すすり泣く声が聞こえる……' },
      events: [
        { x: 14, y: 23, on: 'step', warp: { map: 'town', x: 10, y: 1, dir: 'down' } },
        // 第 4 章：霧が晴れた先の、北の山道へ
        { x: 14, y: 0, on: 'step', when: f => f.ch4, warp: { map: 'mount', x: 10, y: 20, dir: 'up' } },
        { x: 15, y: 0, on: 'step', when: f => f.ch4, warp: { map: 'mount', x: 11, y: 20, dir: 'up' } },
        { x: 15, y: 23, on: 'step', warp: { map: 'town', x: 11, y: 1, dir: 'down' } },
        { x: 16, y: 23, on: 'step', warp: { map: 'town', x: 11, y: 1, dir: 'down' } },
        { x: 13, y: 18, sprite: 'sign', on: 'bump', text: '↑ 霧の奥　　← 花畑' },
        { x: 5, y: 4, sprite: 'carvoneR', on: 'bump', scene: f => f.c4_boss ? 'sisters_c4end' : (f.ch4 && !f.c4_boss) ? 'c4_sisters' : f.boss ? 'sisters_after2' : f.sisters ? 'sisters_after' : 'sisters' },
        { x: 6, y: 4, sprite: 'carvoneS', on: 'bump', scene: f => f.c4_boss ? 'sisters_c4end' : (f.ch4 && !f.c4_boss) ? 'c4_sisters' : f.boss ? 'sisters_after2' : f.sisters ? 'sisters_after' : 'sisters' },
        { x: 25, y: 9, sprite: 'victim', on: 'bump', scene: f => staged('victim', f) },
        { x: 5, y: 13, sprite: 'lumber', on: 'bump', scene: f => staged('lumber', f) },
        { x: 25, y: 5, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'chest1' } },
        { x: 9, y: 15, sprite: 'chest', on: 'bump', chest: { item: 'book', flag: 'chest2' } },
        { x: 27, y: 18, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'chest3' } },
        { x: 14, y: 8, sprite: 'meso', on: 'bump', when: f => f.sisters && !f.duo, scene: 'duo' },
        { x: 15, y: 8, sprite: 'meso', on: 'bump', when: f => f.sisters && !f.duo, scene: 'duo', mirror: true },
        { x: 14, y: 3, sprite: 'cation', on: 'bump', when: f => !f.boss, scene: 'boss' },
      ],
    },

    // ================= 第 2 章 =================
    port: {
      name: 'カルボニル港', ch: 2,
      grid: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'T.RRRRR..RRRRRRR..RRRRR........T',
        'T.WWWWW..WWWWWWW..WWWWW........T',
        'T.WWDWW..WWWDWWW..WWDWW........T',
        'Tooooooooooooooooooooo#########T',
        'oooooooooooooooooooooo#wwwwwww#T',
        'Tooooooooooooooooooooo#wXXwwwX#T',
        'ToKoKoKoKooooooooooooo#wwwwXww#T',
        'ToooooooooooooooooooooGwwwwwww#T',
        'TooooooooooooooOoooooo#wwwXXww#T',
        'Tooooooooooooooooooooo#wXwww>w#T',
        'Tooooooooooooooooooooo#wwXwwww#T',
        'Tooooooooooooooooooooo#########T',
        'TssssssssssssssssssssssssssssssT',
        '~~~~~~pp~~~~pp~~~~~~~~~~=~~~~~~~',
        '~~~~~~pp~~~~pp~~~~~~~~~~=~~~~~~~',
        '~~~~~~pp~~~~pp~~~~~~~~~~=~~~~~~~',
        '~~~~~~pp~~~~~~~~~~~~ssssssssss~~',
        '~~~~~~pp~~~~~~~~~~~~sssssLssss~~',
        '~~~~~~~~~~~~~~~~~~~~sssssLssss~~',
        '~~~~~~~~~~~~~~~~~~~~sssssDssss~~',
        '~~~~~~~~~~~~~~~~~~~~ssssssssss~~',
        '~~~~~~~~~~~~~~~~~~~~ssssssssss~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
      onEnter: { flag: 'c2_arrive', scene: 'c2_arrive' },
      encounters: { tiles: ['w'], when: f => f.night && f.c2_lens, enemies: ['nightMeso', 'mesoAldol'] },
      // 倉庫街の門は夜だけ開く
      passable: { G: f => f.night },
      blockedText: { G: () => '倉庫街の門は閉まっている。夜にならないと開かないようだ。' },
      events: [
        { x: 0, y: 5, on: 'step', warp: { map: 'town', x: 20, y: 5, dir: 'left' } },
        // 建物
        { x: 20, y: 3, on: 'bump', scene: f => (f.c2_met || f.c2_boss) ? 'c2_inn' : 'c2_inn_first' },
        { x: 12, y: 3, on: 'step', when: f => !f.night, warp: { map: 'mansion', x: 6, y: 7, dir: 'up' } },
        { x: 12, y: 3, on: 'bump', when: f => f.night, text: '屋敷の門は、固く閉ざされている。' },
        { x: 4, y: 3, on: 'bump', scene: f => f.night ? 'c2_orph_night' : f.c2_boss ? staged('c2_director2', f) : f.c2_reveal ? 'c2_director2' : 'c2_director' },
        // 昼の人びと
        { x: 14, y: 7, sprite: f => f.c2_lens ? 'ketohNoMono' : 'ketoh', on: 'bump', when: f => !f.night && !f.c2_reveal && !f.c2_chase && !(f.c2_lens && !f.c2_pier), scene: f => f.c2_met ? 'c2_ketoh2' : 'c2_ketoh' },
        { x: 6, y: 15, sprite: 'ketohNoMono', on: 'bump', when: f => !f.night && f.c2_lens && !f.c2_pier, scene: 'c2_pier' },
        { x: 16, y: 10, sprite: 'kidA', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 17, y: 10, sprite: 'kidB', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 6, y: 4, sprite: 'director', on: 'bump', when: f => !f.night, scene: f => f.c2_boss ? staged('c2_director2', f) : f.c2_reveal ? 'c2_director2' : 'c2_director' },
        { x: 2, y: 8, sprite: 'menthone', on: 'bump', when: f => !f.night, scene: f => f.c2_boss ? staged('c2_menthone2', f) : f.c2_reveal ? 'c2_menthone2' : 'c2_menthone' },
        { x: 4, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && !(f.c2_pier && !f.c2_kidnap), scene: f => f.c2_boss ? staged('c2_methyl2', f) : f.c2_reveal ? 'c2_methyl2' : 'c2_methyl' },
        { x: 6, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && f.c2_pier && !f.c2_kidnap, scene: 'c2_kidnap' },
        { x: 6, y: 8, sprite: 'granny', on: 'bump', when: f => !f.night && (!f.c2_kidnap || f.c2_rescued), scene: f => f.c2_boss ? staged('c2_granny2', f) : f.c2_rescued ? 'c2_granny2' : 'c2_granny' },
        { x: 8, y: 8, sprite: 'twins', on: 'bump', when: f => !f.night, scene: f => staged('c2_twins_day', f) },
        // 第 3 章が始まったあとも、グリニャの船で港と王国の浜を行き来できる
        { x: 12, y: 15, sprite: 'grignard', on: 'bump', when: f => !f.night || f.ch3, scene: f => f.ch3 ? 'c3_ferry' : f.c2_boss ? 'c3_board' : 'c2_grignard' },
        { x: 23, y: 20, sprite: 'keeper', on: 'bump', when: f => !f.night && !f.c2_boss, scene: f => (f.c2_clue2 && !f.c2_clue3) ? 'c2_lecture' : 'c2_keeper' },
        { x: 19, y: 4, sprite: 'innkeeper', on: 'bump', scene: f => (f.c2_met || f.c2_boss) ? 'c2_inn' : 'c2_inn_first' },
        // 夜
        { x: 23, y: 8, on: 'step', when: f => f.night && !f.c2_lens, scene: 'c2_warehouse' },
        { x: 21, y: 9, sprite: 'guard', on: 'bump', when: f => f.night, scene: f => f.c2_lens ? 'c2_guard_night' : 'c2_guard_night0' },
        { x: 13, y: 7, sprite: 'twins', on: 'bump', when: f => f.night, scene: f => (f.c2_rescued && !f.c2_clue2) ? 'c2_twins_clue' : 'c2_twins_night' },
        { x: 28, y: 10, on: 'step', when: f => f.night && f.c2_kidnap && !f.c2_rescued, warp: { map: 'cellar', x: 2, y: 1, dir: 'right' } },
        { x: 24, y: 21, sprite: 'thief', on: 'bump', when: f => f.night && f.c2_clue3 && !f.c2_chase, scene: 'c2_chase' },
        // 灯台の扉（夜、正体が分かったあとだけ開く）
        { x: 25, y: 20, on: 'step', when: f => f.night && f.c2_reveal && !f.c2_boss, warp: { map: 'top', x: 4, y: 6, dir: 'up' } },
        { x: 25, y: 20, on: 'bump', when: f => !(f.night && f.c2_reveal && !f.c2_boss), text: '灯台の扉には、鍵がかかっている。' },
        // 白い船（夜だけ湾に停まる。正体が分かったあとは灯台の島のそばへ）
        { x: 8, y: 19, sprite: 'ship', when: f => f.night && f.c2_lens && !f.c2_reveal },
        { x: 15, y: 19, sprite: 'ship', when: f => f.night && f.c2_reveal && !f.c2_boss },
      ],
    },

    mansion: {
      name: 'ケトー卿の屋敷', ch: 2,
      grid: [
        '#############',
        '#SS_______SS#',
        '#___________#',
        '#____ccc____#',
        '#____ckc____#',
        '#____ccc____#',
        '#___________#',
        '#___________#',
        '######D######',
      ],
      inspect: {
        S: '本棚だ。『カルボニル化学』『港の歴史』……孤児院の帳簿もある。',
        k: f => f.c2_reveal ? '机の上に、子どもの絵が 1 枚。片眼鏡の紳士と、マントの怪盗が、手をつないで笑っている。' : 'きちんと片づいた机だ。孤児院への寄付の書類が置いてある。',
      },
      events: [
        { x: 6, y: 8, on: 'step', warp: { map: 'port', x: 12, y: 4, dir: 'down' } },
        { x: 6, y: 3, sprite: 'ketohNoMono', on: 'bump', when: f => !f.night && f.c2_chase && !f.c2_reveal, scene: 'c2_reveal' },
      ],
    },

    cellar: {
      name: '倉庫街の地下', ch: 2,
      grid: [
        '####################',
        '#<dddddXdddddddXddd#',
        '#dXXXddXddXXXddXdXd#',
        '#ddddXddddXddddddXd#',
        '#XXddXdXXdXdXXXXdXd#',
        '#ddddddXddddXddddXd#',
        '#dXXXXdXdXXXXdXXdXd#',
        '#dddddXddddddXddddd#',
        '#XXXdXXXdXXdXXXXdXX#',
        '#ddddddddXddddddddd#',
        '#dXXXXXddXdXXXXXXdd#',
        '#dddddddXXddddddddd#',
        '#ddXXXdddddddXddddd#',
        '####################',
      ],
      encounters: { tiles: ['d'], when: f => !f.c2_rescued, enemies: ['cellarMeso', 'mesoAldol'] },
      events: [
        { x: 1, y: 1, on: 'step', warp: { map: 'port', x: 28, y: 9, dir: 'down' } },
        { x: 12, y: 3, sprite: 'chest', on: 'bump', chest: { item: 'energy', flag: 'c2_chest1' } },
        { x: 17, y: 11, sprite: 'iodo', on: 'bump', when: f => !f.c2_rescued, scene: 'c2_iodo' },
        { x: 18, y: 11, sprite: 'granny', on: 'bump', when: f => !f.c2_rescued, scene: 'c2_iodo' },
      ],
    },

    top: {
      name: '灯台の頂上', ch: 2,
      grid: [
        '|||||||||',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqqYqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqq<qqq|',
        '|||||||||',
      ],
      onEnter: { flag: 'c2_top', scene: 'c2_boss' },
      events: [
        { x: 4, y: 7, on: 'step', warp: { map: 'port', x: 25, y: 21, dir: 'down' } },
        { x: 4, y: 2, sprite: 'thief', on: 'bump', when: f => !f.c2_boss, scene: 'c2_boss' },
      ],
    },

    // ================= 第 3 章 =================
    shore: {
      name: '王国の浜', ch: 3, dim: true,
      grid: [
        'TTTZZZZZZZZZZZQQZZZZZZZZZZZTTT',
        'TTTZZZZZZZZZZZQQZZZZZZZZZZZTTT',
        'T.............,,..........IIIT',
        'T.ggg.........,,..........IIIT',
        'T.ggg.........,,..........IIIT',
        'T.............,,..........IDIT',
        'T..lRRRl......,,,,,,,,,,,,,,.T',
        'T..lhhhl......,,.....ggg.....T',
        'T..lhEhl......,,.....ggg.....T',
        'T..lllll,,,,,,,,.............T',
        'T..lllll......,,......gggg...T',
        'T.ggg.........,,......gggg...T',
        'T.ggg.........,,.............T',
        'T.............,,.............T',
        'TssssssssssssssssssssssssssssT',
        '~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~pp~~~~~~~~~~~~~~~~',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
      // 王宮で真相を聞いたあと、城の外へ出るとオクタが待っている（小屋で先に会っていれば何もない）
      onEnter: [{ flag: 'c3_octa', scene: 'c3_octa_gate', when: f => f.c3_king2 }],
      encounters: { tiles: ['g'], when: f => f.c3_king1 && !f.c3_boss, enemies: ['c3Meso', 'c3Radical'] },
      // テンポの塔の扉は、王の告白を聞くまで開かない
      passable: { D: f => f.c3_king2 },
      blockedText: { D: () => ['古い石の塔だ。扉は固く閉ざされている。', '上のほうから、かすかに茶の香りがする。'] },
      inspect: {
        E: '桶のような形をした、小さな家だ。',
        I: '古い石の塔だ。窓のひとつに、小さな灯りがともっている。',
        Z: '六角形の城壁だ。白い石が、すきまなく組まれている。',
      },
      events: [
        { x: 14, y: 1, on: 'step', when: f => !f.c3_gate, scene: 'c3_gate' },
        { x: 15, y: 1, on: 'step', when: f => !f.c3_gate, scene: 'c3_gate' },
        { x: 14, y: 1, on: 'step', when: f => f.c3_gate, warp: { map: 'capital', x: 16, y: 28, dir: 'up' } },
        { x: 15, y: 1, on: 'step', when: f => f.c3_gate, warp: { map: 'capital', x: 16, y: 28, dir: 'up' } },
        { x: 13, y: 2, sprite: 'bht', on: 'bump', scene: f => f.c3_boss ? 'c3_guard_end' : 'c3_guard' },
        { x: 16, y: 2, sprite: 'bht', on: 'bump', scene: f => f.c3_boss ? 'c3_guard_end' : 'c3_guard' },
        { x: 27, y: 5, on: 'step', warp: { map: 'tempo', x: 4, y: 6, dir: 'up' } },
        { x: 5, y: 9, sprite: 'octa', on: 'bump', scene: f => f.c3_boss ? 'c3_octa_end' : f.c3_octa ? 'c3_octa2' : 'c3_octa' },
        { x: 12, y: 17, sprite: 'grignard', on: 'bump', scene: f => f.c3_boss ? 'c3_grignard_end' : 'c3_grignard' },
        { x: 14, y: 16, sprite: 'boat' },
        // 戦いのあと、テンポとラジカは塔の前にいる
        { x: 26, y: 7, sprite: 'tempo', on: 'bump', when: f => f.c3_boss, scene: 'c3_tempo_end' },
        { x: 27, y: 7, sprite: 'radika3', on: 'bump', when: f => f.c3_boss, scene: 'c3_radika_end' },
      ],
    },

    capital: {
      name: '王都アロマ', ch: 3, dim: true,
      grid: [
        'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ',
        'ZbbbbbbbbbZbbbbIIIbbbbZbbbbbbbbbZ',
        'ZbbUUUUUbbZbbbbIIIbbbbZbbUUUUUbbZ',
        'ZbbWWWWWbbZbbbbIDIbbbbZbbWWWWWbbZ',
        'ZbbWWDWWbbZbbbbbbbbbbbZbbWWWWWbbZ',
        'ZbbbbbbbbbZZZZZZNZZZZZZbbbbbbbbbZ',
        'ZbbbbbbbbbZbbbbbbbbbbbZbbbbbbbbbZ',
        'ZbbbbbbbbbZbbbbbbbbbbbZbbbbbbbbbZ',
        'ZbbbbbbbbbVbbAAAAAAAbbVbbbbbbbbbZ',
        'ZbbbbbbbbbZbbAAAAAAAbbZbbbbbbbbbZ',
        'ZbbbbbbbbbZbbPPPPPPPbbZbbbbbbbbbZ',
        'ZZZZZZZZZZZbbPPPPPPPbbZZZZZZZZZZZ',
        'ZnnnnnnnnnZbbPPPDPPPbbZbbbbbbbbbZ',
        'ZnUUUnUUUnZbbbbbbbbbbbZbbUUUUUbbZ',
        'ZnWWWnWWWnZbbT.bbb.TbbZbbWWWWWbbZ',
        'ZnnnnnnnnnZbb.fbbbf.bbZbbWWWWWbbZ',
        'ZnnnnnnnnnJbbf.bbb.fbbJbbbbbbbbbZ',
        'ZnUUUnnnnnZbb.fbbbf.bbZbbbbbbbbbZ',
        'ZnWWWnnnnnZbbT.bbb.TbbZbbbbbbbbbZ',
        'ZnnnnnnnnnZbbbbbbbbbbbZbbbbbbbbbZ',
        'ZnnnnnnnnnZbbbbbbbbbbbZbbbbbbbbbZ',
        'ZZZZZZZZZZZZZZbbbbbZZZZZZZZZZZZZZ',
        'ZbbUUUUUbbbbbbbbbbbbbbbbbUUUUUbbZ',
        'ZbbWWWWWbbeebbbbbbbbbeebbWWWWWbbZ',
        'ZbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbZ',
        'ZbbbbbbbbbbbbbbbabbbbbbbbbbbbbbbZ',
        'ZbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbZ',
        'ZbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbZ',
        'ZbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbZ',
        'ZZZZZZZZZZZZZZZQQQZZZZZZZZZZZZZZZ',
      ],
      // 配向性の門。城門区から見て、オルト区（2・6）とパラ区（4）はオルト・パラの紋章、メタ区（3・5）はメタの紋章で通れる
      passable: { J: f => f.c3_emblem, V: f => f.c3_emblem, N: f => f.c3_tempo },
      openTile: { J: 'i', V: 'i', N: 'i' },
      blockedText: {
        J: () => ['「オルト区の門」と書かれている。', '門番「オルト・パラの紋章を持たぬ者は、通すことができません」'],
        V: () => ['「メタ区の門」と書かれている。', '門番「メタの紋章を持たぬ者は、通すことができません」'],
        N: f => f.c3_king2 ? ['長老ベンゼン「光の塔へ行く前に、テンポに会え。城の外の、東の古い塔じゃ」']
          : ['「パラ区の門」と書かれている。固く閉ざされていて、王の許しがなければ開かないようだ。'],
      },
      encounters: { tiles: ['n'], when: f => f.c3_emblem && !f.c3_boss, enemies: ['c3Radical', 'c3Benzyl'] },
      inspect: {
        Z: '白い城壁だ。六角形の王都を、環のように囲んでいる。',
        I: '光の塔だ。てっぺんから、紫色の光が王国を照らしている。',
        P: '王宮の壁だ。金の縁どりが、六角形の模様を描いている。',
        a: '六角形の噴水だ。水が、環の上をぐるぐると巡っている。',
        e: '屋台だ。六角形の果物が並んでいる。',
      },
      events: [
        // 出入り口
        { x: 15, y: 29, on: 'step', warp: { map: 'shore', x: 14, y: 2, dir: 'down' } },
        { x: 16, y: 29, on: 'step', warp: { map: 'shore', x: 15, y: 2, dir: 'down' } },
        { x: 17, y: 29, on: 'step', warp: { map: 'shore', x: 15, y: 2, dir: 'down' } },
        { x: 16, y: 12, on: 'step', warp: { map: 'palace', x: 6, y: 7, dir: 'up' } },
        { x: 5, y: 4, on: 'step', warp: { map: 'workshop', x: 5, y: 6, dir: 'up' } },
        { x: 16, y: 3, on: 'step', when: f => f.c3_lastpillar && !f.c3_boss, warp: { map: 'ltower', x: 2, y: 11, dir: 'right' } },
        { x: 16, y: 3, on: 'step', when: f => f.c3_boss, text: '光の塔の扉は閉ざされている。もう、紫の光は差していない。' },
        // 6 本の柱（n は消える順の逆。0 番＝パラ区の柱が最後まで残る）
        { x: 13, y: 3, n: 0, sprite: pillar(0), on: 'bump', text: pillarText(0) },
        { x: 12, y: 26, n: 1, sprite: pillar(1), on: 'bump', text: pillarText(1) },
        { x: 30, y: 19, n: 2, sprite: pillar(2), on: 'bump', text: pillarText(2) },
        { x: 30, y: 9, n: 3, sprite: pillar(3), on: 'bump', text: pillarText(3) },
        { x: 2, y: 20, n: 4, sprite: pillar(4), on: 'bump', text: pillarText(4) },
        { x: 2, y: 9, n: 5, sprite: pillar(5), on: 'bump', text: pillarText(5) },
        // 城門区（1）
        { x: 14, y: 21, on: 'step', when: f => f.c3_king1 && !f.c3_radika1, scene: 'c3_radika1' },
        { x: 15, y: 21, on: 'step', when: f => f.c3_king1 && !f.c3_radika1, scene: 'c3_radika1' },
        { x: 16, y: 21, on: 'step', when: f => f.c3_king1 && !f.c3_radika1, scene: 'c3_radika1' },
        { x: 17, y: 21, on: 'step', when: f => f.c3_king1 && !f.c3_radika1, scene: 'c3_radika1' },
        { x: 18, y: 21, on: 'step', when: f => f.c3_king1 && !f.c3_radika1, scene: 'c3_radika1' },
        { x: 5, y: 24, sprite: 'innkeeper', on: 'bump', scene: 'c3_inn' },
        { x: 10, y: 24, sprite: 'pyridine', on: 'bump', scene: f => f.c3_boss ? 'c3_pyridine_end' : f.c3_pyr ? 'c3_pyridine2' : 'c3_pyridine' },
        { x: 22, y: 24, sprite: 'fruit', on: 'bump', scene: f => f.c3_boss ? 'c3_fruit_end' : f.c3_radika1 ? 'c3_fruit2' : 'c3_fruit' },
        { x: 8, y: 26, sprite: f => f.c3_aniboy ? 'aniBoyBr' : 'aniBoy', on: 'bump', scene: f => f.c3_aniboy ? 'c3_aniboy2' : 'c3_aniboy' },
        { x: 19, y: 26, sprite: 'sign', on: 'bump', text: ['「王都案内」　中央に王宮。まわりを 6 つの地区が環のように囲む。',
          '「城門区から見て、オルト区（2・6）とパラ区（4）へは、オルト・パラの紋章を持つ者のみ通行を許す」',
          '「メタ区（3・5）へは、メタの紋章を持つ者のみ通行を許す」'] },
        { x: 24, y: 26, sprite: 'aniHead', on: 'bump', scene: familyScene },
        { x: 25, y: 26, sprite: 'nitra', on: 'bump', scene: familyScene },
        { x: 26, y: 26, sprite: 'metaCount', on: 'bump', scene: familyScene },
        { x: 14, y: 28, sprite: 'bht', on: 'bump', scene: f => f.c3_boss ? 'c3_guard_end' : 'c3_guard' },
        { x: 18, y: 28, sprite: 'bht', on: 'bump', scene: f => f.c3_boss ? 'c3_guard_end' : 'c3_guard' },
        // オルト区（2）：ベンジル通り
        { x: 5, y: 16, sprite: 'ibu', on: 'bump', scene: f => f.c3_boss ? 'c3_ibu_end' : 'c3_ibu' },
        { x: 8, y: 19, sprite: 'victim', on: 'bump', scene: f => f.c3_boss ? 'c3_resident_end' : 'c3_resident' },
        { x: 4, y: 19, sprite: 'meso', on: 'bump', when: f => !f.c3_bmeso, scene: 'c3_bmeso' },
        { x: 8, y: 15, sprite: 'chest', on: 'bump', chest: { item: 'energy', flag: 'c3_chest1' } },
        // オルト区（6）：アニリン家
        { x: 24, y: 17, sprite: 'granny', on: 'bump', scene: 'c3_phenol' },
        { x: 31, y: 12, sprite: 'chest', on: 'bump', chest: { item: 'book', flag: 'c3_chest2' } },
        // メタ区（3）：臭素工房
        { x: 8, y: 6, sprite: 'prof', on: 'bump', scene: f => f.c3_mid ? 'c3_apprentice2' : 'c3_apprentice' },
        { x: 8, y: 1, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'c3_chest3' } },
        // メタ区（5）：メタ伯爵邸
        { x: 27, y: 5, sprite: 'butler', on: 'bump', scene: 'c3_butler' },
        { x: 24, y: 8, sprite: 'student', on: 'bump', scene: 'c3_student' },
        { x: 31, y: 1, sprite: 'chest', on: 'bump', chest: { item: 'energy', flag: 'c3_chest4' } },
        // パラ区（4）：最後の柱
        { x: 16, y: 5, on: 'step', when: f => f.c3_tempo && !f.c3_lastpillar, scene: 'c3_lastpillar' },
        { x: 13, y: 4, sprite: 'elder', on: 'bump', when: f => f.c3_lastpillar && !f.c3_boss, scene: 'c3_hold' },
        { x: 14, y: 4, sprite: 'naphthaNoCrown', on: 'bump', when: f => f.c3_lastpillar && !f.c3_boss, scene: 'c3_hold_king' },
        { x: 12, y: 4, sprite: 'elderCl', on: 'bump', when: f => f.c3_boss, scene: 'c3_elder_end' },
      ],
    },

    palace: {
      name: '王宮・玉座の間', ch: 3,
      grid: [
        '#############',
        '#S____t____S#',
        '#____ccc____#',
        '#_____c_____#',
        '#_____c_____#',
        '#_____c_____#',
        '#_____c_____#',
        '#_____c_____#',
        '######D######',
      ],
      inspect: {
        S: '本棚だ。『芳香族の系譜』『ヒュッケル則の書』……『追放者名簿』という古い帳面もある。',
        t: '鉄の玉座だ。2 つの六角形が並んだ紋章が彫られている。',
      },
      events: [
        { x: 6, y: 8, on: 'step', warp: { map: 'capital', x: 16, y: 13, dir: 'down' } },
        { x: 6, y: 2, sprite: f => f.c3_lastpillar ? 'naphthaNoCrown' : 'naphtha', on: 'bump', when: f => !f.c3_lastpillar || f.c3_boss,
          scene: f => f.c3_boss ? 'c3_king_end' : f.c3_king2 ? 'c3_king_after' : f.c3_mid ? 'c3_king2' : 'c3_king_idle' },
      ],
    },

    workshop: {
      name: '臭素工房', ch: 3,
      grid: [
        '###########',
        '#FF_SSS_FF#',
        '#_________#',
        '#___kkk___#',
        '#_________#',
        '#_________#',
        '#_________#',
        '#####D#####',
      ],
      inspect: {
        F: 'ドラフトの中で、赤茶色の液体が 1 滴ずつ、几帳面に滴下されている。',
        S: 'NBS、AIBN、過酸化ベンゾイル……ラジカル開始剤の瓶が、ラベルの向きまでそろえて並んでいる。',
        k: '作業台だ。滴下速度を記録した帳面が、びっしりと埋まっている。',
      },
      events: [
        { x: 5, y: 7, on: 'step', warp: { map: 'capital', x: 5, y: 5, dir: 'down' } },
        { x: 5, y: 2, sprite: 'bromosuc', on: 'bump', scene: f => f.c3_mid ? 'c3_bromo_after' : 'c3_bromo' },
      ],
    },

    tempo: {
      name: 'テンポの塔', ch: 3,
      grid: [
        '#########',
        '#qqqqqqq#',
        '#qqqkqqq#',
        '#qqqqqqq#',
        '#qqqqqqq#',
        '#qqqqqqq#',
        '#qqqqqqq#',
        '####D####',
      ],
      inspect: { k: '小さな卓だ。湯気の立つ茶碗が 2 つ置いてある。' },
      events: [
        { x: 4, y: 7, on: 'step', warp: { map: 'shore', x: 27, y: 6, dir: 'down' } },
        { x: 4, y: 3, sprite: 'tempo', on: 'bump', when: f => !f.c3_tempo, scene: 'c3_tempo' },
        { x: 2, y: 2, sprite: 'methylGuard', on: 'bump', text: '……（メチル基の護衛が、無言で立っている）' },
        { x: 6, y: 2, sprite: 'methylGuard', on: 'bump', text: '……（メチル基の護衛が、無言で立っている）' },
        { x: 2, y: 4, sprite: 'methylGuard', on: 'bump', text: '……（メチル基の護衛が、無言で立っている）' },
        { x: 6, y: 4, sprite: 'methylGuard', on: 'bump', text: f => f.c3_tempo ? '……（護衛は、主人の帰りを静かに待っている）' : '……（メチル基の護衛が、無言で立っている）' },
      ],
    },

    ltower: {
      name: '光の塔', ch: 3, bgm: 'tower',
      grid: [
        '###############',
        '#<qqquuuuuu#qq#',
        '###q#####u##qq#',
        '#qqq#uuu#u#uuq#',
        '#q###u#u#u#u###',
        '#quuuu#uuuuuuq#',
        '#####u#####u#u#',
        '#uuuuu#qqq#u#u#',
        '#u###u#q#q#u#u#',
        '#u#qqq#q#quuuu#',
        '#uuq####q######',
        '#>qqqqqqqqqqqq#',
        '###############',
      ],
      // 紫の光が当たる床（u）では、ラジカルが生まれやすい
      encounters: { tiles: ['u'], when: f => !f.c3_boss, enemies: ['c3Tower', 'c3Radical'] },
      onEnter: { flag: 'c3_tower', scene: 'c3_tower' },
      events: [
        { x: 1, y: 11, on: 'step', warp: { map: 'capital', x: 16, y: 4, dir: 'down' } },
        { x: 1, y: 1, on: 'step', warp: { map: 'ltop', x: 4, y: 6, dir: 'up' } },
        { x: 13, y: 1, sprite: 'chest', on: 'bump', chest: { item: 'energy', flag: 'c3_chest5' } },
        { x: 9, y: 7, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'c3_chest6' } },
      ],
    },

    ltop: {
      name: '光の塔の頂上', ch: 3, bgm: 'tower',
      grid: [
        '|||||||||',
        '|qqqyqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqqqqqq|',
        '|qqq>qqq|',
        '|||||||||',
      ],
      onEnter: { flag: 'c3_top', scene: 'c3_boss' },
      inspect: { y: '巨大な紫外線ランプだ。' },
      events: [
        { x: 4, y: 7, on: 'step', warp: { map: 'ltower', x: 2, y: 1, dir: 'right' } },
        { x: 4, y: 3, sprite: 'radika', on: 'bump', when: f => !f.c3_boss, scene: 'c3_boss' },
      ],
    },
    // ================= 第 4 章 =================
    mount: {
      name: '北の山道', ch: 4, bgm: 'forest',
      grid: [
        'HHHHHHHHHH,,HHHHHHHHHH',
        'HHHTT....,,.....TTHHHH',
        'HHT..gg..,,..gg....THH',
        'HH...gg,,,,..gg.....HH',
        'HH....,,HHHH.......HHH',
        'HHH...,,HHHHH..ggg..HH',
        'HH.....,,,,,,,.ggg..HH',
        'HH..ggg....HH,,.....HH',
        'HHH.ggg....HH.,,,...HH',
        'HHHH.......HHH..,,..HH',
        'HHHHHH..rr...H..,,.HHH',
        'HHH....rr.....,,,..HHH',
        'HH..gg....,,,,,....THH',
        'HH..gg...,,HHH..gg..HH',
        'HHT.....,,HHHHH.gg..HH',
        'HH.....,,..HHH......HH',
        'HH..ggg,,.......ggg.HH',
        'HHH.ggg.,,......ggg.HH',
        'HHHT.....,,..T.....HHH',
        'HHHHT.....,,...THHHHHH',
        'HHHHHHT...,,..THHHHHHH',
        'HHHHHHHHHH,,HHHHHHHHHH',
      ],
      onEnter: { flag: 'c4_mount', scene: 'c4_mount' },
      encounters: { tiles: ['g'], when: f => f.ch4 && !f.c4_boss, enemies: ['c4Mountain', 'c4Mountain', 'c4Decalin'] },
      inspect: { H: '切り立った岩肌だ。上のほうが、鏡のように光っている。', r: '大きな岩だ。' },
      events: [
        { x: 10, y: 21, on: 'step', warp: { map: 'forest', x: 14, y: 1, dir: 'down' } },
        { x: 11, y: 21, on: 'step', warp: { map: 'forest', x: 15, y: 1, dir: 'down' } },
        { x: 10, y: 0, on: 'step', warp: { map: 'lake', x: 12, y: 22, dir: 'up' } },
        { x: 11, y: 0, on: 'step', warp: { map: 'lake', x: 12, y: 22, dir: 'up' } },
        { x: 13, y: 19, sprite: 'sign', on: 'bump', text: '↑ 鏡の湖' },
        { x: 3, y: 2, sprite: 'chest', on: 'bump', chest: { item: 'energy', flag: 'c4_chest1' } },
      ],
    },

    lake: {
      name: '鏡の湖', ch: 4, bgm: 'mirror',
      grid: [
        '`````````````````````````',
        '`````````````````````````',
        '``CC`````````````````CC``',
        '``CC`````````````````CC``',
        'HHCC`````````````````CCHH',
        'HHCCHCCCCCCCCCCCCCCCHCCHH',
        'HHCCHC1"1"1"""1"1"1CHCCHH',
        'HHCCHC1"1"1"7"1"1"1CHCCHH',
        'HHCCHC1"1"1"7"1"1"1CHCCHH',
        'TTCC.888888888888888.CCTT',
        'T...+999999999999999+...T',
        'T99999999999999999999999T',
        'T..vvvvvvvvvzvvvvvvvvv..T',
        'T..vvvvvvvvvzvvvvvvvvv..T',
        'T..vvvvvvvvvzvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T..vvvvvvvvvvvvvvvvvvv..T',
        'T.......................T',
        'TTTTTTTTTTT,,,TTTTTTTTTTT',
        'TTTTTTTTTTT,,,TTTTTTTTTTT',
      ],
      onEnter: { flag: 'c4_lake', scene: 'c4_lake' },
      // 神殿の前の石段（水ぎわ）から、湖に映った逆さまの石段を下りて、映った扉へ入る。
      // 映った神殿は水ぎわから下へぶら下がっているので、入口は水ぎわのすぐ下（映った扉 = 22 − 扉の行）。
      // この水面は、門番に話を聞いてから歩ける。鏡が割れたあとは、もう映っていない
      passable: { z: f => f.c4_bull && !f.c4_boss },
      blockedText: {
        z: f => f.c4_boss ? '湖には、もう神殿は映っていない。さざ波が立っている。' : ['湖の水面だ。神殿が、逆さまにくっきりと映っている。', '……踏み出しても、大丈夫だろうか。'],
        v: f => f.c4_boss ? '湖に、さざ波が立っている。' : f.c4_bull ? ['湖の水面だ。逆さまの神殿の、柱のあたりが映っている。', '……足を乗せたら、沈みそうだ。'] : '湖の水面だ。波ひとつなく、神殿が逆さまに映っている。',
        7: f => f.c4_bull ? ['正面の大扉だ。……びくともしない。', '見上げると、扉の上の飾りが、夜空のほうを向いている。'] : ['正面の大扉だ。……びくともしない。'],
      },
      inspect: { '+': '青い炎のかがり火だ。近づいても、ちっとも熱くない。', C: '白い大理石の神殿だ。左右が寸分違わず対称に組まれている。' },
      reflect: { when: f => !f.c4_boss, x0: 3, x1: 21, y0: 12, y1: 20, axis: 11 },
      swap: { v: f => f.c4_boss ? 'j' : null, z: f => f.c4_boss ? 'j' : null },
      paintKey: f => (f.c4_boss ? 1 : 0),
      paint: (g, T, f) => paintTemple(g, T, f),
      events: [
        { x: 11, y: 23, on: 'step', warp: { map: 'mount', x: 10, y: 1, dir: 'down' } },
        { x: 12, y: 23, on: 'step', warp: { map: 'mount', x: 11, y: 1, dir: 'down' } },
        { x: 13, y: 23, on: 'step', warp: { map: 'mount', x: 11, y: 1, dir: 'down' } },
        { x: 13, y: 21, sprite: () => 'bull' + (Math.floor(Date.now() / 1500) % 3), on: 'bump', scene: f => f.c4_boss ? 'c4_bull_end' : f.c4_bull ? 'c4_bull_again' : 'c4_bull' },
        { x: 12, y: 14, on: 'step', when: f => f.c4_bull && !f.c4_in, scene: 'c4_enter' },
        { x: 12, y: 14, on: 'step', when: f => f.c4_in && !f.c4_boss, warp: { map: 'kairo', x: 6, y: 27, dir: 'up' } },
        { x: 10, y: 21, sprite: 'achiralOpen', on: 'bump', when: f => f.c4_boss, scene: 'c4_akiral_end' },
      ],
    },

    kairo: {
      name: '鏡の回廊', ch: 4, bgm: 'mirror',
      grid: [
        'CCCCCC9CCCCCC',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'CCCCC999CCCCC',
        'C19999999991C',
        'C99999999999C',
        'C99999999999C',
        'C99999999999C',
        'C19999999991C',
        'CCCCC999CCCCC',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'CCCCC999CCCCC',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'CCCCC999CCCCC',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'C19999999991C',
        'CCCCCC9CCCCCC',
      ],
      onEnter: { flag: 'c4_kairo', scene: 'c4_kairo' },
      encounters: { tiles: ['9'], when: f => !f.c4_boss, enemies: ['c4Temple', 'c4Decalin'] },
      inspect: { C: '白い壁だ。左右の壁の模様が、鏡に映したようにそろっている。', 1: '柱だ。反対側にも、まったく同じ柱が立っている。' },
      events: [
        { x: 6, y: 28, on: 'step', warp: { map: 'lake', x: 12, y: 11, dir: 'down' } },
        { x: 6, y: 0, on: 'step', warp: { map: 'mhall', x: 3, y: 17, dir: 'up' } },
        ...[[1, 22], [2, 16], [3, 10], [4, 4]].flatMap(([n, y]) => [5, 6, 7].map((x, i) => (
          { x, y, sprite: ['rotDoorL', 'rotDoorC', 'rotDoorR'][i], on: 'bump', when: f => !f['c4_door' + n], scene: 'c4_door' + n }))),
        { x: 3, y: 25, sprite: () => 'bull' + (Math.floor(Date.now() / 1500) % 3), on: 'bump', when: f => !f.c4_boss, scene: 'c4_bull2' },
        { x: 1, y: 7, sprite: 'molMeso', on: 'bump', text: ['逆旋で閉じた、cis 体の分子たちだ。', '2 つのメチル基が同じ側にある。分子の真ん中に、鏡面が通っている（メソ体）。'] },
        { x: 11, y: 7, sprite: 'molChiral', on: 'bump', text: ['同旋で閉じた、trans 体の分子たちだ。', '2 つのメチル基が反対側にある。鏡面はないが、180° 回すと自分に重なる（C₂ 軸）。'] },
        ...[5, 6, 7].map(x => ({ x, y: 9, on: 'step', when: f => f.c4_door3 && !f.c4_c2talk, scene: 'c4_c2talk' })),
        { x: 9, y: 2, sprite: () => 'bull' + (Math.floor(Date.now() / 1500) % 3), on: 'bump', when: f => f.c4_door4 && !f.c4_boss, scene: 'c4_bull3' },
        { x: 3, y: 13, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'c4_chest2' } },
      ],
    },

    // 鏡の広間：左の部屋をカーボが、右の部屋を影が歩く。影は左右だけ逆に動く（game.js の mirror の処理）
    mhall: {
      name: '鏡の広間', ch: 4, bgm: 'mirror',
      grid: [
        'CCC}CCCCCCCCCCC',
        'C$%%%%%!%%%$%%C',
        'C%1%%%%!%%1%%%C',
        'C1%1%1%!11%%%1C',
        'C1%%%%%!1%%%%1C',
        'C%%%%%%!%%%%%%C',
        'CCC]CCCCCCCCCCC',
        'C$%%%%%!$%%%%%C',
        'C%%%%%%!%1%%%1C',
        'C1%1%%%!%%%%%%C',
        'C%%%%%%!%%%%%%C',
        'C%%%%%%!%%%%%%C',
        'CCC[CCCCCCCCCCC',
        'C$%%%%%!%%%%%$C',
        'C%%%%%%!%%%%%%C',
        'C%%%%%%!%%%%%%C',
        'C%%%%%%!%%%%%%C',
        'C%%%%%%!%%%%%%C',
        'CCC9CCCCCCCCCCC',
      ],
      mirror: { axis: 7, startX: 3, rooms: [[13, 17, 'c4_mh1'], [7, 11, 'c4_mh2'], [1, 5, 'c4_mh3']] },
      onEnter: { flag: 'c4_mhall', scene: 'c4_mhall' },
      passable: { '[': f => f.c4_mh1, ']': f => f.c4_mh2, '}': f => f.c4_shadow },
      openTile: { '[': '%', ']': '%', '}': '%' },
      blockedText: {
        '[': () => ['銀の格子が閉じている。', '【ヒント】カーボと影が、それぞれの部屋の金のスイッチを同時に踏むと開く。'],
        ']': () => ['銀の格子が閉じている。', '【ヒント】影は、壁にぶつかると止まる。止まっているあいだも、カーボは動ける。'],
        '}': () => ['銀の格子が閉じている。ガラスの向こうから、影がこちらを見ている……。'],
      },
      inspect: { '!': ['ガラスの壁だ。向こうの部屋で、左右が逆の自分が、同じようにこちらを見ている。', '【ヒント】部屋を出て入り直すと、影も入口の位置に戻る。'] },
      events: [
        { x: 3, y: 18, on: 'step', warp: { map: 'kairo', x: 6, y: 1, dir: 'down' } },
        { x: 3, y: 0, on: 'step', when: f => f.c4_shadow, warp: { map: 'chapel', x: 8, y: 12, dir: 'up' } },
        { x: 7, y: 3, sprite: 'shadow', on: 'bump', when: f => f.c4_mh3 && !f.c4_shadow, scene: 'c4_shadow' },
      ],
    },

    chapel: {
      name: '婚礼の間', ch: 4, bgm: 'mirror',
      grid: [
        'CCCCCCCCDCCCCCCCC',
        'CCCCCCCC9CCCCCCCC',
        'C999999^9^999999C',
        'Cff99999999999ffC',
        'C9::::::&::::::9C',
        'C9999999&9999999C',
        'C9::::::&::::::9C',
        'C9999999&9999999C',
        'C9::::::&::::::9C',
        'C9999999&9999999C',
        'C9999999&9999999C',
        'C9999999&9999999C',
        'C9999999&9999999C',
        'CCCCCCCCDCCCCCCCC',
      ],
      inspect: { ':': '長いすだ。左右に同じ数ずつ、きっちり並んでいる。', '^': '祭壇だ。左右に 1 本ずつ、ろうそくが灯っている。' },
      events: [
        { x: 8, y: 13, on: 'step', warp: { map: 'mhall', x: 3, y: 1, dir: 'down' } },
        { x: 8, y: 0, on: 'step', when: f => f.c4_wed, warp: { map: 'oku', x: 7, y: 18, dir: 'up' } },
        { x: 8, y: 2, sprite: 'priest', on: 'bump', when: f => !f.c4_wed, scene: 'c4_wedding' },
        { x: 8, y: 9, on: 'step', when: f => !f.c4_wed, scene: 'c4_wedding' },
        { x: 7, y: 3, sprite: 'cpd', on: 'bump', scene: f => f.c4_wed ? 'c4_couple2' : 'c4_couple' },
        { x: 9, y: 3, sprite: 'maleic', on: 'bump', scene: f => f.c4_wed ? 'c4_couple2' : 'c4_couple' },
        { x: 3, y: 5, sprite: 'dicyclo', on: 'bump', scene: 'c4_dicyclo' },
        { x: 4, y: 7, sprite: 'meso', on: 'bump', text: ['参列者「対称！ 対称！ ……あ、今日はお祝いだった。おめでとう！」'] },
        { x: 12, y: 7, sprite: 'meso', on: 'bump', text: ['参列者「新郎新婦の席の数も、左右で同じにしてあるのです」'] },
      ],
    },

    oku: {
      name: '奥の院', ch: 4, bgm: 'mirror',
      grid: [
        'CCCCCCCCCCCCCCC',
        'CCCC@@@@@@@CCCC',
        'CCCC@@@@@@@CCCC',
        'C9999999999999C',
        'C1999999999991C',
        'C1999999999991C',
        'C1999999999991C',
        'C1999999999991C',
        'C1999999999991C',
        'CCCC8888888CCCC',
        'CCCC8888888CCCC',
        'CCCC8888888CCCC',
        'C9999999999999C',
        'C9999999999999C',
        'C1999999999991C',
        'C9999999999999C',
        'C1999999999991C',
        'C9999999999999C',
        'C9999999999999C',
        'CCCCCCCDCCCCCCC',
      ],
      swap: { '@': f => f.c4_shatter ? '?' : null },
      inspect: { '@': f => f.c4_shatter ? '粉々に割れた大鏡だ。かけらの 1 枚 1 枚に、自分の顔が小さく映っている。' : '天井まで届く大きな鏡だ。のぞきこむと、自分の顔が映る。' },
      events: [
        { x: 7, y: 19, on: 'step', warp: { map: 'chapel', x: 8, y: 1, dir: 'down' } },
        // ボスの前の休み場所（ブルバレンが茶を出してくれる）
        { x: 2, y: 17, sprite: () => 'bull' + (Math.floor(Date.now() / 1500) % 3), on: 'bump', when: f => !f.c4_boss, scene: 'c4_rest' },
        // 階段の手前の 1 行すべて（端を回りこんで見張りを避けられないように）
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(x => ({ x, y: 13, on: 'step', when: f => !f.c4_guards, scene: 'c4_okumae' })),
        { x: 5, y: 11, sprite: 'meso', on: 'bump', when: f => !f.c4_guards, scene: 'c4_okumae' },
        { x: 9, y: 11, sprite: 'meso', on: 'bump', when: f => !f.c4_guards, scene: 'c4_okumae' },
        { x: 7, y: 4, sprite: f => f.c4_shatter ? 'achiralOpen' : 'achiral', on: 'bump', when: f => !f.c4_boss, scene: 'c4_boss' },
        ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(x => ({ x, y: 7, on: 'step', when: f => f.c4_guards && !f.c4_boss, scene: 'c4_boss' })),
        { x: 7, y: 3, sprite: 'racemizer', when: f => f.c4_racem && !f.c4_shatter },
      ],
    },
  };

  return { MAPS, pillarsLit, goalOf };
})();
