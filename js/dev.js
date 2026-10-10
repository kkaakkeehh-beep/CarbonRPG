// =============================================================
// dev.js — 開発者用：章を選んで始める
// タイトルのロゴを、2 秒以内に 5 回タップ（クリック）すると開く
//
// flags: その章のあいだに立つ物語のフラグ（自動の通しプレイで、章のクリア時に記録したもの）
//        第 N 章から始めるときは、第 1〜N−1 章のフラグを立てる
// lv / money: その章をクリアしたときのレベルと研究費（同じ通しプレイ。学部後半・正答率 75%）
// =============================================================
const DevStart = {
  flags: {
    1: ['started', 'elder', 'f_entry', 'sisters', 'duo', 'boss', 'clear'],
    2: ['ch2', 'c2_arrive', 'c2_met', 'c2_lens', 'c2_pier', 'c2_kidnap', 'c2_rescued', 'c2_clue2', 'c2_clue3', 'c2_chase', 'c2_reveal', 'c2_top', 'c2_boss', 'clear2'],
    3: ['ch3', 'c3_arrive', 'c3_gate', 'c3_king1', 'c3_radika1', 'c3_duel1', 'c3_emblem', 'c3_mid', 'c3_king2', 'c3_octa', 'c3_tempo', 'c3_lastpillar', 'c3_tower', 'c3_top', 'c3_boss', 'clear3'],
    4: ['ch4', 'c4_mount', 'c4_lake', 'c4_bull', 'c4_in', 'c4_door1', 'c4_door2', 'c4_door3', 'c4_c2talk', 'c4_door4', 'c4_mhall', 'c4_mh1', 'c4_mh2', 'c4_mh3',
      'c4_shadow', 'c4_wed', 'c4_guards', 'c4_racem', 'c4_shatter', 'c4_boss', 'clear4'],
    5: ['ch5', 'c5_gesui', 'c5_boeki', 'c5_ambush', 'c5_confess', 'c5_bunEki', 'c5t_amS', 'c5_d1', 'c5t_ibu', 'c5_d2', 'c5t_amR', 'c5_d3', 'c5_d5',
      'c5_tppo', 'c5_cation', 'c5_star', 'c5_starGone', 'c5_boss', 'clear5'],
  },
  lv: { 1: 3, 2: 5, 3: 7, 4: 10, 5: 11 },
  money: { 1: 430, 2: 1130, 3: 1960, 4: 3310, 5: 3660 },
  // 最初の仲間選びで選べる 4 人（R/S は並びで決まる）
  party: ['oxy', 'azy', 'iodo', 'buto'],
  items: { coffee: 3, energy: 1, book: 1 },
};
