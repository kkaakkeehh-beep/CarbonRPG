// =============================================================
// chem.js — 反応エンジン（DOM に依存しない純粋なロジック）
//
// 化学種は文字列キーで表す:
//   置換体   "骨格:置換基:立体"   例) "sBu:Br:R"   立体なしは "-"
//   アルケン "alk:ID"            例) "alk:2m1b"
// フラスコは { キー: 物質量(%) } のオブジェクト。
// =============================================================
const Chem = (() => {

  // ---- 骨格 ----------------------------------------------------
  // names の {c} には "(R)-" などの立体表記が入る。
  // 本ゲームのキラル骨格では、どの置換基 X も CIP 順位 1 位になる
  // （X > エチル/イソプロピル > メチル > H）。よって
  // 「立体反転 = R/S が入れ替わる」がつねに成り立つ。
  const SKELETONS = {
    nBu: {
      cls: 'primary', chiral: false,
      smiles: x => 'CCCC' + x,
      names: {
        Br: '1-ブロモブタン', I: '1-ヨードブタン', OH: '1-ブタノール', OTs: 'トシル酸ブチル',
        OAc: '酢酸ブチル', N3: '1-アジドブタン', CN: 'ペンタンニトリル', SMe: '1-(メチルチオ)ブタン',
        OMe: '1-メトキシブタン', OEt: '1-エトキシブタン', OtBu: '1-(tert-ブトキシ)ブタン',
      },
      elim: { zaitsev: [['1-butene', 1]], hofmann: [['1-butene', 1]] },
    },
    sBu: {
      cls: 'secondary', chiral: true,
      smiles: (x, cfg) => cfg === 'R' ? `C[C@@H](${x})CC` : cfg === 'S' ? `C[C@H](${x})CC` : `CC(${x})CC`,
      names: {
        Br: '{c}2-ブロモブタン', I: '{c}2-ヨードブタン', OH: '{c}2-ブタノール', OTs: 'トシル酸 {c}2-ブチル',
        OAc: '酢酸 {c}2-ブチル', N3: '{c}2-アジドブタン', CN: '{c}2-メチルブタンニトリル',
        SMe: '{c}2-(メチルチオ)ブタン', OMe: '{c}2-メトキシブタン', OEt: '{c}2-エトキシブタン',
        OtBu: '{c}2-(tert-ブトキシ)ブタン',
      },
      // 2-ブロモブタン: EtO⁻ → 2-ブテン 81% / 1-ブテン 19%、t-BuO⁻ → 1-ブテン 53%
      elim: {
        zaitsev: [['E-2-butene', 0.61], ['Z-2-butene', 0.20], ['1-butene', 0.19]],
        hofmann: [['1-butene', 0.53], ['E-2-butene', 0.35], ['Z-2-butene', 0.12]],
      },
    },
    tBu: {
      cls: 'tertiary', chiral: false,
      smiles: x => `CC(C)(C)${x}`,
      names: {
        Br: '2-ブロモ-2-メチルプロパン', I: '2-ヨード-2-メチルプロパン', OH: '2-メチル-2-プロパノール',
        OAc: '酢酸 tert-ブチル', N3: '2-アジド-2-メチルプロパン', CN: '2,2-ジメチルプロパンニトリル',
        SMe: '2-メチル-2-(メチルチオ)プロパン', OMe: '2-メトキシ-2-メチルプロパン (MTBE)',
        OEt: '2-エトキシ-2-メチルプロパン (ETBE)', OtBu: 'ジ-tert-ブチルエーテル',
      },
      elim: { zaitsev: [['isobutylene', 1]], hofmann: [['isobutylene', 1]] },
    },
    tAm: {
      cls: 'tertiary', chiral: false,
      smiles: x => `CCC(C)(C)${x}`,
      names: {
        Br: '2-ブロモ-2-メチルブタン', I: '2-ヨード-2-メチルブタン', OH: '2-メチル-2-ブタノール',
        OAc: '酢酸 2-メチル-2-ブチル', N3: '2-アジド-2-メチルブタン', CN: '2,2-ジメチルブタンニトリル',
        SMe: '2-メチル-2-(メチルチオ)ブタン', OMe: '2-メトキシ-2-メチルブタン (TAME)',
        OEt: '2-エトキシ-2-メチルブタン', OtBu: '2-(tert-ブトキシ)-2-メチルブタン',
      },
      // 2-ブロモ-2-メチルブタン: EtO⁻ → 70:30、t-BuO⁻ → 28:72（Zaitsev:Hofmann）
      elim: {
        zaitsev: [['2m2b', 0.70], ['2m1b', 0.30]],
        hofmann: [['2m1b', 0.72], ['2m2b', 0.28]],
      },
    },
    m2b: {
      cls: 'secondary', chiral: true, betaBranched: true,
      smiles: (x, cfg) => cfg === 'R' ? `C[C@@H](${x})C(C)C` : cfg === 'S' ? `C[C@H](${x})C(C)C` : `CC(${x})C(C)C`,
      names: {
        Br: '{c}2-ブロモ-3-メチルブタン', I: '{c}2-ヨード-3-メチルブタン', OH: '{c}3-メチル-2-ブタノール',
        OTs: 'トシル酸 {c}3-メチル-2-ブチル', OAc: '酢酸 {c}3-メチル-2-ブチル', N3: '{c}2-アジド-3-メチルブタン',
        CN: '{c}2,3-ジメチルブタンニトリル', SMe: '{c}2-メチル-3-(メチルチオ)ブタン',
        OMe: '{c}2-メトキシ-3-メチルブタン', OEt: '{c}2-エトキシ-3-メチルブタン',
        OtBu: '{c}2-(tert-ブトキシ)-3-メチルブタン',
      },
      elim: {
        zaitsev: [['2m2b', 0.70], ['3m1b', 0.30]],
        hofmann: [['3m1b', 0.75], ['2m2b', 0.25]],
      },
      // 第二級カチオン → 1,2-ヒドリドシフト → 第三級カチオン
      rearr: { to: 'tAm', p: 0.9 },
    },
  };

  const ALKENES = {
    '1-butene':   { name: '1-ブテン', smiles: 'C=CCC', cation: 'sBu' },
    'E-2-butene': { name: '(E)-2-ブテン', smiles: 'C/C=C/C', cation: 'sBu' },
    'Z-2-butene': { name: '(Z)-2-ブテン', smiles: 'C/C=C\\C', cation: 'sBu' },
    isobutylene:  { name: '2-メチルプロペン', smiles: 'C=C(C)C', cation: 'tBu' },
    '2m1b':       { name: '2-メチル-1-ブテン', smiles: 'C=C(C)CC', cation: 'tAm' },
    '2m2b':       { name: '2-メチル-2-ブテン', smiles: 'CC=C(C)C', cation: 'tAm' },
    '3m1b':       { name: '3-メチル-1-ブテン', smiles: 'C=CC(C)C', cation: 'm2b' },
  };

  // lg: 脱離能（0 = 脱離しない）
  const GROUPS = {
    Br:   { smi: 'Br', lg: 1.0 },
    I:    { smi: 'I', lg: 1.2 },
    OTs:  { smi: 'OS(=O)(=O)c1ccc(C)cc1', lg: 1.2 },
    OH:   { smi: 'O', lg: 0, alcohol: true },
    OAc:  { smi: 'OC(C)=O', lg: 0, ester: true },
    N3:   { smi: 'N=[N+]=[N-]', lg: 0 },
    CN:   { smi: 'C#N', lg: 0 },
    SMe:  { smi: 'SC', lg: 0 },
    OMe:  { smi: 'OC', lg: 0 },
    OEt:  { smi: 'OCC', lg: 0 },
    OtBu: { smi: 'OC(C)(C)C', lg: 0 },
  };

  // ---- 試薬 ----------------------------------------------------
  // cls: NU = 強い求核剤・弱い塩基 / SB = 強い求核剤・強い塩基 / BULKY = かさ高い強塩基
  const REAGENTS = {
    NaN3:      { label: 'NaN₃', cls: 'NU', nu: 'N3', salt: 'Na' },
    NaI:       { label: 'NaI', cls: 'NU', nu: 'I', salt: 'Na', finkelstein: true },
    NaSMe:     { label: 'NaSMe', cls: 'NU', nu: 'SMe', salt: 'Na' },
    AcONa:     { label: 'AcONa', cls: 'NU', nu: 'OAc', salt: 'Na', weakNu: true },
    NaCN:      { label: 'NaCN', cls: 'NU', nu: 'CN', salt: 'Na', basicFor3: true },
    NaOH:      { label: 'NaOH', cls: 'SB', nu: 'OH', salt: 'Na' },
    NaOEt:     { label: 'NaOEt', cls: 'SB', nu: 'OEt', salt: 'Na' },
    tBuOK:     { label: 't-BuOK', cls: 'BULKY', nu: 'OtBu', salt: 'K' },
    HBr:       { label: 'HBr', cls: 'HBR' },
    H2SO4:     { label: 'H₂SO₄', cls: 'H2SO4' },
    TsCl:      { label: 'TsCl', cls: 'TSCL', moisture: true },
    PBr3:      { label: 'PBr₃', cls: 'PBR3', moisture: true },
    Mitsunobu: { label: '光延試薬', cls: 'MITSU', moisture: true },
  };

  const SOLVENTS = {
    DMSO:    { label: 'DMSO', protic: false },
    DMF:     { label: 'DMF', protic: false },
    acetone: { label: 'アセトン', protic: false },
    THF:     { label: 'THF', protic: false },
    MeOH:    { label: 'MeOH', protic: true, nu: 'OMe' },
    EtOH:    { label: 'EtOH', protic: true, nu: 'OEt' },
    tBuOH:   { label: 't-BuOH', protic: true, nu: 'OtBu', bulkyNu: true },
    H2O:     { label: 'H₂O', protic: true, nu: 'OH' },
  };

  const TEMPS = {
    cold:   { label: '0 °C', rate: 0.5, elim: 0.6 },
    rt:     { label: '室温', rate: 1.0, elim: 1.0 },
    reflux: { label: '還流', rate: 1.6, elim: 1.8 },
  };

  // ---- キーと表示 ----------------------------------------------
  const key = (sk, x, cfg) => `${sk}:${x}:${cfg || '-'}`;
  const parse = k => {
    if (k.startsWith('alk:')) return { alk: k.slice(4) };
    const [sk, x, c] = k.split(':');
    return { sk, x, cfg: c === '-' ? null : c };
  };
  const invert = cfg => cfg === 'R' ? 'S' : cfg === 'S' ? 'R' : null;

  function describe(k) {
    const sp = parse(k);
    if (sp.alk) {
      const a = ALKENES[sp.alk];
      return { name: a.name, smiles: a.smiles, alkene: true };
    }
    const S = SKELETONS[sp.sk];
    const tmpl = S.names[sp.x] || `${sp.sk}-${sp.x}`;
    return {
      name: tmpl.replace("{c}", sp.cfg ? `(${sp.cfg})-` : ""),
      smiles: S.smiles(GROUPS[sp.x].smi, sp.cfg),
      cfg: sp.cfg, sk: sp.sk, x: sp.x,
    };
  }

  // まだ反応しうる「敵」とみなす化学種（脱離基・OH・エステルを持つもの）
  function isReactive(k) {
    const sp = parse(k);
    if (sp.alk) return false;
    const g = GROUPS[sp.x];
    return g.lg > 0 || g.alcohol || g.ester;
  }

  // ---- 補助 ----------------------------------------------------
  const pct = w => Math.round(w * 100);
  function mechLabel(paths) {
    return Object.entries(paths).filter(([, w]) => w > 0.004)
      .sort((a, b) => b[1] - a[1]).map(([m, w]) => `${m} ${pct(w)}%`).join(' / ');
  }
  function normalize(paths) {
    const s = Object.values(paths).reduce((a, b) => a + b, 0);
    const o = {};
    for (const [m, w] of Object.entries(paths)) if (w > 0) o[m] = w / s;
    return o;
  }
  function addTo(map, k, v) { if (v > 0) map[k] = (map[k] || 0) + v; }

  // カルボカチオンを経由する生成物（転位・ラセミ化を含む）
  // sN: 求核捕捉の割合, e: E1 の割合, nus: [[求核基, 割合], ...]
  function cationProducts(skId, sN, e, nus, out, notes) {
    const S = SKELETONS[skId];
    const branches = S.rearr ? [[S.rearr.to, S.rearr.p], [skId, 1 - S.rearr.p]] : [[skId, 1]];
    if (S.rearr) notes.push(`第二級カチオンが 1,2-ヒドリドシフト → より安定な第三級カチオンへ転位（${pct(S.rearr.p)}%）`);
    for (const [s, p] of branches) {
      const S2 = SKELETONS[s];
      for (const [nu, f] of nus) {
        if (S2.chiral) {
          addTo(out, key(s, nu, 'R'), p * sN * f / 2);
          addTo(out, key(s, nu, 'S'), p * sN * f / 2);
        } else addTo(out, key(s, nu, null), p * sN * f);
      }
      for (const [a, f] of S2.elim.zaitsev) addTo(out, 'alk:' + a, p * e * f);
    }
    if (S.chiral && sN > 0) notes.push('平面のカルボカチオンは両面から攻撃される → ラセミ化');
  }

  // 求核剤・塩基の溶媒による効き目
  function solventRate(R, solvId, c, notes) {
    if (R.salt === 'K') {
      const t = { THF: 1, DMSO: 1, DMF: 0.9, tBuOH: 0.8, acetone: 0.2, MeOH: 0.8, EtOH: 0.8, H2O: 0.5 }[solvId];
      if (solvId === 'acetone') notes.push('t-BuOK がアセトンを脱プロトン化 → 自己アルドール縮合で試薬が消費された');
      return t;
    }
    const t = { DMSO: 1, DMF: 1, acetone: R.finkelstein ? 1 : 0.7, THF: 0.25, MeOH: 0.5, EtOH: 0.5, tBuOH: 0.3, H2O: 0.3 }[solvId];
    if (solvId === 'THF') notes.push('ナトリウム塩は THF にほとんど溶けない → 反応が遅い');
    if (solvId === 'H2O') notes.push('基質が水に溶けず二相系になる → 反応が遅い');
    if (SOLVENTS[solvId].protic && solvId !== 'H2O') notes.push('プロトン性溶媒がアニオンを水素結合で囲み、求核性が下がる');
    if (!SOLVENTS[solvId].protic && solvId !== 'THF' && !c.humid) notes.push('非プロトン性極性溶媒: アニオンが“裸”になり SN2 が速い');
    return t;
  }

  // ---- 1 化学種ぶんの反応結果 -----------------------------------
  // 返り値: { rate, out:{キー:割合}, mech, notes } / 反応なしは { rate:0, notes }
  function outcomeFor(k, c) {
    const notes = [];
    const none = msg => ({ rate: 0, out: {}, mech: '', notes: [msg] });
    const R0 = c.reagent ? REAGENTS[c.reagent] : null;
    const Sv = SOLVENTS[c.solvent];
    const protic = Sv.protic || c.humid;
    const solvNu = Sv.protic ? Sv.nu : (c.humid ? 'OH' : null);
    const T = TEMPS[c.temp];
    const sp = parse(k);

    // アルコキシド塩基はアルコール溶媒中では溶媒のアルコキシドに入れ替わる
    let R = R0;
    if (R && (R.cls === 'SB' || R.cls === 'BULKY') && Sv.protic && Sv.nu !== R.nu && c.solvent !== 'tBuOH') {
      R = { ...R, cls: 'SB', nu: Sv.nu };
      notes.push(`${R0.label} が溶媒を脱プロトン化 → 実質 ${Sv.nu === 'OH' ? 'HO⁻' : Sv.nu === 'OMe' ? 'MeO⁻' : 'EtO⁻'} として働く`);
    }

    // --- アルケン ---
    if (sp.alk) {
      const A = ALKENES[sp.alk];
      const out = {};
      if (R && R.cls === 'HBR') {
        notes.push('Markovnikov 付加: より安定なカルボカチオンを経由');
        cationProducts(A.cation, 1, 0, [['Br', 1]], out, notes);
        return { rate: 1, out, mech: 'HBr 付加', notes };
      }
      if (R && R.cls === 'H2SO4' && c.solvent === 'H2O' && c.temp !== 'reflux') {
        notes.push('酸触媒水和（Markovnikov）');
        cationProducts(A.cation, 1, 0, [['OH', 1]], out, notes);
        return { rate: 0.5, out, mech: '酸触媒水和', notes };
      }
      return none('アルケンはこの条件では反応しない');
    }

    const S = SKELETONS[sp.sk];
    const G = GROUPS[sp.x];
    const cls = S.cls;

    // --- アルコール ---
    if (G.alcohol) {
      if (!R || ['NU', 'SB', 'BULKY'].includes(R.cls)) {
        return none(R && R.cls !== 'NU' ? 'アルコキシドになるだけ。OH⁻ は脱離能が低い' : 'OH は脱離基にならない（HO⁻ は強塩基）。まず活性化を');
      }
      const out = {};
      const moist = R.moisture && c.humid ? 0.5 : 1;
      if (R.moisture && c.humid) notes.push('湿気で試薬が一部分解した');
      if (R.cls === 'HBR') {
        notes.push('OH がプロトン化されて H₂O として脱離');
        if (cls === 'primary') {
          addTo(out, key(sp.sk, 'Br', invert(sp.cfg)), 1);
          return { rate: 0.4 * T.rate, out, mech: 'SN2 100%', notes };
        }
        if (cls === 'secondary') {
          addTo(out, key(sp.sk, 'Br', invert(sp.cfg)), 0.3);
          cationProducts(sp.sk, 0.7, 0, [['Br', 1]], out, notes);
          return { rate: 0.6 * T.rate, out, mech: 'SN1 70% / SN2 30%', notes };
        }
        cationProducts(sp.sk, 1, 0, [['Br', 1]], out, notes);
        return { rate: 1, out, mech: 'SN1 100%', notes };
      }
      if (R.cls === 'H2SO4') {
        if (c.temp !== 'reflux') return none('加熱しないと脱水は進まない');
        if (cls === 'primary') return none('第一級アルコールの脱水にはもっと高温が必要');
        notes.push('OH がプロトン化 → 脱水して E1');
        cationProducts(sp.sk, 0, 1, [], out, notes);
        return { rate: cls === 'tertiary' ? 1 : 0.6, out, mech: 'E1 100%', notes };
      }
      if (cls === 'tertiary') return none('第三級アルコールは立体障害が大きく、この試薬は効かない');
      if (R.cls === 'TSCL') {
        if (Sv.protic && c.solvent !== 'H2O') return none('溶媒のアルコールがトシル化されてしまった');
        let rate = c.solvent === 'H2O' ? 0.2 : 1;
        if (c.solvent === 'H2O') notes.push('TsCl が水で加水分解されていく');
        notes.push('O–S 結合ができるだけで C–O 結合は切れない → 立体保持');
        addTo(out, key(sp.sk, 'OTs', sp.cfg), 1);
        return { rate: rate * moist, out, mech: 'トシル化（立体保持）', notes };
      }
      if (R.cls === 'PBR3') {
        if (Sv.protic) return none('PBr₃ が溶媒と反応して分解した');
        notes.push('O–P 結合で活性化 → Br⁻ が背面から攻撃（SN2・転位なし）');
        addTo(out, key(sp.sk, 'Br', invert(sp.cfg)), 1);
        return { rate: (S.betaBranched ? 0.9 : 1) * moist, out, mech: 'SN2 100%（立体反転）', notes };
      }
      if (R.cls === 'MITSU') {
        if (Sv.protic) return none('光延反応は無水・非プロトン性条件でないと進まない');
        notes.push('アルコキシホスホニウムを経由し、N₃⁻ が背面攻撃 → 一段階で立体反転');
        addTo(out, key(sp.sk, 'N3', invert(sp.cfg)), 1);
        return { rate: (c.solvent === 'THF' ? 1 : 0.8) * moist, out, mech: 'SN2 100%（立体反転）', notes };
      }
    }

    // --- エステル ---
    if (G.ester) {
      if (R && (R.cls === 'SB' || R.cls === 'BULKY')) {
        notes.push('カルボニル炭素への付加–脱離（アシル–酸素開裂）→ 不斉炭素は無傷なので立体保持');
        const out = {};
        addTo(out, key(sp.sk, 'OH', sp.cfg), 1);
        return { rate: (R.cls === 'BULKY' ? 0.5 : 1) * T.rate, out, mech: 'エステル加水分解', notes };
      }
      return none('エステルはこの条件では変化しない');
    }

    // --- 脱離基を持たないもの ---
    if (!G.lg) return none('脱離基がないので反応しない');

    // --- ハロゲン化アルキル・トシラート ---
    const out = {};
    let paths, rate, nusSN1;
    let lgf = G.lg;
    const Rn = R && ['NU', 'SB', 'BULKY'].includes(R.cls) ? R : null;
    if (R && R.cls === 'HBR') return none('Br⁻ が大過剰なので、カチオンができても臭化物に戻るだけ');
    if (R && !Rn) notes.push(`${R.label} はこの基質と直接は反応しない`);

    if (!Rn) {
      // 加溶媒分解（求核剤 = 溶媒）
      if (!protic) return none('求核剤も塩基もない（非プロトン性溶媒）');
      if (cls === 'primary') return none('第一級カチオンはできない。弱い求核剤では SN2 も遅すぎる');
      notes.push(`弱い求核剤（${c.humid && !Sv.protic ? '混入した水' : Sv.label}）のみ → 加溶媒分解`);
      rate = cls === 'tertiary' ? 0.6 : 0.15;
      if (c.ag) { rate *= cls === 'tertiary' ? 1.6 : 4; notes.push('Ag⁺ がハロゲン化物イオンを引き抜き、イオン化を加速'); }
      paths = { SN1: Sv.bulkyNu ? 0.3 : 0.8, E1: 0.2 };
      nusSN1 = [[solvNu, 1]];
    } else if (cls === 'primary') {
      rate = 1;
      paths = Rn.cls === 'NU' ? { SN2: 1 } : Rn.cls === 'SB' ? { SN2: 0.9, E2: 0.1 } : { SN2: 0.15, E2: 0.85 };
      if (Rn.cls === 'BULKY') notes.push('かさ高い塩基は炭素に近づけず、β-H を引き抜く');
    } else if (cls === 'secondary') {
      if (Rn.cls === 'NU') {
        rate = 1;
        paths = protic ? { SN2: 0.9, SN1: 0.1 } : { SN2: 1 };
        if (Rn.basicFor3) paths.E2 = 0.1;
        if (c.ag && protic) { paths = { SN2: 0.4, SN1: 0.6 }; notes.push('Ag⁺ がイオン化を促し、SN1 が増えた'); }
        nusSN1 = [[Rn.nu, 0.8], [solvNu, 0.2]];
      } else if (Rn.cls === 'SB') {
        rate = 1;
        paths = protic ? { SN2: 0.2, E2: 0.8 } : { SN2: 0.1, E2: 0.9 };
        notes.push('第二級 + 強塩基 → E2 が優勢');
      } else {
        rate = 1;
        paths = { E2: 1 };
        notes.push('かさ高い塩基: 置換はほぼ起こらず E2');
      }
      if (S.betaBranched && paths.SN2) { rate *= 0.6; notes.push('β 位の枝分かれが背面攻撃を妨げ、SN2 が遅い'); }
    } else {
      // 第三級
      if (Rn.cls === 'NU' && !Rn.basicFor3) {
        notes.push('第三級: 背面攻撃（SN2）は不可能');
        if (protic) {
          rate = 0.5;
          paths = { SN1: 0.75, E1: 0.25 };
          nusSN1 = [[Rn.nu, 0.8], [solvNu, 0.2]];
          if (c.ag) { rate *= 1.6; notes.push('Ag⁺ がイオン化を加速'); }
        } else {
          rate = 0.1;
          paths = { SN1: 0.5, E1: 0.5 };
          nusSN1 = [[Rn.nu, 1]];
          notes.push('非プロトン性溶媒ではカチオンが安定化されず、イオン化がとても遅い');
        }
      } else {
        rate = Rn.basicFor3 ? 0.8 : 1;
        paths = Rn.basicFor3 ? { E2: 0.9, SN1: 0.1 } : { E2: 1 };
        nusSN1 = [[Rn.nu, 1]];
        notes.push(Rn.basicFor3 ? '第三級には CN⁻ も塩基として働く → E2' : '第三級 + 強塩基 → E2');
      }
    }

    // 温度: 脱離はエントロピー的に有利 → 加熱で増える
    for (const m of ['E1', 'E2']) if (paths[m]) paths[m] *= T.elim;
    paths = normalize(paths);
    if (c.temp === 'reflux' && (paths.E1 || paths.E2) && (paths.SN1 || paths.SN2)) notes.push('加熱で脱離が増えた（ΔS > 0）');

    // 溶媒・試薬・温度による速度
    if (Rn) {
      rate *= solventRate(Rn, c.solvent, c, notes);
      if (Rn.weakNu && paths.SN2) rate *= 0.6;
      if (c.crown) {
        if (Rn.salt === 'K') { rate *= 1.5; notes.push('18-クラウン-6 が K⁺ を包み込み、アニオンの反応性が上がった'); }
        else notes.push('18-クラウン-6 は Na⁺ には少し大きい（15-クラウン-5 のほうが合う）');
      }
      if (Rn.finkelstein && sp.x === 'Br') {
        if (c.solvent === 'acetone') notes.push('NaBr がアセトンに溶けず沈殿 → 平衡が右へ（Finkelstein）');
        else { rate *= 0.5; notes.push('NaBr が溶けているので平衡で止まる（アセトンなら沈殿する）'); }
      }
    }
    rate *= lgf * T.rate;
    // 同じイオンの交換は平衡（正味の変化は立体だけ）なので、少しずつ進める
    if (Rn && Rn.nu === sp.x) rate = Math.min(rate, 1) * 0.3;

    // 生成物
    const bulky = Rn && Rn.cls === 'BULKY';
    if (paths.SN2) addTo(out, key(sp.sk, Rn.nu, invert(sp.cfg)), paths.SN2);
    if (paths.SN2 && Rn.nu === sp.x && S.chiral) notes.push('同じイオンどうしの交換: 反転をくり返すうちにラセミ化していく（Hughes の実験）');
    if (paths.E2) {
      for (const [a, f] of S.elim[bulky ? 'hofmann' : 'zaitsev']) addTo(out, 'alk:' + a, paths.E2 * f);
      notes.push(bulky ? 'かさ高い塩基は込み合っていない β-H を引き抜く → Hofmann 生成物' : 'より置換されたアルケンが主（Zaitsev 則）');
      if (paths.SN2 && S.chiral) notes.push('SN2 は背面攻撃 → 立体反転（Walden 反転）');
    } else if (paths.SN2 && S.chiral) notes.push('SN2 は背面攻撃 → 立体反転（Walden 反転）');
    if (paths.SN1 || paths.E1) {
      const tot = (paths.SN1 || 0) + (paths.E1 || 0);
      const sub = {};
      cationProducts(sp.sk, (paths.SN1 || 0) / tot, (paths.E1 || 0) / tot, nusSN1.filter(([n]) => n), sub, notes);
      for (const [kk, v] of Object.entries(sub)) addTo(out, kk, v * tot);
    }
    return { rate, out, mech: mechLabel(paths), notes };
  }

  // ---- フラスコ全体を 1 ターン反応させる ------------------------
  // c = { reagent, solvent, temp, humid, ag, crown }
  function react(flask, c) {
    const next = {};
    const report = [];
    for (const [k, amt] of Object.entries(flask)) {
      if (amt <= 0.05) continue;
      const o = outcomeFor(k, c);
      const rate = Math.min(1, o.rate);
      const conv = amt * rate;
      addTo(next, k, amt - conv);
      const prods = [];
      for (const [pk, f] of Object.entries(o.out)) { addTo(next, pk, conv * f); prods.push([pk, conv * f]); }
      report.push({ from: k, amount: amt, converted: conv, mech: o.mech, products: prods, notes: [...new Set(o.notes)] });
    }
    for (const k of Object.keys(next)) if (next[k] < 0.05) delete next[k];
    return { flask: next, report };
  }

  return { SKELETONS, ALKENES, GROUPS, REAGENTS, SOLVENTS, TEMPS, key, parse, invert, describe, isReactive, react, outcomeFor };
})();
