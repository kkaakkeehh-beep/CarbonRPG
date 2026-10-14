# -*- coding: utf-8 -*-
# itch.io にアップロードする ZIP を作る（遊ぶのに要るファイルだけ。index.html が ZIP のいちばん上）
#   py -X utf8 tools/itch_zip.py   ->  dist/CarbonRPG-itch.zip
import os, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['index.html', 'style.css', 'favicon.ico', 'icon-192.png', 'apple-touch-icon.png']
DIRS = ['js', 'lib']


def main():
    out_dir = os.path.join(ROOT, 'dist')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'CarbonRPG-itch.zip')
    n = 0
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in FILES:
            z.write(os.path.join(ROOT, f), f); n += 1
        for d in DIRS:
            for base, _, names in os.walk(os.path.join(ROOT, d)):
                for name in sorted(names):
                    p = os.path.join(base, name)
                    z.write(p, os.path.relpath(p, ROOT).replace(os.sep, '/')); n += 1
    print(out, n, 'files', round(os.path.getsize(out) / 1024), 'KB')


if __name__ == '__main__':
    main()
