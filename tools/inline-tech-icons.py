# 技術スタックのアイコン（Images/icons/devicon/・simpleicons/ の SVG）を、redesign/a-sidebar.html の中に直接埋め込む。
# 1つずつ読み込むと、作品一覧の画像やフォントと取り合いになり、遅い回線では数秒かけてバラバラに出てくるため。
# HTML と一緒に届くので、プロフィールが出たときには全部そろっている。
# アイコンを差し替えたり、技術を足したりしたら、これを実行してから build.sh を実行する。
#   python3 tools/inline-tech-icons.py
#   sh redesign/a-skins/build.sh
# 目印：// tech-icons: start と // tech-icons: end の間を書き換える。どのファイルを使うかは ICONS で決める。
import json
import pathlib
import re
from urllib.parse import quote

root = pathlib.Path(__file__).resolve().parent.parent
page = root / 'redesign/a-sidebar.html'

# TECH_STACK の id → アイコンのファイル
ICONS = {
    'csharp': 'devicon/csharp.svg',
    'unity': 'devicon/unity.svg',
    'c': 'devicon/c.svg',
    'cpp': 'devicon/cpp.svg',
    'python': 'devicon/python.svg',
    'git': 'devicon/git.svg',
    'github': 'devicon/github.svg',
    'blender': 'devicon/blender.svg',
    'figma': 'devicon/figma.svg',
    'notion': 'devicon/notion.svg',
    'claude': 'simpleicons/claude.svg',
    'codex': 'simpleicons/openai.svg',
}


def data_uri(name):
    svg = (root / 'Images/icons' / name).read_text(encoding='utf-8').strip()
    # base64 より小さく、gzip も効く。src="…" に入れるので " などは % で書く。
    return 'data:image/svg+xml,' + quote(re.sub(r'\s+', ' ', svg), safe=" /:=;,'()-.!*_~@+?&$")


lines = ''.join(f'            {id}: {json.dumps(data_uri(name))},\n' for id, name in ICONS.items())
html = page.read_text(encoding='utf-8')
html, n = re.subn(r'(// tech-icons: start\n).*?(\s*// tech-icons: end)',
                  lambda m: m[1] + lines.rstrip('\n') + m[2], html, flags=re.S)
if n != 1:
    raise SystemExit('a-sidebar.html に // tech-icons: start と // tech-icons: end の目印が見つかりません')
page.write_text(html, encoding='utf-8')
print(f'{page.relative_to(root)} にアイコン {len(ICONS)} 個を埋め込みました')
