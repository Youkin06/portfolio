const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

// tools/subset-fonts.py と同じく、コメントの文字は数えない
function visibleChars(text) {
    return text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
}

test('サイトに書いた文字は、すべて切り出したフォントに入っている', () => {
    const subset = new Set(read('fonts/subset-chars.txt'));
    const files = ['content.html', 'redesign/a-sidebar.html', 'redesign/a-skins/white-fill.js',
        ...fs.readdirSync(path.join(root, 'redesign/shared')).filter(name => name.endsWith('.js'))
            .map(name => `redesign/shared/${name}`)];
    for (const name of files) {
        const missing = [...new Set(visibleChars(read(name)))].filter(c => c >= ' ' && !subset.has(c));
        assert.deepEqual(missing, [], `${name} の文字がフォントにありません。python3 tools/subset-fonts.py を実行してください`);
    }
});

test('トップページは Google Fonts を使わず、サイトの中のフォントを読み込む', () => {
    const index = read('index.html');
    assert.match(index, /<link rel="stylesheet" href="fonts\/zen-maru-gothic\.css">/);
    assert.doesNotMatch(index, /fonts\.(googleapis|gstatic)\.com/);
    const css = read('fonts/zen-maru-gothic.css');
    for (const weight of [400, 700, 900]) {
        assert.match(css, new RegExp(`zen-maru-gothic-${weight}\\.woff2`));
        assert.ok(fs.statSync(path.join(root, `fonts/zen-maru-gothic-${weight}.woff2`)).size > 0);
    }
});

test('スキンの CSS が @import でたどる CSS は、先に preload で取りに行く', () => {
    const index = read('index.html');
    for (const name of ['white-common', 'unify-common', 'store', 'left']) {
        assert.match(index, new RegExp(`<link rel="preload" href="redesign/a-skins/${name}\\.css" as="style">`));
    }
});
