const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createBackground(section) {
    let onIntersection;
    let onVisibility;
    const window = {};
    const document = {
        hidden: false,
        addEventListener: (_, callback) => { onVisibility = callback; },
    };
    const p = {
        running: true,
        pixelDensity(value) { this.density = value; },
        frameRate(value) { this.fps = value; },
        loop() { this.running = true; },
        noLoop() { this.running = false; },
    };
    class IntersectionObserver {
        constructor(callback) { onIntersection = callback; }
        observe() {}
    }
    const code = fs.readFileSync(path.join(__dirname, '../background-performance.js'), 'utf8');
    vm.runInNewContext(code, { window, document, IntersectionObserver });
    window.configureBackgroundSketch(p, section ? {} : undefined);
    return {
        p,
        intersect(visible) { onIntersection([{ isIntersecting: visible }]); },
        visibility(hidden) { document.hidden = hidden; onVisibility(); },
    };
}

test('section backgrounds only animate when visible in an active tab', () => {
    const background = createBackground(true);
    assert.equal(background.p.density, 1);
    assert.equal(background.p.fps, 20);
    assert.equal(background.p.running, false);
    background.intersect(true);
    assert.equal(background.p.running, true);
    background.visibility(true);
    assert.equal(background.p.running, false);
    background.intersect(false);
    background.visibility(false);
    assert.equal(background.p.running, false);
    background.intersect(true);
    assert.equal(background.p.running, true);
});

test('the fixed background also stops while its tab is hidden', () => {
    const background = createBackground(false);
    assert.equal(background.p.running, true);
    background.visibility(true);
    assert.equal(background.p.running, false);
    background.visibility(false);
    assert.equal(background.p.running, true);
});
