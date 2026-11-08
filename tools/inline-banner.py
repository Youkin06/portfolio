# サイドバーの一番上の見出し「Youkin」の画像（Images/sidebar-banner/ の20枚）を、redesign/a-sidebar.html の中に直接埋め込む。
# 1枚ずつ読み込むと、届いた順にバラバラに出てくるため。HTML と一緒に届くので、ページが出たときには全部そろっている。
# 画像を作り直したら、これを実行してから build.sh を実行する。
#   python3 tools/inline-banner.py
#   sh redesign/a-skins/build.sh
# 目印：<img data-banner="名前" src="…"> と、背景の模様の行の /* banner: bg */
import base64
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
page = root / 'redesign/a-sidebar.html'


def data_uri(name):
    png = (root / 'Images/sidebar-banner' / f'{name}.png').read_bytes()
    return 'data:image/png;base64,' + base64.b64encode(png).decode('ascii')


html = page.read_text(encoding='utf-8')
html, imgs = re.subn(r'data-banner="([a-z0-9-]+)" src="[^"]*"',
                     lambda m: f'data-banner="{m[1]}" src="{data_uri(m[1])}"', html)
html, bgs = re.subn(r'url\("[^"]*"\)(.*/\* banner: bg \*/)', lambda m: f'url("{data_uri("bg")}"){m[1]}', html)
page.write_text(html, encoding='utf-8')
print(f'{page.relative_to(root)} に画像 {imgs} 枚と背景の模様 {bgs} 枚を埋め込みました')
