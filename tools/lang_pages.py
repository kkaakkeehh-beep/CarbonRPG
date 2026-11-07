# -*- coding: utf-8 -*-
# 言語ごとのページ（en/ zh/ ko/）と sitemap.xml を、index.html から作る
#   py -X utf8 tools/lang_pages.py
# index.html の「<!-- lang:head -->」と「<!-- lang:body -->」の間（題名・説明・プレビュー・検索向けの情報）を言語ごとに書き、
# ほかの部分（読み込むスクリプトなど）は index.html と同じにする。en/ などは <base href="../"> で同じファイルを読む。
# index.html を直したら、これを走らせなおす（tests.html が、ずれていないかを確かめる）
import io, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://kkaakkeehh-beep.github.io/CarbonRPG/'
LASTMOD = '2026-11-07'

LANGS = {
    'ja': dict(path='', html='ja', locale='ja_JP',
               title='CarbonRPG — 炭素の勇者｜有機化学のクイズ RPG',
               og_title='CarbonRPG — 炭素の勇者',
               desc='化学がわかる人向けの有機化学 RPG。キラルな炭素カーボが、闇の組織メソ教団に有機化学の問題で挑む。全 5 章・443 問（学部から院試・博士のレベルまで）。ブラウザで無料、登録なしで遊べる。',
               alt='CarbonRPG — 炭素の勇者。夜空に回る正四面体の炭素と、メソ教団の幹部たち',
               image='og.png',
               nojs='JavaScript を有効にすると遊べます。'),
    'en': dict(path='en/', html='en', locale='en_US',
               title='CarbonRPG — Hero of Carbon | Organic Chemistry Quiz RPG',
               og_title='CarbonRPG — Hero of Carbon',
               desc='An organic chemistry RPG for people who know their chemistry. Carbo, a chiral carbon with four hands, takes on the dark Meso Order with organic chemistry questions. 5 chapters and 443 questions, from undergraduate to PhD level. Free in your browser, no sign-up.',
               alt='CarbonRPG — Hero of Carbon. A spinning tetrahedral carbon and the leaders of the Meso Order in the night sky',
               image='og-en.png',
               nojs='Turn on JavaScript to play.'),
    'zh': dict(path='zh/', html='zh-Hans', locale='zh_CN',
               title='CarbonRPG — 碳之勇者｜有机化学答题 RPG',
               og_title='CarbonRPG — 碳之勇者',
               desc='面向懂化学的人的有机化学 RPG。拥有四只手的手性碳原子卡波，用有机化学题挑战黑暗组织“内消旋教团”。全 5 章、443 道题（从本科到博士水平）。在浏览器中免费游玩，无需注册。',
               alt='CarbonRPG — 碳之勇者。夜空中旋转的正四面体碳原子，和内消旋教团的干部们',
               image='og-zh.png',
               nojs='启用 JavaScript 后即可游玩。'),
    'ko': dict(path='ko/', html='ko', locale='ko_KR',
               title='CarbonRPG — 탄소의 용사 | 유기화학 퀴즈 RPG',
               og_title='CarbonRPG — 탄소의 용사',
               desc='화학을 아는 사람을 위한 유기화학 RPG. 네 개의 손을 가진 키랄 탄소 카보가 유기화학 문제로 어둠의 조직 메소 교단에 맞선다. 전 5장, 443문제(학부부터 박사 수준까지). 브라우저에서 무료, 가입 없이 플레이.',
               alt='CarbonRPG — 탄소의 용사. 밤하늘에서 회전하는 정사면체 탄소와 메소 교단의 간부들',
               image='og-ko.png',
               nojs='JavaScript를 켜면 플레이할 수 있습니다.'),
}


