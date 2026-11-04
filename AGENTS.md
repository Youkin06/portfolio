# AGENTS.md

矢追陽平のポートフォリオサイト（静的HTML/CSS/JS、ビルドなし）。

## 構成

- `index.html` … ページ本体（経歴・インターン・作品カード・モーダル）
- `style.css` … スタイル
- `script.js` ほか `*.js` … アコーディオン、モーダル、背景描画、動画の遅延読み込みなど
- `Images/` … 画像素材
- `tests/` … Node標準のテスト（`node --test tests/*.cjs`）
- `redesign/` … 全体改修の試作4案（A〜D）。`redesign/shared/content.js` が本番の `index.html` から内容を読み取って表示するため、内容の修正は `index.html` だけでよい。
  - 本命は A 案（`redesign/a-sidebar.html`）。見た目違いの「スキン」は `redesign/a-skins/*.css` と `build.sh` で作る。
- `Images/clips/` … 作品一覧で動かす6秒のループ動画と静止画（ファイル名は YouTube の動画 ID）。
- 作品ページの全編動画は別リポジトリ `Youkin06/portfolio-media`（GitHub Pages）に置き、`https://youkin06.github.io/portfolio-media/videos/<動画ID>.mp4` で読み込む。

## 改修の分担（複数の Claude セッションで作業するとき）

- **機能**（構造・JS・内容の読み込み・動画・本番への反映）：`main` ブランチで作業する。`redesign/a-sidebar.html` と `redesign/shared/` はこちらだけが編集する。
- **デザイン**（色・フォント・余白・飾り）：worktree `../portfolio-skins`（ブランチ `visual-skins`）で `redesign/a-skins/` だけを編集する。構造や動きを変えたいときは機能側に頼む。
- 機能側の変更は `main` にコミットし、デザイン側は `main` を取り込んでから `sh redesign/a-skins/build.sh` でスキンを作り直す。

## 作業ルール

- **編集したら毎回、確認用リンクを渡す。**
  - リポジトリ直下でローカルサーバーを起動する（起動していなければ）：
    `python3 -m http.server 8000 --bind 127.0.0.1`
  - `curl` で応答を確認してから、返答の最後に **http://127.0.0.1:8000/index.html** を貼る。
  - 変更箇所がどこにあるか（どのアコーディオン・どの作品カードか）も一言添える。
- 既存の書き方に合わせる。
  - インターン・バイト経験は `experience-item internship-experience` の枠を追加する（役割 / 会社名 / 期間）。
  - 作品は `project-item` のカードとモーダルを追加し、経験欄から `#project-...` でリンクする。
- 文章は日本語。です・ます調で、やったこと → 工夫 → 学びの順に書く。
- コミット・pushはユーザーに頼まれたときだけ行う。
