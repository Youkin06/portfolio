#!/bin/sh
# 公開するファイルだけを、指定したフォルダ（既定は _site）に集める。
# GitHub Actions（.github/workflows/pages.yml）が main に push されたときに使う。手元で確かめるときも同じものを使う。
# 外すもの：試作のページ（redesign/ の中の HTML）、白案以外のスキン、テスト、作業用の道具とメモ（.md）。
# トップページ（index.html）が使う redesign/shared/ と、白案（white-fill）とその土台の CSS・JS だけは公開する。
set -e
cd "$(dirname "$0")/.."
out=${1:-_site}
rm -rf "$out"
mkdir -p "$out"
rsync -a \
    --exclude '.git' --exclude '.github' --exclude '.claude' --exclude '_site' --exclude "$out" \
    --exclude 'redesign/*.html' \
    --include 'redesign/a-skins/left.css' --include 'redesign/a-skins/store.css' --include 'redesign/a-skins/white-common.css' \
    --include 'redesign/a-skins/unify-common.css' --include 'redesign/a-skins/white-fill.css' --include 'redesign/a-skins/white-fill.js' \
    --exclude 'redesign/a-skins/*' \
    --exclude 'tests' --exclude 'tools' --exclude 'fonts/.source' --exclude 'fonts/subset-chars.txt' --exclude '*.md' --exclude '.DS_Store' \
    ./ "$out"/
echo "公開するファイルを $out に集めました（$(find "$out" -type f | wc -l | tr -d ' ') 件）"
