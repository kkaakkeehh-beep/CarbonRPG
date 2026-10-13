# -*- coding: utf-8 -*-
# 言語ごとのページ（en/ zh/ ko/）と sitemap.xml を、index.html から作る
#   py -X utf8 tools/lang_pages.py
# index.html の「<!-- lang:head -->」と「<!-- lang:body -->」の間（題名・説明・プレビュー・検索向けの情報）を言語ごとに書き、
# ほかの部分（読み込むスクリプトなど）は index.html と同じにする。en/ などは <base href="../"> で同じファイルを読む。
# index.html を直したら、これを走らせなおす（tests.html が、ずれていないかを確かめる）
import io, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://kkaakkeehh-beep.github.io/CarbonRPG/'
LASTMOD = '2026-10-13'

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
    return f'  <noscript><p>{esc(L["desc"])}</p><p>{esc(L["nojs"])}</p></noscript>'


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
