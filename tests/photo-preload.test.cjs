const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('先読みする顔写真は、content.html の顔写真と同じ画像', () => {
    const photo = /class="flip-card-front"[\s\S]*?<img src="([^"]+)"/.exec(read('content.html'))[1];
    const preload = /<link rel="preload" as="image" href="\.\.\/([^"]+)"/.exec(read('redesign/a-sidebar.html'))[1];
    assert.equal(preload, photo);
});
