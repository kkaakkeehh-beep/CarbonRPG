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
  // 子どもたちは、ケトー卿の居場所をそれとなく教えてくれる
  const kidsScene = f => f.c2_reveal ? 'c2_kids2' : f.c2_chase ? 'c2_kids_home' : (f.c2_lens && !f.c2_pier) ? 'c2_kids_pier' : 'c2_kids';

  // 第 3 章：王国の 6 本の柱。話が進むと 1 本ずつ消え、戦いのあとで戻る
  const pillarsLit = f => f.c3_boss ? 6 : f.c3_lastpillar ? 1 : 6 - [f.c3_mid, f.c3_king2, f.c3_tempo].filter(Boolean).length;
  const pillar = n => f => n < pillarsLit(f) ? 'pillarOn' : 'pillarOff';
  const pillarText = n => f => f.c3_boss ? '柱に光が戻っている。表面には、塩素の小さな傷が残っている。'
    : n < pillarsLit(f) ? '王国を守る柱だ。π 電子の光が、柱のまわりを静かに巡っている。'
    : ['柱の光が消えている。', '表面に、塩素がびっしりと付加している……。'];
  // 家督争い：アニリン家に勝ったあとで負けても、メタ伯爵からやり直せる
  const familyScene = f => f.c3_emblem ? (f.c3_boss ? 'c3_family_end' : 'c3_family_after') : f.c3_duel1 ? 'c3_family2' : 'c3_family';
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
        { x: 5, y: 3, sprite: 'prof', on: 'bump', scene: f => f.clear ? 'lab_prof3' : f.elder ? 'lab_prof2' : 'lab_prof' },
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
        { x: 16, y: 4, sprite: f => f.c3_lastpillar ? 'elderCl' : 'elder', on: 'bump', when: f => !f.ch3 || f.c3_boss, scene: f => f.c3_boss ? 'elder_c3' : f.boss ? 'elder_after2' : f.elder ? 'elder_after' : 'elder' },
        { x: 5, y: 11, on: 'step', warp: { map: 'lab', x: 5, y: 7, dir: 'up' } },
        { x: 10, y: 0, on: 'step', gate: true },
        { x: 11, y: 0, on: 'step', gate: true },
        { x: 13, y: 1, sprite: 'guard', on: 'bump', scene: f => f.boss ? 'guard3' : f.elder ? 'guard2' : 'guard' },
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
        { x: 5, y: 4, sprite: 'carvoneR', on: 'bump', scene: f => f.boss ? 'sisters_after2' : f.sisters ? 'sisters_after' : 'sisters' },
        { x: 6, y: 4, sprite: 'carvoneS', on: 'bump', scene: f => f.boss ? 'sisters_after2' : f.sisters ? 'sisters_after' : 'sisters' },
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
        { x: 14, y: 7, sprite: f => f.c2_lens ? 'ketohNoMono' : 'ketoh', on: 'bump', when: f => !f.night && !f.c2_reveal && !f.c2_chase && !(f.c2_lens && !f.c2_pier), scene: f => f.c2_met ? 'c2_ketoh2' : 'c2_ketoh' },
        { x: 6, y: 15, sprite: 'ketohNoMono', on: 'bump', when: f => !f.night && f.c2_lens && !f.c2_pier, scene: 'c2_pier' },
        { x: 16, y: 10, sprite: 'kidA', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 17, y: 10, sprite: 'kidB', on: 'bump', when: f => !f.night, scene: kidsScene },
        { x: 6, y: 4, sprite: 'director', on: 'bump', when: f => !f.night, scene: f => f.c2_reveal ? 'c2_director2' : 'c2_director' },
        { x: 2, y: 8, sprite: 'menthone', on: 'bump', when: f => !f.night, scene: f => f.c2_reveal ? 'c2_menthone2' : 'c2_menthone' },
        { x: 4, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && !(f.c2_pier && !f.c2_kidnap), scene: f => f.c2_reveal ? 'c2_methyl2' : 'c2_methyl' },
        { x: 6, y: 8, sprite: 'methylBoss', on: 'bump', when: f => !f.night && f.c2_pier && !f.c2_kidnap, scene: 'c2_kidnap' },
        { x: 6, y: 8, sprite: 'granny', on: 'bump', when: f => !f.night && (!f.c2_kidnap || f.c2_rescued), scene: f => f.c2_rescued ? 'c2_granny2' : 'c2_granny' },
        { x: 8, y: 8, sprite: 'twins', on: 'bump', when: f => !f.night, scene: 'c2_twins_day' },
        { x: 12, y: 15, sprite: 'grignard', on: 'bump', when: f => !f.night && !f.ch3, scene: f => f.c2_boss ? 'c3_board' : 'c2_grignard' },
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
  };

  return { MAPS, pillarsLit };
})();
