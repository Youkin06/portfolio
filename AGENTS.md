# AGENTS.md

矢追陽平のポートフォリオサイト（静的HTML/CSS/JS、ビルドなし）。

## 構成

- `index.html` … 公開用のトップページ（新しいデザイン＝白・色の札案）。`sh redesign/a-skins/build.sh` が `redesign/a-sidebar.html` と white-fill のスキンから作るので、**直接は編集しない**。
- `content.html` … サイトの中身（経歴・インターン・作品カード・モーダル）。以前のサイトのページで、新しいデザインはここから内容を読み取って表示する。**内容の修正はここだけでよい**。
- `style.css` … スタイル
- `script.js` ほか `*.js` … アコーディオン、モーダル、背景描画、動画の遅延読み込みなど
- `Images/` … 画像素材
- `tests/` … Node標準のテスト（`node --test tests/*.cjs`）
- `redesign/` … 全体改修の試作4案（A〜D）。`redesign/shared/content.js` が `content.html` から内容を読み取って表示するため、内容の修正は `content.html` だけでよい。
  - 今後のベースは **A-白・色の札案（white-fill、`redesign/a-skin-white-fill.html`）**。A 案（`redesign/a-sidebar.html`）にスキンを重ねたものを使う。見た目違いの「スキン」は `redesign/a-skins/*.css` と `build.sh` で作る。
  - フォント比較は `redesign/font-compare.html`。現行（Zen Maru Gothic）と `font-original`・`font-zen`・`font-ud`・`font-mincho` の4案を同じページで比較できる。各案は store の文言・レイアウトを共用し、`build.sh` で生成する。
- `Images/research/` … 研究のページで流す動画と静止画。`content.html` の研究の枠に `data-video="Images/research/<名前>.mp4"` を書くと表示される（音を出せる動画は `data-video-audio` も付ける）。人の顔がはっきり映る動画は、顔をドット絵のアイコンで隠してから置く（VR ゴーグルを付けている人は隠さない）。動画はほかと同じ横長（16:9）にそろえる。
- `Images/clips/` … 作品一覧で動かす6秒のループ動画と静止画（ファイル名は YouTube の動画 ID）。
- 作品ページの全編動画は別リポジトリ `Youkin06/portfolio-media`（GitHub Pages）に置き、`https://youkin06.github.io/portfolio-media/videos/<動画ID>.mp4` で読み込む。
- 動画の読み込み（`redesign/a-sidebar.html` の「動画の先読み」）：
  - ページを開いて一段落したら、作品一覧の6秒ループと静止画（全部で約1.3MB）を先読みする。
  - 作品・研究へのリンクに触れたら（マウスを乗せる・指が触れる・キーで選ぶ）、その全編動画の最初の 1.5MB だけ先読みする。
  - 作品ページでは、まず6秒ループを流し、それが動き出してから全編を読み込み始めて、全編が動いたら切り替える（6秒ループが来なくても 2.5 秒で全編を読み込む）。
  - 全編動画をまるごと先読みはしない（全部で約70MB あり、スマホのデータ量を使いすぎるため）。データ節約の設定や遅い回線（2G・3G）では先読みしない。

## ブランチ

- `main` … 公開中のサイト。`main` に push すると GitHub Actions（`.github/workflows/pages.yml`）が `tools/collect-site.sh` で公開するファイルだけを集め、https://youkin06.github.io/portfolio/ に出すので、**`main` への push は公開になる**。試作のページ（`redesign/` の中の HTML）・白案以外のスキン・テスト・道具・メモ（`.md`）は公開しない。公開される中身は `sh tools/collect-site.sh <フォルダ>` で手元に集めて確かめられる。
- `develop` … 全体改修の作業場所。push しても公開されない。完成したら `main` に取り込んで公開する。
- `visual-skins` … デザイン担当の作業場所（worktree `../portfolio-skins`）。`develop` を取り込み、`develop` に戻す。

## 改修の方針

- **今後のデザイン・改修のベースは「A-白・色の札案（white-fill）」とする。** 最新版は `redesign/a-skin-white-fill.html`（自己紹介は `#about`）。A 案（`redesign/a-sidebar.html`）に、スキン **white-fill**（`redesign/a-skins/white-fill.css`・`white-fill.js`。共通部分は `white-common.css`、その土台は `store.css`）を重ねたものを指す。白地で、About は赤・Works は青・Research は緑、選んでいる項目は各色で塗って白い文字。About me は白地に草原とキャラクター（空は出さない）。プロフィールは「数字で見る」版（`SKIN.profile = 'numbers'`。ほかの版は URL に `?profile=intro|history` を付けて確認できる）。箱とボタンは全ページで同じ形にそろえる（`redesign/a-skins/unify-common.css`）：2px の黒い線・角 6px・白地で、ふだんは影なし。触れると影は元の位置に残ったまま、箱やボタンだけが左上へ浮き上がり、押すと元の位置へ沈む（影はその場所の色：About me 赤・Works 青・Research 緑）。顔写真には影を付けない。押せない札（タグ）は淡い色の札のまま。作品ページ・研究ページの動画は線で囲まない。大学・所属・目標は同じ書き方の3行で、目標だけ赤字。研究にも作品一覧と同じカードの「研究一覧」（`#research`）がある。スマホ（幅 960px 以下）では About me（プロフィール → 受賞歴 → インターン・バイト経験 → メディア掲載）→ 作品一覧 → 研究一覧 を1本のスクロールで見せ、上の帯には「Youkin」の見出しと「目次」ボタンを出す（作品・研究の1件ずつのページは別のページのまま）。パソコンは項目ごとのページのまま。標準フォントは **Zen Maru Gothic** とし、作品一覧のカードは枠線で囲む。見た目の確認・改善提案・フォント比較はこの案を基準にする。left-digital は以前の比較案として残す。
- スキンは `redesign/a-skins/<名前>.css` と `<名前>.js`（`window.SKIN` の設定）で作り、`sh redesign/a-skins/build.sh` で `redesign/a-skin-<名前>.html` を書き出す。
  - store のセクション色は main の配色を参考に、About me＝赤・Works＝水色・Research＝黄緑。白地の文字には濃い同系色、選択背景には淡い同系色を使う。
  - `window.SKIN` で変えられるもの（形 `layout`・画面の言葉 `text`・アイコン色・メールの出し方）と、CSS から使える目印は、`redesign/a-sidebar.html` の先頭のコメントにまとめてある。
  - `build.sh` は行頭の `</head>` を目印に差し込むので、`a-sidebar.html` の閉じタグ `</head>` は1行に単独で書く。
  - 使わなくなったスキンは `redesign/a-skins/archive/` に置く。

