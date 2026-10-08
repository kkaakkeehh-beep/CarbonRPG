// =============================================================
// maps.js — マップとイベント
//
// タイル: . 草 / g 草むら / , 道 / T 木 / ~ 水 / = 橋 / f 花 / m 霧 / M 濃い霧
//         r 岩 / # 壁 / _ 床 / B ベッド / S 棚 / F ドラフト / W 建物の壁 / R 屋根
//         h 小屋の壁 / E 小屋の入口 / D ドア
//         （第 2 章）o 石畳 / s 砂浜 / p 桟橋 / O 噴水 / K 屋台 / G 倉庫街の門 / w 倉庫の床 / X 木箱
//         L 灯台 / > 下り階段 / < 上り階段 / c じゅうたん / k 机 / d 土の床 / q 石の床 / | 手すり / Y 灯台の灯
// イベント:
//   sprite があれば人や物として描く。on: 'bump'（ぶつかる・話しかける）/ 'step'（踏む）
//   when(f): 表示・発動の条件（f はフラグ）
//   scene: 台本の ID（関数なら f を受け取って ID を返す）/ warp / chest / text
// =============================================================
const Maps = (() => {
  // 子どもたちは、ケトー卿の居場所をそれとなく教えてくれる
  const kidsScene = f => f.c2_reveal ? 'c2_kids2' : f.c2_chase ? 'c2_kids_home' : (f.c2_lens && !f.c2_pier) ? 'c2_kids_pier' : 'c2_kids';
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
        { x: 16, y: 4, sprite: 'elder', on: 'bump', scene: f => f.elder ? 'elder_after' : 'elder' },
        { x: 5, y: 11, on: 'step', warp: { map: 'lab', x: 5, y: 7, dir: 'up' } },
        { x: 10, y: 0, on: 'step', gate: true },
        { x: 11, y: 0, on: 'step', gate: true },
        { x: 13, y: 1, sprite: 'guard', on: 'bump', scene: f => f.elder ? 'guard2' : 'guard' },
        { x: 6, y: 6, sprite: 'water', on: 'bump', scene: 'water' },
        { x: 8, y: 8, sprite: 'methane', on: 'bump', scene: 'methane' },
        { x: 3, y: 12, sprite: 'shop', on: 'bump', shop: true },
        { x: 21, y: 5, on: 'step', eastGate: true },
        { x: 3, y: 11, sprite: 'sign', on: 'bump', text: '購買部　コーヒー・エナジードリンク・参考書あります' },
      ],
    },

    forest: {
      name: '求核の森',
      encounters: { tiles: ['g'], when: f => f.f_entry && !f.boss, enemies: ['meso', 'meso', 'mesoTartaric', 'mesoCis'] },
      grid: [
        'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
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
        { x: 20, y: 3, on: 'bump', scene: f => f.c2_met ? 'c2_inn' : 'c2_inn_first' },
        { x: 12, y: 3, on: 'step', when: f => !f.night, warp: { map: 'mansion', x: 6, y: 7, dir: 'up' } },
        { x: 12, y: 3, on: 'bump', when: f => f.night, text: '屋敷の門は、固く閉ざされている。' },
        { x: 4, y: 3, on: 'bump', scene: f => f.night ? 'c2_orph_night' : f.c2_reveal ? 'c2_director2' : 'c2_director' },
        // 昼の人びと
        { x: 14, y: 7, sprite: 'ketoh', on: 'bump', when: f => !f.night && !f.c2_reveal && !f.c2_chase && !(f.c2_lens && !f.c2_pier), scene: f => f.c2_met ? 'c2_ketoh2' : 'c2_ketoh' },
        { x: 6, y: 15, sprite: 'ketoh', on: 'bump', when: f => !f.night && f.c2_lens && !f.c2_pier, scene: 'c2_pier' },
        { x: 16, y: 10, sprite: 'kidA', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 17, y: 10, sprite: 'kidB', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 6, y: 4, sprite: 'director', on: 'bump', when: f => !f.night, scene: f => f.c2_reveal ? 'c2_director2' : 'c2_director' },
        { x: 2, y: 8, sprite: 'menthone', on: 'bump', when: f => !f.night, scene: f => f.c2_reveal ? 'c2_menthone2' : 'c2_menthone' },
        { x: 4, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && !(f.c2_pier && !f.c2_kidnap), scene: f => f.c2_reveal ? 'c2_methyl2' : 'c2_methyl' },
        { x: 6, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && f.c2_pier && !f.c2_kidnap, scene: 'c2_kidnap' },
        { x: 6, y: 8, sprite: 'granny', on: 'bump', when: f => !f.night && (!f.c2_kidnap || f.c2_rescued), scene: f => f.c2_rescued ? 'c2_granny2' : 'c2_granny' },
        { x: 8, y: 8, sprite: 'twins', on: 'bump', when: f => !f.night, scene: 'c2_twins_day' },
        { x: 12, y: 15, sprite: 'grignard', on: 'bump', when: f => !f.night, scene: 'c2_grignard' },
        { x: 23, y: 20, sprite: 'keeper', on: 'bump', when: f => !f.night && !f.c2_boss, scene: f => (f.c2_clue2 && !f.c2_clue3) ? 'c2_lecture' : 'c2_keeper' },
        { x: 19, y: 4, sprite: 'innkeeper', on: 'bump', scene: f => f.c2_met ? 'c2_inn' : 'c2_inn_first' },
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
        { x: 6, y: 3, sprite: 'ketoh', on: 'bump', when: f => !f.night && f.c2_chase && !f.c2_reveal, scene: 'c2_reveal' },
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
  };

  return { MAPS };
})();