# タイトル画面の下に出す紹介の文（検索エンジンにも読める、ページに直接書いた文）。
# 出題範囲は、問題の分野（Questions.LIST の topic）を章ごとに数えたもの。ゲームを動かすと、タイトル画面のときだけ見える
ABOUT = {
    'ja': dict(
        h='有機化学 RPG「CarbonRPG — 炭素の勇者」',
        intro=['化学がわかる人向けの、ブラウザで遊べる有機化学のクイズ RPG です。主人公は、4 本の手を持つ sp³ 炭素「カーボ」。仲間 4 人と結合すると、置換基の CIP 順位で、カーボが (R) か (S) かが決まります。世界から「利き手」を消そうとする闇の組織メソ教団に、有機化学の問題で挑みます。',
               'バトルでは、正解すると敵にダメージ、間違えると自分がダメージを受けます。答えたあとは、必ず解説が出ます。'],
        range_h='出題範囲（全 5 章・443 問）',
        chapters=[('第 1 章 求核の森', 'SN1・SN2・E1・E2、立体化学、溶媒効果、求核性と脱離基、カルボカチオンの転位、隣接基関与'),
                  ('第 2 章 カルボニル港', '求核付加、エノラート、アルドール反応、Grignard 反応、Wittig 反応、Claisen 縮合、Michael 付加、Robinson 環化、Baeyer–Villiger 酸化、還元'),
                  ('第 3 章 芳香族の王国', '芳香族性（Hückel 則）、芳香族求電子置換と配向性、Friedel–Crafts 反応、SNAr、ベンザイン、ジアゾニウム塩、Birch 還元、ラジカル反応（NBS、スズヒドリド、ラジカル環化）'),
                  ('第 4 章 鏡の回廊', 'Diels–Alder 反応、電子環状反応、シグマトロピー転位、1,3-双極子付加、フロンティア軌道（FMO）、点群と対称要素、メソ体、光学分割'),
                  ('第 5 章 廃液街', '逆合成と合成計画、保護基、化学選択性、不斉合成と不斉触媒、キラル補助基、速度論的分割、ee の計算')],
        sep='：',
        structs='問題文に出てくる化合物には、構造式がつきます。構造式を選んで答える問題もあります（45 問）。',
        diff_h='難易度',
        diff='学部前半・学部後半・院試・博士（鬼）の 4 段階です。大学の有機化学の復習や、大学院入試（院試）の対策にも使えます。間違えた問題は「復習ノート」にたまり、解説つきで解き直せます。',
        faq_h='よくある質問',
        faq=[('無料ですか？', '無料です。登録もいりません。'),
             ('スマホで遊べますか？', 'スマホでも PC でも、ブラウザで遊べます。進み具合は、ブラウザに自動で保存されます。'),
             ('どの言語で遊べますか？', '日本語・英語・中国語（簡体字）・韓国語です。タイトル画面の右上で切り替えられます。')]),
    'en': dict(
        h='CarbonRPG — Hero of Carbon: an organic chemistry RPG',
        intro=['An organic chemistry quiz RPG for people who know their chemistry, playable in your browser. Your hero is Carbo, an sp³ carbon with four hands. Bond four friends to those hands and the CIP priorities of the substituents decide whether Carbo is (R) or (S). Then take on the Meso Order, a dark organization that wants to erase "handedness" from the world, with organic chemistry questions.',
               'In battle, a right answer damages the enemy and a wrong answer damages you. Every answer comes with an explanation.'],
        range_h='What the questions cover (5 chapters, 443 questions)',
        chapters=[('Chapter 1: Nucleophile Forest', 'SN1, SN2, E1 and E2, stereochemistry, solvent effects, nucleophilicity and leaving groups, carbocation rearrangements, neighboring-group participation'),
                  ('Chapter 2: Port Carbonyl', 'nucleophilic addition, enolates, aldol reactions, Grignard reactions, Wittig reactions, Claisen condensation, Michael addition, Robinson annulation, Baeyer–Villiger oxidation, reductions'),
                  ('Chapter 3: The Aromatic Kingdom', 'aromaticity (Hückel\'s rule), electrophilic aromatic substitution and directing effects, Friedel–Crafts reactions, SNAr, benzyne, diazonium salts, Birch reduction, radical reactions (NBS, tin hydrides, radical cyclization)'),
                  ('Chapter 4: Mirror Cloister', 'Diels–Alder reactions, electrocyclic reactions, sigmatropic rearrangements, 1,3-dipolar cycloadditions, frontier molecular orbitals (FMO), point groups and symmetry elements, meso compounds, optical resolution'),
                  ('Chapter 5: Waste Liquor Town', 'retrosynthesis and synthesis planning, protecting groups, chemoselectivity, asymmetric synthesis and asymmetric catalysis, chiral auxiliaries, kinetic resolution, ee calculations')],
        sep=': ',
        structs='Every compound named in a question is drawn as a structure. Some questions are answered by picking a structure (45 questions).',
        diff_h='Difficulty',
        diff='Four levels: Undergrad I, Undergrad II, Grad Entrance Exam and PhD (Brutal). Use it to review university organic chemistry or to prepare for graduate entrance exams. Questions you miss go into the Review Notebook, where you can solve them again with explanations.',
        faq_h='FAQ',
        faq=[('Is it free?', 'Yes. No sign-up needed.'),
             ('Can I play on my phone?', 'Yes, on a phone or a PC, in your browser. Your progress saves automatically in the browser.'),
             ('Which languages are available?', 'Japanese, English, Simplified Chinese and Korean. Switch at the top right of the title screen.')]),
    'zh': dict(
        h='有机化学 RPG《CarbonRPG — 碳之勇者》',
        intro=['面向懂化学的人、在浏览器中就能玩的有机化学答题 RPG。主角是拥有四只手的 sp³ 碳原子“卡波”。与四位伙伴成键后，由取代基的 CIP 优先顺序决定卡波是 (R) 还是 (S)。用有机化学题，挑战想要把“手性”从世界上抹去的黑暗组织“内消旋教团”。',
               '战斗中，答对就能伤害敌人，答错则自己受到伤害。每次作答后都会给出解析。'],
        range_h='出题范围（全 5 章、443 道题）',
        chapters=[('第 1 章 亲核之森', 'SN1、SN2、E1、E2，立体化学，溶剂效应，亲核性与离去基团，碳正离子重排，邻基参与'),
                  ('第 2 章 羰基港', '亲核加成，烯醇负离子，羟醛反应，格氏反应，Wittig 反应，Claisen 缩合，Michael 加成，Robinson 成环，Baeyer–Villiger 氧化，还原'),
                  ('第 3 章 芳香族王国', '芳香性（Hückel 规则），芳香亲电取代与定位效应，Friedel–Crafts 反应，SNAr，苯炔，重氮盐，Birch 还原，自由基反应（NBS、锡氢化物、自由基环化）'),
                  ('第 4 章 镜之回廊', 'Diels–Alder 反应，电环化反应，σ 迁移重排，1,3-偶极环加成，前线轨道（FMO），点群与对称元素，内消旋体，光学拆分'),
                  ('第 5 章 废液街', '逆合成与合成设计，保护基，化学选择性，不对称合成与不对称催化，手性辅基，动力学拆分，ee 值的计算')],
        sep='：',
        structs='题目中出现的化合物都配有结构式。也有需要从结构式中选择答案的题目（45 道）。',
        diff_h='难度',
        diff='分为本科（上）、本科（下）、考研、博士（地狱）4 个等级。可用于复习大学有机化学，或准备研究生入学考试。答错的题会记入“复习笔记”，可以带着解析重新作答。',
        faq_h='常见问题',
        faq=[('免费吗？', '免费，也不需要注册。'),
             ('可以用手机玩吗？', '手机和电脑都可以在浏览器中游玩。进度会自动保存在浏览器中。'),
             ('支持哪些语言？', '日语、英语、简体中文、韩语。可以在标题画面右上角切换。')]),
    'ko': dict(
        h='유기화학 RPG "CarbonRPG — 탄소의 용사"',
        intro=['화학을 아는 사람을 위한, 브라우저에서 플레이하는 유기화학 퀴즈 RPG입니다. 주인공은 네 개의 손을 가진 sp³ 탄소 "카보". 동료 네 명과 결합하면, 치환기의 CIP 순위에 따라 카보가 (R)인지 (S)인지가 정해집니다. 세상에서 "손잡이"를 없애려는 어둠의 조직 메소 교단에, 유기화학 문제로 맞섭니다.',
               '전투에서는 정답을 맞히면 적에게 데미지, 틀리면 내가 데미지를 받습니다. 답한 뒤에는 반드시 해설이 나옵니다.'],
        range_h='출제 범위 (전 5장, 443문제)',
        chapters=[('제1장 친핵의 숲', 'SN1·SN2·E1·E2, 입체화학, 용매 효과, 친핵성과 이탈기, 탄소 양이온 자리옮김, 이웃 기 관여'),
                  ('제2장 카보닐 항구', '친핵성 첨가, 엔올레이트, 알돌 반응, 그리냐르 반응, 비티히 반응, 클라이젠 축합, 마이클 첨가, 로빈슨 고리화, 베이어-빌리거 산화, 환원'),
                  ('제3장 방향족 왕국', '방향족성(휘켈 규칙), 방향족 친전자성 치환과 배향성, 프리델-크래프츠 반응, SNAr, 벤자인, 다이아조늄 염, 버치 환원, 라디칼 반응(NBS, 주석 수소화물, 라디칼 고리화)'),
                  ('제4장 거울의 회랑', '딜스-알더 반응, 전자 고리화 반응, 시그마 자리옮김, 1,3-쌍극자 고리화 첨가, 프런티어 오비탈(FMO), 점군과 대칭 요소, 메소 화합물, 광학 분할'),
                  ('제5장 폐액 거리', '역합성과 합성 계획, 보호기, 화학 선택성, 비대칭 합성과 비대칭 촉매, 키랄 보조기, 속도론적 분할, ee 계산')],
        sep=': ',
        structs='문제에 나오는 화합물에는 구조식이 함께 나옵니다. 구조식을 골라 답하는 문제도 있습니다(45문제).',
        diff_h='난이도',
        diff='학부 전반·학부 후반·대학원 입시·박사 (지옥)의 4단계입니다. 대학 유기화학 복습이나 대학원 입시 대비에도 쓸 수 있습니다. 틀린 문제는 "복습 노트"에 모여, 해설과 함께 다시 풀 수 있습니다.',
        faq_h='자주 묻는 질문',
        faq=[('무료인가요?', '무료입니다. 가입도 필요 없습니다.'),
             ('스마트폰으로 할 수 있나요?', '스마트폰과 PC 모두 브라우저에서 플레이할 수 있습니다. 진행 상황은 브라우저에 자동으로 저장됩니다.'),
             ('어떤 언어로 할 수 있나요?', '일본어·영어·중국어(간체)·한국어입니다. 타이틀 화면 오른쪽 위에서 바꿀 수 있습니다.')]),
}


