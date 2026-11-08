#!/bin/sh
# A案（a-sidebar.html）の見た目違いを作る。
# 構成とJSはA案のまま、</head> の直前にスキンのフォント・CSS・設定（<名前>.js があれば）を足すだけ。
# 設定の書き方は a-sidebar.html の先頭のコメントを参照。
# A案を直したら、このスクリプトをもう一度実行すれば全スキンに反映される。
#   sh redesign/a-skins/build.sh

cd "$(dirname "$0")/.." || exit 1

# 本文に Noto Sans JP を使う案（A案のまま・デジタル庁系・Lato＋Noto のフォント比較）
NOTO_SKINS='left left-digital digital font-original'

# スキンの CSS が @import でたどる CSS をすべて書き出す（読み込む順に）。
# 外のサイト（Google Fonts など）の CSS は数えない。たどる途中で f が書き換わらないよう、( ) の中で動かす。
imports() (
    for f in $(sed -n 's/^@import url("\([^":]*\)");.*/\1/p' "a-skins/$1"); do
        imports "$f"
        echo "$f"
    done
)

build() {
    name=$1; title=$2; fonts=$3; config_name=${4:-$1}
    # フォントを足さない案は3つめの引数を '' にする。
    # 'local' はサイトの中に置いた Zen Maru Gothic（fonts/。tools/subset-fonts.py が作る）を使い、Google Fonts へはつながない。
    case $fonts in
        local)
            font_link="    <link rel=\"stylesheet\" href=\"../fonts/zen-maru-gothic.css\">\\
"
            drop_preconnect='/<link rel="preconnect" href="https:\/\/fonts\./d' ;;
        *)
            font_link=${fonts:+"    <link href=\"https://fonts.googleapis.com/css2?${fonts}\&display=swap\" rel=\"stylesheet\">\\
"}
            drop_preconnect='' ;;
    esac
    # @import の先は、元の CSS が届くまで取りに行けず順番待ちになるので、先に並べて取りに行かせる（効き方は @import のまま）。
    preload=''
    for f in $(imports "${name}.css" | awk '!seen[$0]++'); do
        preload="${preload}    <link rel=\"preload\" href=\"a-skins/${f}\" as=\"style\">\\
"
    done
    config=''
    [ -f "a-skins/${config_name}.js" ] && config="    <script src=\"a-skins/${config_name}.js\"></script>\\
"
    # Noto Sans JP は、それを本文に使う案だけ読み込む（ほかの案は日本語のそろったフォントを先に使うので、読み込んでも使われない）。
    case " $NOTO_SKINS " in *" $name "*) drop_noto='' ;; *) drop_noto='/family=Noto+Sans+JP/d' ;; esac
    sed -e "s#<title>A サイドバー案#<title>A-${title}#" \
        -e "${drop_noto:-s/^\$//}" \
        -e "${drop_preconnect:-s/^\$//}" \
        -e "s#^</head>#${font_link}${preload}    <link rel=\"stylesheet\" href=\"a-skins/${name}.css\">\\
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
# 白案の色違い（About は赤、Works は青、Research は緑）
build white-gray '白・灰色サイドバー案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white-line '白・線で区切る案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white-fill '白・色の札案' local

# 公開用のトップページ（リポジトリ直下の index.html）。white-fill を、置き場所に合わせて書き換えて書き出す。
# 直接は編集しない（a-sidebar.html・スキンを直して、このスクリプトをもう一度実行する）。
sed -E \
    -e 's#<title>[^<]*</title>#<title>矢追陽平（ヨウキン）のポートフォリオ</title>#' \
    -e 's#^<head>$#<head><!-- redesign/a-skins/build.sh が redesign/a-sidebar.html と white-fill から作るファイル。直接は編集しない。 -->#' \
    -e "s#'\.\./content\.html'#'content.html'#" \
    -e 's#(src|href)="\.\./#\1="#g' \
    -e 's#url\("\.\./Images#url("Images#g' \
    -e "s#'\.\./Images/#'Images/#g" \
    -e 's#(src|href)="(shared|a-skins)/#\1="redesign/\2/#g' \
    a-skin-white-fill.html > ../index.html
# 公開用のトップページでは、本文を組み立てる JS（shared/*.js）を HTML の中に直接書き込む。
# 別のファイルのままだと、遅い回線では JS が届くまで本文の場所が空のまま表示される（最初の表示から約1秒）。
# 書き込むと、最初の表示で本文までそろって出る。元のファイル（redesign/shared/）を直して、このスクリプトをもう一度実行する。
awk '
    /^    <script src="redesign\/shared\/[a-z0-9-]+\.js"><\/script>\r?$/ {
        file = $0
        sub(/^    <script src="/, "", file)
        sub(/"><\/script>\r?$/, "", file)
        print "    <script>"
        while ((getline line < ("../" file)) > 0) print line
        close("../" file)
        print "    </script>"
        next
    }
    { print }
' ../index.html > ../index.html.tmp && mv ../index.html.tmp ../index.html
build white-soft '白・やわらかい影案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white-sky '白・淡い空案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white-tint '白・色の札（黒文字）案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
build white-marker '白・マーカー案' 'family=Zen+Maru+Gothic:wght@400;500;700;900'
