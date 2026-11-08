#!/usr/bin/env python3
# Zen Maru Gothic から、サイトで使う文字だけを切り出して fonts/ に置く。
# Google Fonts から読み込むと、太さ3種類で 84 件・約 1MB になるため（2026-11-08 に測定）。
#
#   python3 -m pip install fonttools brotli   # 初回だけ
#   python3 tools/subset-fonts.py
#
# content.html などに新しい漢字を書いたら、もう一度実行する（tests/font-subset.test.cjs が見張っている）。
# 元のフォント（1つ約 3.7MB）は fonts/.source/ に落としておき、コミットしない。
import re
import sys
import urllib.request
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'fonts'
SOURCE = OUT / '.source'
WEIGHTS = {400: 'Regular', 700: 'Bold', 900: 'Black'}
SOURCE_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/zenmarugothic/ZenMaruGothic-{}.ttf'

# 画面に文字を出しうるファイル（公開するもの）
TEXT_FILES = [
    'content.html',
    'redesign/a-sidebar.html',
    *sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'redesign/shared').glob('*.js')),
    *sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'redesign/shared').glob('*.css')),
    'redesign/a-skins/white-fill.js',
    'redesign/a-skins/white-fill.css',
    'redesign/a-skins/white-common.css',
    'redesign/a-skins/unify-common.css',
    'redesign/a-skins/store.css',
    'redesign/a-skins/left.css',
]

# 書き足しで増えやすい文字は、使っていなくても入れておく（ASCII・かな・よく使う記号）
BASE_CHARS = (
    ''.join(chr(c) for c in range(0x20, 0x7F))
    + ''.join(chr(c) for c in range(0x3041, 0x3097))   # ひらがな
    + ''.join(chr(c) for c in range(0x30A1, 0x30FB))   # カタカナ
    + '　、。，．・：；？！ー〜～…‥「」『』（）［］【】〈〉《》＜＞＝＋－×÷％＆＃＠＊／＼｜々〇'
    + '０１２３４５６７８９←→↑↓○●◎□■△▲▽▼◇◆★☆♪・“”‘’—–'
)


def used_chars():
    chars = set(BASE_CHARS)
    for name in TEXT_FILES:
        text = (ROOT / name).read_text(encoding='utf-8')
        # コメントの文字は画面に出ないので数えない（行末の // コメントは安全のため残す）
        text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
        text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
        text = re.sub(r'^\s*//.*$', '', text, flags=re.M)
        chars.update(text)
    return ''.join(sorted(c for c in chars if c >= ' '))


def source_font(style):
    path = SOURCE / f'ZenMaruGothic-{style}.ttf'
    if not path.exists():
        SOURCE.mkdir(parents=True, exist_ok=True)
        print(f'{path.name} を取得します')
        urllib.request.urlretrieve(SOURCE_URL.format(style), path)
    return path


def main():
    chars = used_chars()
    OUT.mkdir(exist_ok=True)
    (OUT / 'subset-chars.txt').write_text(chars + '\n', encoding='utf-8')
    faces = []
    for weight, style in WEIGHTS.items():
        dest = OUT / f'zen-maru-gothic-{weight}.woff2'
        subset.main([
            str(source_font(style)),
            f'--text-file={OUT / "subset-chars.txt"}',
            '--layout-features=*',
            '--flavor=woff2',
            f'--output-file={dest}',
        ])
        print(f'{dest.relative_to(ROOT)}: {dest.stat().st_size / 1024:.1f}KB')
        faces.append(
            '@font-face {\n'
            '    font-family: "Zen Maru Gothic";\n'
            f'    src: url("zen-maru-gothic-{weight}.woff2") format("woff2");\n'
            f'    font-weight: {weight};\n'
            '    font-style: normal;\n'
            '    font-display: swap;\n'
            '}\n')
    (OUT / 'zen-maru-gothic.css').write_text(
        '/* tools/subset-fonts.py が作るファイル。直接は編集しない。\n'
        '   Zen Maru Gothic（SIL Open Font License 1.1）から、サイトで使う文字だけを切り出したもの。 */\n'
        + ''.join(faces), encoding='utf-8')
    print(f'{len(chars)} 文字を切り出しました')


if __name__ == '__main__':
    sys.exit(main())