def about(k):
    A = ABOUT[k]
    lines = ['<section class="about" aria-labelledby="about-h">',
             f'  <h2 id="about-h">{esc(A["h"])}</h2>',
             *[f'  <p>{esc(p)}</p>' for p in A['intro']],
             f'  <h3>{esc(A["range_h"])}</h3>',
             '  <ul>',
             *[f'    <li><b>{esc(c)}</b>{esc(A["sep"])}{esc(t)}</li>' for c, t in A['chapters']],
             '  </ul>',
             f'  <p>{esc(A["structs"])}</p>',
             f'  <h3>{esc(A["diff_h"])}</h3>',
             f'  <p>{esc(A["diff"])}</p>',
             f'  <h3>{esc(A["faq_h"])}</h3>',
             '  <dl>',
             *[f'    <dt>{esc(q)}</dt><dd>{esc(a)}</dd>' for q, a in A['faq']],
             '  </dl>',
             '</section>']
    return '\n'.join('  ' + x for x in lines)


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')


def head(k):
    L = LANGS[k]
    u = URL + L['path']
    alts = [f'<link rel="alternate" hreflang="{v["html"]}" href="{URL + v["path"]}">' for v in LANGS.values()]
    alts.append(f'<link rel="alternate" hreflang="x-default" href="{URL}">')
    ld = {
        '@context': 'https://schema.org', '@type': 'VideoGame',
        'name': 'CarbonRPG', 'alternateName': [v['og_title'].split(' — ')[1] for v in LANGS.values()],
        'url': u, 'image': URL + L['image'], 'description': L['desc'],
        'inLanguage': [v['html'] for v in LANGS.values()],
        'genre': ['RPG', 'Quiz', 'Educational'], 'gamePlatform': 'Web browser',
        'applicationCategory': 'Game', 'operatingSystem': 'Any', 'isAccessibleForFree': True,
        'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
    }
    lines = [
        f'<title>{esc(L["title"])}</title>',
        f'<meta name="description" content="{esc(L["desc"])}">',
        f'<link rel="canonical" href="{u}">',
        *alts,
        '<meta property="og:type" content="website">',
        f'<meta property="og:url" content="{u}">',
        f'<meta property="og:title" content="{esc(L["og_title"])}">',
        f'<meta property="og:description" content="{esc(L["desc"])}">',
        f'<meta property="og:image" content="{URL + L["image"]}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(L["alt"])}">',
        f'<meta property="og:locale" content="{L["locale"]}">',
        *[f'<meta property="og:locale:alternate" content="{v["locale"]}">' for kk, v in LANGS.items() if kk != k],
        '<meta name="twitter:card" content="summary_large_image">',
        '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>',
    ]
    return '\n'.join('  ' + x for x in lines)


