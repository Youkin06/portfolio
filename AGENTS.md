# AGENTS.md

矢追陽平のポートフォリオサイト（静的HTML/CSS/JS、ビルドなし）。

## 構成

- `index.html` … ページ本体（経歴・インターン・作品カード・モーダル）
- `style.css` … スタイル
- `script.js` ほか `*.js` … アコーディオン、モーダル、背景描画、動画の遅延読み込みなど
- `Images/` … 画像素材
- `tests/` … Node標準のテスト（`node --test tests/*.cjs`）
- `redesign/` … 全体改修の試作4案（A〜D）。`redesign/shared/content.js` が本番の `index.html` から内容を読み取って表示するため、内容の修正は `index.html` だけでよい。
  - 今後のベースは **A-ゲーム投稿サイト案（store、`redesign/a-skin-store.html`）**。A 案（`redesign/a-sidebar.html`）にスキンを重ねたものを使う。見た目違いの「スキン」は `redesign/a-skins/*.css` と `build.sh` で作る。
  - フォント比較は `redesign/font-compare.html`。現行と `font-zen`・`font-ud`・`font-maru`・`font-mincho` の4案を同じページで比較できる。各案は store の文言・レイアウトを共用し、`build.sh` で生成する。
- `Images/clips/` … 作品一覧で動かす6秒のループ動画と静止画（ファイル名は YouTube の動画 ID）。
- 作品ページの全編動画は別リポジトリ `Youkin06/portfolio-media`（GitHub Pages）に置き、`https://youkin06.github.io/portfolio-media/videos/<動画ID>.mp4` で読み込む。

## ブランチ

- `main` … 公開中のサイト。GitHub Pages が `main` の中身をそのまま https://youkin06.github.io/portfolio/ に出すので、**`main` への push は公開になる**。
- `develop` … 全体改修の作業場所。push しても公開されない。完成したら `main` に取り込んで公開する。
- `visual-skins` … デザイン担当の作業場所（worktree `../portfolio-skins`）。`develop` を取り込み、`develop` に戻す。

## 改修の方針

- **今後のデザイン・改修のベースは「A-ゲーム投稿サイト案（store）」とする。** 最新版は `redesign/a-skin-store.html`（自己紹介は `#about`）。A 案（`redesign/a-sidebar.html`）に、スキン **store**（`redesign/a-skins/store.css`・`store.js`）を重ねたものを指す。見た目の確認・改善提案・フォント比較はこの案を基準にする。left-digital は以前の比較案として残す。
- スキンは `redesign/a-skins/<名前>.css` と `<名前>.js`（`window.SKIN` の設定）で作り、`sh redesign/a-skins/build.sh` で `redesign/a-skin-<名前>.html` を書き出す。
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
    `python3 -m http.server 8000 --bind 127.0.0.1`
  - `curl` で応答を確認してから、返答の最後に確認用リンクを貼る。
    - 公開中のサイト：http://127.0.0.1:8000/index.html
    - 最新版のベース：http://127.0.0.1:8000/redesign/a-skin-store.html#about
    - A 案の共通構造：http://127.0.0.1:8000/redesign/a-sidebar.html（スキンは `redesign/a-skin-<名前>.html`）
    - デザイン側の worktree は別のポートで起動する（例：`../portfolio-skins` で 8001）。
  - 変更箇所がどこにあるか（どのアコーディオン・どの作品カードか）も一言添える。
- 既存の書き方に合わせる。
  - インターン・バイト経験は `experience-item internship-experience` の枠を追加する（役割 / 会社名 / 期間）。
  - 作品は `project-item` のカードとモーダルを追加し、経験欄から `#project-...` でリンクする。
- 文章は日本語。です・ます調で、やったこと → 工夫 → 学びの順に書く。
- 変更後は確認・必要なテストを行い、自動でコミットする。ユーザーが「コミットしないで」などと指定した場合は、その指示を優先する。
- コミットメッセージは `feat: 作品動画を音声切り替えだけの表示に変更`、`fix: 音アイコンがカーソルを外しても残る問題を修正`、`docs: 自動コミットの運用ルールを追記` のように、変更の種類を表す接頭辞と、内容が分かる日本語で書く。
- pushはユーザーに頼まれたときだけ行う。`main` への push は公開になるので、特に確認してから行う。