## 改修の分担（複数の Claude セッションで作業するとき）

- **機能**（構造・JS・内容の読み込み・動画・本番への反映）：`develop` ブランチで作業する。`redesign/a-sidebar.html` と `redesign/shared/` はこちらだけが編集する。
- **デザイン**（色・フォント・余白・飾り）：`visual-skins` で `redesign/a-skins/` だけを編集する。構造や動きを変えたいときは機能側に頼む。
- 機能側の変更は `develop` にコミットし、デザイン側は `develop` を取り込んでから `build.sh` でスキンを作り直す。

## 作業ルール

- **編集したら毎回、確認用リンクを渡す。**
  - リポジトリ直下でローカルサーバーを起動する（起動していなければ）：
    `python3 tools/serve.py`（ブラウザにファイルを覚えさせないので、直した内容がすぐ反映される。ポートを変えるときは `python3 tools/serve.py 8001`）
  - `curl` で応答を確認してから、返答の最後に確認用リンクを貼る。
    - 公開用のトップページ：http://127.0.0.1:8000/ （以前のサイトのページ：http://127.0.0.1:8000/content.html）
    - 最新版のベース：http://127.0.0.1:8000/redesign/a-skin-white-fill.html#about
    - A 案の共通構造：http://127.0.0.1:8000/redesign/a-sidebar.html（スキンは `redesign/a-skin-<名前>.html`）
    - デザイン側の worktree は別のポートで起動する（例：`../portfolio-skins` で 8001）。
  - 変更箇所がどこにあるか（どのアコーディオン・どの作品カードか）も一言添える。
- 既存の書き方に合わせる。
  - 受賞歴は新しいものを上に書く（`content.html` の並び順が、そのまま表示順になる）。
  - インターン・バイト経験は `experience-item internship-experience` の枠を追加する（役割 / 会社名 / 期間）。
  - 作品は `project-item` のカードとモーダルを追加し、経験欄から `#project-...` でリンクする。
- 文章は日本語。です・ます調で、やったこと → 工夫 → 学びの順に書く。
- 変更後は確認・必要なテストを行い、自動でコミットする。ユーザーが「コミットしないで」などと指定した場合は、その指示を優先する。
- コミットメッセージは `feat: 作品動画を音声切り替えだけの表示に変更`、`fix: 音アイコンがカーソルを外しても残る問題を修正`、`docs: 自動コミットの運用ルールを追記` のように、変更の種類を表す接頭辞と、内容が分かる日本語で書く。
- pushはユーザーに頼まれたときだけ行う。`main` への push は公開になるので、特に確認してから行う。
- **大事なことは、頼まれなくても自動でこの AGENTS.md にメモする。** 次の作業者（別の Claude セッションを含む）が会話を読まなくても分かるようにするため。
  - メモするもの：ユーザーが決めたデザインや仕様（例：影の色、ボタンの形）、やめたこと・やらないと決めたこと、ファイルの置き場所や仕組みの変更、公開の手順、保留中のこと。
  - 仕組みや決まりは、関係する節（構成・ブランチ・改修の方針・作業ルール）に書き足す。保留中のことは下の「保留中のこと」に書き、片付いたら消す。
  - メモを書き足したら、ほかの変更と同じように確認してコミットする（コミットメッセージは `docs:` で始める）。

## 保留中のこと

- **Sausage Smash の全編動画が重い。** 毎秒約2MB・全体で18.6MB あり（ほかの作品の4〜10倍）、遅い回線（1.6Mbps）では再生が始まらない。画質を少し下げて半分くらいにする案。「じいや！巨大ロボで紅茶を注ぎなさい！」（21MB）も大きめ。動画は別リポジトリ `Youkin06/portfolio-media` にあり、直すとそちらへの push が要る。ユーザーの指示で一旦保留（2026-11-06）。
- **スマホのプロフィールの数字タイルの並べ方。** 今は2つずつで、最後の「研究」が1つだけ残る。案 A（3つずつ）・B（最後だけ横いっぱい）・C（上に2つ、下に3つ。おすすめ）を見せて、返事待ち（2026-11-06）。
- **GitHub のアイコンだけ外のサイト（flaticon）から読み込んでいる。** `content.html` の SNS のリンク。サイトの中に置けば外のサイトの調子に左右されない。未対応。
