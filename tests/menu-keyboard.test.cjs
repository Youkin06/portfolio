const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function setup() {
    let listener;
    const document = { activeElement: null, addEventListener: (_, callback) => { listener = callback; } };
    const links = Array.from({ length: 4 }, (_, index) => ({
        active: index === 0, hidden: index === 1, clicks: 0,
        classList: { contains: () => links[index].active },
        getClientRects() { return this.hidden ? [] : [{}]; },
        focus() { document.activeElement = this; },
        scrollIntoView() {},
        click() { this.clicks++; links.forEach(link => { link.active = link === this; }); },
    }));
    document.getElementById = () => ({ querySelectorAll: () => links });
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../redesign/shared/menu-keyboard.js'), 'utf8'), { document });
    return { links, document, key(key, extra = {}) {
        const event = { key, target: { closest: () => null }, preventDefault() { this.defaultPrevented = true; }, ...extra };
        listener(event);
        return event;
    } };
}

test('arrows select adjacent visible links and stop at each end', () => {
    const page = setup();
    assert.equal(page.key('ArrowUp').defaultPrevented, true);
    assert.equal(page.links[0].clicks, 0);
    page.key('ArrowDown');
    assert.equal(page.document.activeElement, page.links[2]);
    assert.equal(page.links[2].active, true);
    page.key('ArrowDown');
    page.key('ArrowDown');
    assert.equal(page.links[3].clicks, 1);
    page.key('ArrowUp');
    assert.equal(page.links[2].clicks, 2);
});

test('rapid keys continue from focus before the route updates its active link', () => {
    const page = setup();
    page.key('ArrowDown');
    page.links[2].active = false;
    page.links[0].active = true;
    page.key('ArrowDown');
    assert.equal(page.document.activeElement, page.links[3]);
});

test('native controls, modified keys, composition and other keys stay untouched', () => {
    const page = setup();
    for (const extra of [{ target: { closest: () => ({}) } }, { altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { isComposing: true }, { defaultPrevented: true }]) {
        page.key('ArrowDown', extra);
    }
    page.key('ArrowLeft');
    assert.equal(page.links.every(link => link.clicks === 0), true);
});