def body(k):
    L = LANGS[k]
    return f'  <noscript><p>{esc(L["nojs"])}</p></noscript>\n' + about(k)


def block(s, name, content):
    a, b = f'<!-- lang:{name} -->', f'<!-- /lang:{name} -->'
    pat = re.compile(re.escape(a) + r'.*?' + re.escape(b), re.S)
    assert len(pat.findall(s)) == 1, name
    return pat.sub(lambda m: f'{a}\n{content}\n  {b}', s)


def main():
    p = os.path.join(ROOT, 'index.html')
    src = io.open(p, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in src else '\n'
    s = src.replace('\r\n', '\n')
    ja = block(block(s, 'head', head('ja')), 'body', body('ja'))
    io.open(p, 'w', encoding='utf-8', newline='').write(ja.replace('\n', nl))
    for k, L in LANGS.items():
        if k == 'ja':
            continue
        t = block(block(s, 'head', head(k)), 'body', body(k))
        t = t.replace('<html lang="ja">', f'<html lang="{L["html"]}" data-lang="{k}">', 1)
        t = t.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <!-- tools/lang_pages.py で index.html から作ったページ。直接は直さない -->\n  <base href="../">', 1)
        os.makedirs(os.path.join(ROOT, k), exist_ok=True)
        io.open(os.path.join(ROOT, k, 'index.html'), 'w', encoding='utf-8', newline='').write(t.replace('\n', nl))
    # サイトマップ（言語ごとのページを、たがいの訳として書く）
    xs = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for L in LANGS.values():
        xs.append('  <url>')
        xs.append(f'    <loc>{URL + L["path"]}</loc>')
        xs.append(f'    <lastmod>{LASTMOD}</lastmod>')
        for v in LANGS.values():
            xs.append(f'    <xhtml:link rel="alternate" hreflang="{v["html"]}" href="{URL + v["path"]}"/>')
        xs.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{URL}"/>')
        xs.append('  </url>')
    xs.append('</urlset>')
    io.open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write('\n'.join(xs) + '\n')
    print('ok')


if __name__ == '__main__':
    main()
