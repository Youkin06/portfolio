const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const goal = /目標：「([^」]+)」/.exec(read('content.html'))[1];

test('content.html の大見出しは、今の目標', () => {
    const h1 = /<div class="hero-content">\s*<h1[^>]*>([^<]+)<\/h1>/.exec(read('content.html'))[1];
    assert.equal(h1, `${goal}。`);
});

test('JS なしで読める説明と自己紹介の目標は、content.html の目標と同じ', () => {
    for (const file of ['redesign/a-sidebar.html', 'index.html']) {
        const html = read(file);
        const description = /<meta name="description" content="([^"]+)">/.exec(html)[1];
        const noscript = /<noscript>([\s\S]*?)<\/noscript>/.exec(html)[1];
        assert.ok(description.includes(`「${goal}」`), `${file} の description`);
        assert.ok(noscript.includes(`「${goal}」`), `${file} の noscript`);
    }
});
