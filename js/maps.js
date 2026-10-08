// =============================================================
// maps.js — マップとイベント
//
// タイル: . 草 / g 草むら / , 道 / T 木 / ~ 水 / = 橋 / f 花 / m 霧 / M 濃い霧
//         r 岩 / # 壁 / _ 床 / B ベッド / S 棚 / F ドラフト / W 建物の壁 / R 屋根
//         h 小屋の壁 / E 小屋の入口 / D ドア
// イベント:
//   sprite があれば人や物として描く。on: 'bump'（ぶつかる・話しかける）/ 'step'（踏む）
//   when(f): 表示・発動の条件（f はフラグ）
//   scene: 台本の ID（関数なら f を受け取って ID を返す）/ warp / chest / text
// =============================================================
const Maps = (() => {
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
        { x: 5, y: 3, sprite: 'prof', on: 'bump', scene: f => f.elder ? 'lab_prof2' : 'lab_prof' },
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
        'T.........,,,,,,,....T',
        'T..~~~....,,.........T',
        'T..~~~....,,...ggg...T',
        'T.........,,.........T',
        'T...RRRR..,,.........T',
        'T...WWWW..,,.........T',
        'T...WDWW..,,.........T',
        'T....,,,,,,,.........T',
        'T....................T',
        'TTTTTTTTTTTTTTTTTTTTTT',
      ],
      events: [
        { x: 16, y: 4, sprite: 'elder', on: 'bump', scene: f => f.elder ? 'elder_after' : 'elder' },
        { x: 5, y: 11, on: 'step', warp: { map: 'lab', x: 5, y: 7, dir: 'up' } },
        { x: 10, y: 0, on: 'step', gate: true },
        { x: 11, y: 0, on: 'step', gate: true },
        { x: 13, y: 1, sprite: 'guard', on: 'bump', scene: f => f.elder ? 'guard2' : 'guard' },
        { x: 6, y: 6, sprite: 'water', on: 'bump', scene: 'water' },
        { x: 8, y: 8, sprite: 'methane', on: 'bump', scene: 'methane' },
        { x: 3, y: 12, sprite: 'shop', on: 'bump', shop: true },
        { x: 3, y: 11, sprite: 'sign', on: 'bump', text: '購買部　コーヒー・エナジードリンク・参考書あります' },
      ],
    },

    forest: {
      name: '求核の森',
      encounters: true,
      grid: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
        'TTTTTTTTTTTmmmmmmmmTTTTTTTTTTT',
        'TTTTTTTTTTmmmmmmmmmmTTTTTTTTTT',
        'T.....fffTmmmmmmmmmmT..ggggg.T',
        'T..ffffffTmmmmmmmmmmT..ggggg.T',
        'T..ffffffTTmmmmmmmmTT........T',
        'T...ffff..TTmmmmmmTT...ggg...T',
        'T.........TTTmmmmTTT...ggg...T',
        'T..ggg.....TTMMMMTT..........T',
        'T..ggg......,,,,,,,,,........T',
        'T...........,TTTT..,..TTT....T',
        'TTT...ggg...,TTTT..,..TTT.r..T',
        'T~~~~~~~~~~~=~~~~~~=~~~~~~~~~T',
        'T...........,.......,........T',
        'T..gggg.....,..ggg..,...gggg.T',
        'T..gggg.....,..ggg..,...gggg.T',
        'T...........,,,,,,,,,........T',
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
      passable: { M: f => f.duo },
      blockedText: { M: f => f.sisters ? '霧が濃くて進めない。' : '霧が濃くて進めない。西の花畑のほうから、すすり泣く声が聞こえる……' },
      events: [
        { x: 14, y: 23, on: 'step', warp: { map: 'town', x: 10, y: 1, dir: 'down' } },
        { x: 15, y: 23, on: 'step', warp: { map: 'town', x: 11, y: 1, dir: 'down' } },
        { x: 16, y: 23, on: 'step', warp: { map: 'town', x: 11, y: 1, dir: 'down' } },
        { x: 13, y: 18, sprite: 'sign', on: 'bump', text: '↑ 霧の奥　　← 花畑' },
        { x: 5, y: 4, sprite: 'carvoneR', on: 'bump', scene: f => f.sisters ? 'sisters_after' : 'sisters' },
        { x: 6, y: 4, sprite: 'carvoneS', on: 'bump', scene: f => f.sisters ? 'sisters_after' : 'sisters' },
        { x: 25, y: 9, sprite: 'victim', on: 'bump', scene: 'victim' },
        { x: 5, y: 13, sprite: 'lumber', on: 'bump', scene: 'lumber' },
        { x: 25, y: 5, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'chest1' } },
        { x: 9, y: 15, sprite: 'chest', on: 'bump', chest: { item: 'book', flag: 'chest2' } },
        { x: 27, y: 18, sprite: 'chest', on: 'bump', chest: { item: 'coffee', flag: 'chest3' } },
        { x: 14, y: 8, sprite: 'meso', on: 'bump', when: f => f.sisters && !f.duo, scene: 'duo' },
        { x: 15, y: 8, sprite: 'meso', on: 'bump', when: f => f.sisters && !f.duo, scene: 'duo', mirror: true },
        { x: 14, y: 3, sprite: 'cation', on: 'bump', when: f => !f.boss, scene: 'boss' },
      ],
    },
  };

  return { MAPS };
})();
