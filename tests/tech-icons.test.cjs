const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'redesign/a-sidebar.html'), 'utf8').replace(/\r\n/g, '\n');
const block = page.match(/\/\/ tech-icons: start\n([\s\S]*?)\s*\/\/ tech-icons: end/)[1];
const icons = Object.fromEntries([...block.matchAll(/^\s*(\w+): "([^"]*)",$/gm)].map(m => [m[1], m[2]]));

test('技術スタックのアイコンは、すべて HTML に埋め込んである', () => {
    const stack = page.match(/const TECH_STACK = \[([\s\S]*?)\n {8}\];/)[1];
    const ids = [...stack.matchAll(/\{ id: '([^']+)'/g)].map(m => m[1]);
    assert.ok(ids.length > 0);
    for (const id of ids) {
        assert.ok(icons[id], `${id} のアイコンがありません。python3 tools/inline-tech-icons.py を実行してください`);
    }
});

test('埋め込んだアイコンは、Images/icons/ の SVG と同じ中身', () => {
    const files = fs.readFileSync(path.join(root, 'tools/inline-tech-icons.py'), 'utf8');
    for (const [, id, name] of files.matchAll(/'(\w+)': '([\w/.-]+\.svg)'/g)) {
        const svg = fs.readFileSync(path.join(root, 'Images/icons', name), 'utf8').trim().replace(/\s+/g, ' ');
        const uri = icons[id];
        assert.ok(uri.startsWith('data:image/svg+xml,'));
        assert.equal(decodeURIComponent(uri.slice('data:image/svg+xml,'.length)), svg,
            `${name} が変わっています。python3 tools/inline-tech-icons.py を実行してください`);
        assert.doesNotMatch(uri, /"/);
    }
});
