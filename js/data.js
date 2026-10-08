// =============================================================
// data.js — 仲間・敵・アイテム・レベル
// =============================================================
const GameData = (() => {

  // カーボの 4 本の手に結合する仲間。rank は CIP 順位づけ用（原子番号、同じなら次の数字）。
  // skill.lv はレベル 1〜3 の効果。v = 効果の大きさ、uses = 1 バトルで使える回数。
  // 強化は 1 段階 2 割前後にとどめ、回数は増やさない（強くなりすぎないように）。
  // レベルアップのたびに、プレイヤーが技を 1 つ選んで強化する。
  const COMPANIONS = [
    { id: 'oxy',  name: 'オキシ', atom: 'O', group: 'OH',    rank: [8, 1],  color: '#ff7b72', role: 'しっかり者の姉貴分',
      skill: { id: 'heal', name: '水和', lv: [
        { v: 12, uses: 1, desc: 'HP を 12 回復する' },
        { v: 15, uses: 1, desc: 'HP を 15 回復する' },
        { v: 18, uses: 1, desc: 'HP を 18 回復する' }] },
      bond: '「よろしくね。強い塩基は諸刃の剣。使いどころは私が教えてあげる」' },
    { id: 'azy',  name: 'アジー', atom: 'N', group: 'N₃',    rank: [7, 0],  color: '#79c0ff', role: '寡黙な剣士',
      skill: { id: 'power', name: '背面攻撃', lv: [
        { v: 1.5, uses: 1, desc: '次に正解したときのダメージ +50%' },
        { v: 1.6, uses: 1, desc: '次に正解したときのダメージ +60%' },
        { v: 1.75, uses: 1, desc: '次に正解したときのダメージ +75%' }] },
      bond: '「……背中は任せろ。背面攻撃なら、誰にも負けない」' },
    { id: 'thio', name: 'チオ',   atom: 'S', group: 'SMe',   rank: [16, 0], color: '#f2cc60', role: 'お調子者の盗賊',
      skill: { id: 'stink', name: '悪臭', lv: [
        { v: 3, uses: 1, desc: 'このバトル中、敵の攻撃力 −3' },
        { v: 4, uses: 1, desc: 'このバトル中、敵の攻撃力 −4' },
        { v: 5, uses: 1, desc: 'このバトル中、敵の攻撃力 −5' }] },
      bond: '「臭いって言ったら結合切るからな。……冗談だよ、よろしく！」' },
    { id: 'iodo', name: 'ヨード', atom: 'I', group: 'I',     rank: [53, 0], color: '#d2a8ff', role: '掴みどころのない吟遊詩人',
      skill: { id: 'fifty', name: '脱離', lv: [
        { v: 2, t: 0, uses: 1, desc: '間違いの選択肢を 2 つ消す' },
        { v: 2, t: 15, uses: 1, desc: '間違いの選択肢を 2 つ消し、制限時間 +15 秒' },
        { v: 2, t: 30, uses: 1, desc: '間違いの選択肢を 2 つ消し、制限時間 +30 秒' }] },
      bond: '「入るのも出ていくのも得意なんだ。でも、君の手は離さないよ」' },
    { id: 'phos', name: 'フォス', atom: 'P', group: 'PPh₂',  rank: [15, 0], color: '#ffa657', role: '物知りの賢者',
      skill: { id: 'time', name: '熟考', lv: [
        { v: 60, uses: 1, desc: 'この問題の制限時間 +60 秒' },
        { v: 75, uses: 1, desc: 'この問題の制限時間 +75 秒' },
        { v: 90, uses: 1, desc: 'この問題の制限時間 +90 秒' }] },
      bond: '「ほう、良い炭素だ。わしは酸素に目がなくてな。ついでに知識もある」' },
    { id: 'buto', name: 'ブトキ', atom: 'O', group: 'Ot-Bu', rank: [8, 2],  color: '#e06c75', role: 'かさ高き重騎士',
      skill: { id: 'guard', name: '立体障害', lv: [
        { v: 0, uses: 1, desc: '次に間違えたときのダメージを 0 にする' },
        { v: 1, uses: 1, desc: '次に間違えたときのダメージを 0 にし、このバトル中の被ダメージ −1' },
        { v: 2, uses: 1, desc: '次に間違えたときのダメージを 0 にし、このバトル中の被ダメージ −2' }] },
      bond: '「…………（大きすぎて近づけないが、確かに結合している）」' },
  ];
  const SKILL_MAX = 3;

  // price は購買部での値段（研究費）
  const ITEMS = {
    coffee: { name: 'コーヒー', desc: 'HP を 15 回復する', heal: 15, price: 40 },
    energy: { name: 'エナジードリンク', desc: 'HP を 35 回復する', heal: 35, price: 100 },
    book:   { name: '参考書', desc: 'バトル中に使うと、間違いの選択肢を 1 つ消す', price: 60 },
  };
  const SHOP = ['coffee', 'energy', 'book'];

  // レベル: 次のレベルまでに必要な経験値と、上がったときの最大 HP の伸び
  const expToNext = lv => lv * 10 + 5;
  const HP_PER_LV = 4;

  // 敵。atk = 不正解のときに受けるダメージ、exp / money = 倒したときの報酬
  const ENEMIES = {
    tutorial: {
      name: 'メソ団員', sprite: 'meso', hp: 20, atk: 4, exp: 5, money: 30,
      start: '対称！ 対称！ この問いに答えられるか！',
      hit: ['ぐっ……仮面にひびが……！'], miss: ['ははは！ 立体がぶれているぞ！'],
      win: 'お、覚えていろ……カチオーネ様が黙っていないぞ！',
    },
    meso: {
      name: 'メソ団員', sprite: 'meso', hp: 20, atk: 4, exp: 6, money: 40,
      start: '対称！ 対称！',
      hit: ['ぐあっ！', '鏡面がゆがむ……！'], miss: ['利き手など捨ててしまえ！', '対称の勝利だ！'],
      win: '対称……ばんざい……',
    },
    mesoTartaric: {
      name: 'メソ酒石酸の団員', sprite: 'meso', hp: 24, atk: 5, exp: 8, money: 50,
      start: '我が身に不斉炭素は 2 つ。されど旋光度はゼロ！',
      hit: ['内なる鏡が……！'], miss: ['見よ、この完璧な対称面を！'],
      win: '旋光……しない……',
    },
    mesoCis: {
      name: 'cis-ジメチル団員', sprite: 'meso', hp: 24, atk: 5, exp: 8, money: 50,
      start: 'いす形が反転しても、我らはアキラル！',
      hit: ['環が……ねじれる……！'], miss: ['速い環反転には勝てまい！'],
      win: 'ジアキシアルは……つらい……',
    },
    duo: {
      name: 'メソ団員 2 人組', sprite: 'mesoDuo', hp: 40, atk: 6, exp: 15, money: 100,
      start: '我らは 2 人で 1 つ！ 分子内に鏡面あり！',
      hit: ['くっ、鏡面がゆがむ！', '称対！ ……あ、間違えた！'], miss: ['対称性の勝利だ！', '称対！ 称対！'],
      win: 'カチオーネ様……あとはお任せします……',
    },
    cation: {
      name: 'カチオーネ', sprite: 'cation', hp: 90, atk: 8, exp: 40, money: 300, boss: true,
      start: 'さあ、私の空の p 軌道に飛び込んでいらっしゃい',
      hit: ['っ……電子を押しつけないで！', 'やるじゃない', 'ふふ、それくらいはね'],
      miss: ['ほら、立体がほどけていく', '迷ったわね？ 平面は迷いを許すのよ'],
      win: '求核剤が……来る……！',
      phases: [
        { at: 0.66, text: 'カチオーネ「……少しは骨があるのね。いいわ、本気を見せてあげる」' },
        { at: 0.5, text: '（隣の炭素から水素が滑り込む）\nカチオーネ「1,2-ヒドリドシフト！ 第二級の私は、仮の姿……。第三級になった私は、超共役で守られているの！」', transform: 'cation2', atkUp: 2, name: 'カチオーネ（第三級）' },
        { at: 0.33, text: 'カチオーネ「どうして……どうしてそこまで、自分の手にこだわるの？」\nカーボ「この手で、仲間と結んだからだ」' },
      ],
    },
    // ---------------- 第 2 章 ----------------
    nightMeso: {
      name: '夜警のメソ団員', sprite: 'meso', hp: 26, atk: 6, exp: 9, money: 60, ch: 2,
      start: '夜の倉庫街に何の用だ！ 対称！',
      hit: ['ぐっ……月明かりがまぶしい！'], miss: ['夜はエノールの時間だ！'],
      win: '夜警の……任務が……',
    },
    mesoAldol: {
      name: 'アルドール団員', sprite: 'mesoDuo', hp: 28, atk: 6, exp: 10, money: 60, ch: 2,
      start: '2 人そろえば、β-ヒドロキシカルボニル！',
      hit: ['くっ、脱水されそうだ！', '逆アルドールで分かれてしまう！'], miss: ['C–C 結合の勝利だ！'],
      win: '縮合……できなかった……',
    },
    cellarMeso: {
      name: '倉庫番のメソ団員', sprite: 'meso', hp: 26, atk: 6, exp: 9, money: 60, ch: 2,
      start: '地下は湿気が多いぞ。水和されてしまえ！',
      hit: ['うっ、カビ臭い……！'], miss: ['ここは我らの縄張りだ！'],
      win: '湿気……に……やられた……',
    },
    iodoform: {
      name: 'ヨードホルム三兄弟', sprite: 'iodoTrio', hp: 100, atk: 7, exp: 30, money: 180, ch: 2, mid: true,
      tag: 'enol', topics: ['ハロホルム', 'α-ハロゲン化', 'エノラート', '互変異性'],
      start: '3 つのヨウ素で 1 つの心！',
      hit: ['ぐあっ、結晶にひびが！', 'し、昇華してしまう！'], miss: ['黄色い沈殿の勝利だ！', 'この消毒薬の匂いをかげ！'],
      win: 'お、覚えてろ……エノラス様に言いつけてやる……！',
    },
    enolas: {
      name: 'エノラス', sprite: 'ketohNoMono', hp: 120, atk: 9, exp: 60, money: 400, ch: 2, boss: true,
      start: 'さあ、どっちの顔で相手をしてやろうか',
      win: '……そうか。お前は、どっちつかずじゃないんだな',
      // 数問ごとにケト形とエノール形が入れ替わり、出題分野も変わる
      switchEvery: 3,
      forms: {
        keto: { name: 'エノラス（ケト形）', sprite: 'ketohNoMono', tag: 'keto',
          hit: ['くっ……カルボニルを読まれたか', '紳士的に、とはいかないな'],
          miss: ['立体なんて、プロトン 1 つで揺らぐのさ', '迷ったな？ 平衡は迷いを許すぜ'],
          into: 'プロトンが戻る……。少し、紳士的にいこうか' },
        enol: { name: 'エノラス（エノール形）', sprite: 'thief', tag: 'enol',
          hit: ['やるじゃないか、α 位を見切るとは', 'ちっ、平面に逃げきれない'],
          miss: ['立体なんて、プロトン 1 つで揺らぐのさ', '夜の顔は手ごわいだろう？'],
          into: 'プロトンが動く……！ 夜の顔を見せてやる' },
      },
      phases: [
        { at: 0.5, text: 'エノラス「……お前、なんでそこまで、自分の向きにこだわる」\nカーボ「仲間と結んだ手だからだ。この向きで、結んだんだ」' },
        { at: 0.2, text: 'エノラス「……ガキどもが、言ってたよ。夜の俺も、昼の俺も、どっちも好きだってな」' },
      ],
    },
    // 復習ノートの練習相手（ダメージも報酬もない）
    practice: {
      name: '分子模型くん', sprite: 'model', hp: 10, atk: 0, exp: 0, money: 0, practice: true,
      start: 'ノートの問題で練習しよう！ 間違えても大丈夫だよ。',
      hit: ['その調子！', 'よく覚えてたね！'], miss: ['解説をよく読んでみよう', 'ここは引っかかりやすいよね'],
      win: 'おつかれさま！ 克服した問題はノートから消しておいたよ。',
    },
  };

  const RANDOM_ENEMIES = ['meso', 'meso', 'mesoTartaric', 'mesoCis'];

  return { COMPANIONS, SKILL_MAX, ITEMS, SHOP, ENEMIES, RANDOM_ENEMIES, expToNext, HP_PER_LV };
})();
