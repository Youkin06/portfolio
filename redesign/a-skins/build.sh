#!/bin/sh
# A案（a-sidebar.html）の見た目違いを作る。
# 構成とJSはA案のまま、</head> の直前にスキンのフォント・CSS・設定（<名前>.js があれば）を足すだけ。
# 設定の書き方は a-sidebar.html の先頭のコメントを参照。
# A案を直したら、このスクリプトをもう一度実行すれば全スキンに反映される。
#   sh redesign/a-skins/build.sh

cd "$(dirname "$0")/.." || exit 1

build() {
    name=$1; title=$2; fonts=$3; config_name=${4:-$1}
    # フォントを足さない案は3つめの引数を '' にする
    font_link=${fonts:+"    <link href=\"https://fonts.googleapis.com/css2?${fonts}\&display=swap\" rel=\"stylesheet\">\\
"}
    config=''
    [ -f "a-skins/${config_name}.js" ] && config="    <script src=\"a-skins/${config_name}.js\"></script>\\
"
    sed -e "s#<title>A サイドバー案#<title>A-${title}#" \
        -e "s#^</head>#${font_link}    <link rel=\"stylesheet\" href=\"a-skins/${name}.css\">\\
${config}</head>#" \
        a-sidebar.html > "a-skin-${name}.html"
}

# A案のまま、サイドバーを一番左にくっつけるだけ
build left '左端案' ''
# 左端案＋デジタル庁デザインシステム
build left-digital '左端デジタル庁案' 'family=Noto+Sans+Mono:wght@400;700'
# デジタル庁デザインシステム、中の項目なし（About me／Works／研究 の3ページ）
build digital 'デジタル庁案' 'family=Noto+Sans+Mono:wght@400;700'
# スマホゲー案（カジュアルゲームのUI。文言は A 案のまま）
build game-mobile 'スマホゲー案' 'family=M+PLUS+Rounded+1c:wght@500;700;800'
# ゲーム投稿サイト案（unityroom・itch.io のような、ゲームを並べて見せる場所の雰囲気。文言は A 案のまま）
build store 'ゲーム投稿サイト案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
# フォント比較：レイアウトと文言は最新版の store と共通
build font-original 'フォント比較・以前のゴシック' 'family=Lato:wght@400;700;900' store
build font-zen 'フォント比較・Zen角ゴシック' 'family=Zen+Kaku+Gothic+New:wght@400;500;700;900' store
build font-ud 'フォント比較・BIZ UDPゴシック' 'family=BIZ+UDPGothic:wght@400;700' store
build font-maru 'フォント比較・Zen丸ゴシック' 'family=Zen+Maru+Gothic:wght@400;500;700;900' store
build font-mincho 'フォント比較・明朝の見出し' 'family=Zen+Old+Mincho:wght@500;700' store
build font-mplus 'フォント比較・M PLUS 2' 'family=M+PLUS+2:wght@400;500;700;800' store
build font-rounded 'フォント比較・M PLUS Rounded' 'family=M+PLUS+Rounded+1c:wght@400;500;700;800' store
build font-kiwi 'フォント比較・Kiwi丸' 'family=Kiwi+Maru:wght@400;500' store
build font-dot 'フォント比較・ドットの見出し' 'family=DotGothic16' store
build font-klee 'フォント比較・教科書体の見出し' 'family=Klee+One:wght@400;600' store
# 配色違い（構成・文言・キャラクターは store と共通）
build night '夜空案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build midnight '真夜中案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build ink '墨紺案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build paper '生成り案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white '白案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build mono '無機質な白案' 'family=Zen+Kaku+Gothic+New:wght@400;500;700;900'
build mist '薄曇り案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
