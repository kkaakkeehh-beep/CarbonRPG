// =============================================================
// data.js — 仲間・敵・アイテム・レベル
// =============================================================
const GameData = (() => {

  // カーボの 4 本の手に結合する仲間。rank は CIP 順位づけ用（原子番号、同じなら次の数字）。
  // skill.lv はレベル 1〜3 の効果。v = 効果の大きさ、uses = 1 バトルで使える回数。
  // レベルアップのたびに、プレイヤーが技を 1 つ選んで強化する。
  const COMPANIONS = [
    { id: 'oxy',  name: 'オキシ', atom: 'O', group: 'OH',    rank: [8, 1],  color: '#ff7b72', role: 'しっかり者の姉貴分',
      skill: { id: 'heal', name: '水和', lv: [
        { v: 12, uses: 1, desc: 'HP を 12 回復する' },
        { v: 18, uses: 1, desc: 'HP を 18 回復する' },
        { v: 24, uses: 2, desc: 'HP を 24 回復する（1 バトル 2 回）' }] },
      bond: '「よろしくね。強い塩基は諸刃の剣。使いどころは私が教えてあげる」' },
    { id: 'azy',  name: 'アジー', atom: 'N', group: 'N₃',    rank: [7, 0],  color: '#79c0ff', role: '寡黙な剣士',
      skill: { id: 'power', name: '背面攻撃', lv: [
        { v: 1.5, uses: 1, desc: '次に正解したときのダメージ +50%' },
        { v: 1.8, uses: 1, desc: '次に正解したときのダメージ +80%' },
        { v: 2.0, uses: 2, desc: '次に正解したときのダメージ 2 倍（1 バトル 2 回）' }] },
      bond: '「……背中は任せろ。背面攻撃なら、誰にも負けない」' },
    { id: 'thio', name: 'チオ',   atom: 'S', group: 'SMe',   rank: [16, 0], color: '#f2cc60', role: 'お調子者の盗賊',
      skill: { id: 'stink', name: '悪臭', lv: [
        { v: 3, uses: 1, desc: 'このバトル中、敵の攻撃力 −3' },
        { v: 4, uses: 1, desc: 'このバトル中、敵の攻撃力 −4' },
        { v: 6, uses: 1, desc: 'このバトル中、敵の攻撃力 −6' }] },
      bond: '「臭いって言ったら結合切るからな。……冗談だよ、よろしく！」' },
    { id: 'iodo', name: 'ヨード', atom: 'I', group: 'I',     rank: [53, 0], color: '#d2a8ff', role: '掴みどころのない吟遊詩人',
      skill: { id: 'fifty', name: '脱離', lv: [
        { v: 2, uses: 1, desc: '間違いの選択肢を 2 つ消す' },
        { v: 2, uses: 2, desc: '間違いの選択肢を 2 つ消す（1 バトル 2 回）' },
        { v: 2, uses: 3, desc: '間違いの選択肢を 2 つ消す（1 バトル 3 回）' }] },
      bond: '「入るのも出ていくのも得意なんだ。でも、君の手は離さないよ」' },
    { id: 'phos', name: 'フォス', atom: 'P', group: 'PPh₂',  rank: [15, 0], color: '#ffa657', role: '物知りの賢者',
      skill: { id: 'time', name: '熟考', lv: [
        { v: 60, uses: 1, desc: 'この問題の制限時間 +60 秒' },
        { v: 90, uses: 1, desc: 'この問題の制限時間 +90 秒' },
        { v: 120, uses: 2, desc: 'この問題の制限時間 +120 秒（1 バトル 2 回）' }] },
      bond: '「ほう、良い炭素だ。わしは酸素に目がなくてな。ついでに知識もある」' },
    { id: 'buto', name: 'ブトキ', atom: 'O', group: 'Ot-Bu', rank: [8, 2],  color: '#e06c75', role: 'かさ高き重騎士',
      skill: { id: 'guard', name: '立体障害', lv: [
        { v: 0, uses: 1, desc: '次に間違えたときのダメージを 0 にする' },
        { v: 0, uses: 2, desc: '次に間違えたときのダメージを 0 にする（1 バトル 2 回）' },
        { v: 0, uses: 3, desc: '次に間違えたときのダメージを 0 にする（1 バトル 3 回）' }] },
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
