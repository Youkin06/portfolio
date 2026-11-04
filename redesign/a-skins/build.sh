#!/bin/sh
# A案（a-sidebar.html）の見た目違いを作る。
# 構成とJSはA案のまま、</head> の直前にスキンのフォント・CSS・設定（<名前>.js があれば）を足すだけ。
# 設定の書き方は a-sidebar.html の先頭のコメントを参照。
# A案を直したら、このスクリプトをもう一度実行すれば全スキンに反映される。
#   sh redesign/a-skins/build.sh

cd "$(dirname "$0")/.." || exit 1

build() {
    name=$1; title=$2; fonts=$3
    # フォントを足さない案は3つめの引数を '' にする
    font_link=${fonts:+"    <link href=\"https://fonts.googleapis.com/css2?${fonts}\&display=swap\" rel=\"stylesheet\">\\
"}
    config=''
    [ -f "a-skins/${name}.js" ] && config="    <script src=\"a-skins/${name}.js\"></script>\\
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
build store 'ゲーム投稿サイト案' 'family=Lato:wght@400;700;900'
