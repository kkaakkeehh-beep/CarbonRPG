// =============================================================
// data.js — カード・仲間・戦闘のデータ
// =============================================================
const GameData = (() => {

  // type: reagent（フラスコに 1 枚）/ support（何枚でも）/ action（即時発動）
  const CARDS = {
    NaN3:      { name: 'NaN₃', full: 'アジ化ナトリウム', type: 'reagent', cost: 1, tag: '求核剤', desc: '強い求核剤・弱い塩基。', flavor: '重金属や酸と混ぜるな。' },
    NaI:       { name: 'NaI', full: 'ヨウ化ナトリウム', type: 'reagent', cost: 1, tag: '求核剤', desc: '強い求核剤・弱い塩基。アセトン中なら NaBr が沈殿する。', flavor: 'Finkelstein の十八番。' },
    NaSMe:     { name: 'NaSMe', full: 'ナトリウムチオメトキシド', type: 'reagent', cost: 1, tag: '求核剤', desc: '強い求核剤・弱い塩基。', flavor: '隣の研究室から苦情が来る。' },
    AcONa:     { name: 'AcONa', full: '酢酸ナトリウム', type: 'reagent', cost: 1, tag: '求核剤', desc: '求核性はほどほど、塩基性は弱い。', flavor: '地味だが裏切らない。' },
    NaCN:      { name: 'NaCN', full: 'シアン化ナトリウム', type: 'reagent', cost: 1, tag: '求核剤', desc: '強い求核剤。第三級には塩基として働く。', flavor: '炭素鎖を 1 つ伸ばす。取り扱い厳重注意。' },
    NaOH:      { name: 'NaOH', full: '水酸化ナトリウム', type: 'reagent', cost: 1, tag: '強塩基', desc: '強い求核剤・強い塩基。エステルを加水分解する。', flavor: 'なんでも溶かしそうな顔をしている。' },
    NaOEt:     { name: 'NaOEt', full: 'ナトリウムエトキシド', type: 'reagent', cost: 1, tag: '強塩基', desc: '強い求核剤・強い塩基。', flavor: 'Williamson 合成の相棒。' },
    tBuOK:     { name: 't-BuOK', full: 'カリウム tert-ブトキシド', type: 'reagent', cost: 1, tag: 'かさ高い塩基', desc: 'かさ高い強塩基。求核性は低い。', flavor: '大きすぎて炭素に近づけない。' },
    HBr:       { name: 'HBr', full: '臭化水素酸', type: 'reagent', cost: 1, tag: '酸', desc: 'OH をプロトン化して脱離させる。アルケンには Markovnikov 付加。', flavor: '手っ取り早いが、カチオンが出る。' },
    H2SO4:     { name: 'H₂SO₄', full: '濃硫酸', type: 'reagent', cost: 1, tag: '酸', desc: '加熱するとアルコールを脱水する（E1）。', flavor: '脱水の王。' },
    TsCl:      { name: 'TsCl / py', full: '塩化トシル / ピリジン', type: 'reagent', cost: 1, tag: '活性化', desc: 'OH → OTs。C–O 結合は切れないので立体保持。', flavor: 'スルホニルの技。' },
    PBr3:      { name: 'PBr₃', full: '三臭化リン', type: 'reagent', cost: 1, tag: '活性化', desc: '1°/2° の OH → Br。SN2 なので立体反転。転位しない。', flavor: '無水条件で。' },
    Mitsunobu: { name: '光延反応', full: 'PPh₃ / DIAD / DPPA', type: 'reagent', cost: 2, tag: '奥義', rare: true, desc: '1°/2° の OH → N₃ を一段階で。立体反転。', flavor: '日本が誇る名反応。' },
    Ag:        { name: 'AgNO₃', full: '硝酸銀', type: 'support', cost: 1, tag: '補助', desc: 'Ag⁺ がハロゲン化物イオンを引き抜き、SN1/E1 を促進。', flavor: 'AgBr が沈殿する。' },
    crown:     { name: '18-クラウン-6', full: '18-クラウン-6', type: 'support', cost: 1, tag: '補助', desc: 'K⁺ を包み込み、アニオンを“裸”にする。', flavor: 'Na⁺ には少し大きい。' },
    MS4A:      { name: 'MS 4Å', full: 'モレキュラーシーブ 4Å', type: 'support', cost: 1, tag: '補助', desc: 'このターンの湿気を打ち消す。', flavor: '活性化済み。' },
    ice:       { name: '氷浴', full: '氷浴', type: 'support', cost: 1, tag: '補助', desc: 'このターンの加熱の呪いを打ち消す。', flavor: '氷を砕く音が研究室に響く。' },
    lit:       { name: '文献調査', full: '文献調査', type: 'action', cost: 1, tag: '行動', desc: 'カードを 2 枚引く。', flavor: 'SciFinder を開く。' },
    allnighter:{ name: '徹夜', full: '徹夜', type: 'action', cost: 0, tag: '行動', desc: 'エネルギー +2。HP −4。', flavor: '研究室の床は冷たい。' },
  };

  // カーボ（炭素）の 4 本の手に結合する仲間。
  // rank は CIP 順位づけ用（原子番号、同じなら次の数字で比較）。
  const COMPANIONS = [
    { id: 'oxy',  name: 'オキシ', atom: 'O', group: 'OH',    rank: [8, 1],  role: '酸素の魔導士', cards: ['NaOH', 'NaOEt', 'AcONa'], line: '強い塩基は諸刃の剣よ。使いどころを見極めて。' },
    { id: 'azy',  name: 'アジー', atom: 'N', group: 'N₃',    rank: [7, 0],  role: '窒素の剣士',   cards: ['NaN3', 'NaN3', 'NaCN'],   line: '背面から一突き。それが SN2 だ。' },
    { id: 'thio', name: 'チオ',   atom: 'S', group: 'SMe',   rank: [16, 0], role: '硫黄の盗賊',   cards: ['NaSMe', 'NaSMe', 'TsCl'], line: '臭いって言うなよ。求核性は一級品だぜ。' },
    { id: 'iodo', name: 'ヨード', atom: 'I', group: 'I',     rank: [53, 0], role: 'ヨウ素の吟遊詩人', cards: ['NaI', 'NaI', 'Ag'],   line: '僕は入るのも出ていくのも得意なんだ。' },
    { id: 'phos', name: 'フォス', atom: 'P', group: 'PPh₂',  rank: [15, 0], role: 'リンの賢者',   cards: ['PBr3', 'PBr3', 'Mitsunobu'], line: '酸素と結びつく力なら誰にも負けぬ。' },
    { id: 'buto', name: 'ブトキ', atom: 'O', group: 'Ot-Bu', rank: [8, 2],  role: 'かさ高き重騎士', cards: ['tBuOK', 'tBuOK', 'crown'], line: '……（大きすぎて誰にも近づけない）' },
  ];

  const BASIC_DECK = ['lit', 'allnighter', 'HBr', 'H2SO4', 'ice', 'MS4A'];

  // sk: 目的物の骨格。別の骨格へ転位したものは「もう戻れない副生成物」とみなす
  // 敵の行動: atk = アルキル化攻撃（HP ダメージ）/ humid = 次ターン湿気 / heat = 次ターン強制加熱
  const BATTLES = [
    {
      id: 'b1', monster: 'ブロモ・スライム', lv: 1, sk: 'nBu', start: { 'nBu:Br:-': 100 },
      intro: 'ぷるぷる震える第一級ハロゲン化アルキルが現れた！',
      order: 'こやつを置換生成物に変えておくれ。アルケンにしてはならんぞ。',
      targetLabel: '1-ブチル–Nu（置換生成物ならなんでも）',
      isTarget: k => k.startsWith('nBu:') && !k.startsWith('nBu:Br:'),
      intents: [{ t: 'atk', v: 3 }, { t: 'atk', v: 3 }, { t: 'humid' }],
      hint: '第一級は背面が空いている。素直な求核剤を。',
      keys: ['NaN3', 'NaSMe', 'NaI', 'AcONa', 'NaOEt'],
    },
    {
      id: 'b2', monster: 'キラル・ゴブリン', lv: 3, sk: 'sBu', start: { 'sBu:Br:R': 100 },
      intro: '右手に臭素を握ったゴブリンが立ちはだかる！',
      order: '立体を反転させて置換するのじゃ。(S) 体の置換生成物がほしい。',
      targetLabel: '(S)-2-ブチル–Nu（立体反転した置換生成物）',
      isTarget: k => k.startsWith('sBu:') && k.endsWith(':S') && !k.startsWith('sBu:Br:'),
      intents: [{ t: 'atk', v: 4 }, { t: 'humid' }, { t: 'atk', v: 4 }],
      hint: '第二級に強塩基は禁物。カチオンを出すとラセミ化する。',
      keys: ['NaN3', 'NaSMe', 'NaI', 'AcONa'],
    },
    {
      id: 'b3', monster: 'アミル・オーク', lv: 5, sk: 'tAm', start: { 'tAm:Br:-': 100 },
      intro: '枝分かれした筋肉の塊、第三級のオークだ！',
      order: '二重結合を「端」に作ってほしい。2-メチル-1-ブテンじゃ。',
      targetLabel: '2-メチル-1-ブテン（Hofmann 生成物）',
      targetSmiles: 'C=C(C)CC',
      isTarget: k => k === 'alk:2m1b',
      intents: [{ t: 'atk', v: 5 }, { t: 'heat' }, { t: 'atk', v: 5 }],
      hint: '普通の塩基はより置換されたアルケンを作る。',
      keys: ['tBuOK'],
    },
    {
      id: 'b4', monster: 'ターシャリー・トロール', lv: 6, sk: 'tBu', start: { 'tBu:Br:-': 100 },
      intro: '丸々と太った t-BuBr が道をふさいでいる！',
      order: 'メチル tert-ブチルエーテル（MTBE）を作ってくれんか。',
      targetLabel: '2-メトキシ-2-メチルプロパン（MTBE）',
      targetSmiles: 'CC(C)(C)OC',
      isTarget: k => k === 'tBu:OMe:-',
      intents: [{ t: 'heat' }, { t: 'atk', v: 5 }, { t: 'atk', v: 6 }],
      hint: '足せばよいとは限らない。何も足さないという選択肢も。',
      keys: ['ice', 'Ag'],
    },
    {
      id: 'b5', monster: 'アルコール・ゴーレム', lv: 8, sk: 'sBu', start: { 'sBu:OH:R': 100 },
      intro: '水素結合の鎧をまとったゴーレムが目を覚ました！',
      order: '(S)-2-アジドブタンを頼む。OH はそのままでは抜けんぞ。',
      targetLabel: '(S)-2-アジドブタン',
      targetSmiles: 'C[C@H](N=[N+]=[N-])CC',
      isTarget: k => k === 'sBu:N3:S',
      intents: [{ t: 'atk', v: 5 }, { t: 'humid' }, { t: 'atk', v: 6 }, { t: 'heat' }],
      hint: '活性化で立体はどうなる？ 置換で立体はどうなる？',
      keys: ['TsCl', 'NaN3', 'Mitsunobu'],
    },
    {
      id: 'b6', monster: '転位竜メーヤワイン', lv: 12, boss: true, sk: 'm2b', start: { 'm2b:OH:R': 100 },
      intro: 'カルボカチオンを見せれば最後、ヒドリドを移して第三級に化ける竜が現れた！',
      order: '(R)-2-アジド-3-メチルブタンじゃ。立体はそのまま、骨格も崩すな。',
      targetLabel: '(R)-2-アジド-3-メチルブタン（立体保持・転位なし）',
      targetSmiles: 'C[C@@H](N=[N+]=[N-])C(C)C',
      isTarget: k => k === 'm2b:N3:R',
      intents: [{ t: 'atk', v: 6 }, { t: 'heat' }, { t: 'humid' }, { t: 'atk', v: 7 }],
      hint: '反転を 2 回すれば保持。カチオンは厳禁。',
      keys: ['PBr3', 'NaN3', 'NaI', 'TsCl'],
    },
  ];

  const RANKS = [
    [90, 'S', 'Nature の表紙を飾った！'],
    [80, 'A', 'JACS に採択された！'],
    [65, 'B', 'Angew に採択された！'],
    [50, 'C', 'Chem. Lett. に採択された。'],
    [30, 'D', '学会のポスター発表で終わった……'],
    [0,  'E', '「再現性がとれないね」と先生に言われた……'],
  ];

  return { CARDS, COMPANIONS, BASIC_DECK, BATTLES, RANKS };
})();
