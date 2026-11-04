const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup() {
    const handlers = {};
    let outsideClick;
    const main = {
        addEventListener(type, handler) { handlers[type] = handler; },
        querySelectorAll() { return guest.paused ? [guest] : []; },
    };
    const guest = {
        paused: false,
        toggleAttribute(_, paused) { this.paused = paused; },
        contains(target) { return target === trigger || target === link; },
        querySelector() { return trigger; },
    };
    const trigger = {
        expanded: 'false',
        closest(selector) { return selector === '.profile-guest-trigger' ? trigger : guest; },
        setAttribute(_, value) { this.expanded = value; },
        blur() { handlers.focusout({ target: trigger, relatedTarget: null }); },
    };
    const link = {
        closest(selector) { return selector === '[data-profile-guest]' ? guest : null; },
        blur() { handlers.focusout({ target: link, relatedTarget: null }); },
    };
    const document = {
        getElementById() { return main; },
        addEventListener(_, handler) { outsideClick = handler; },
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../redesign/shared/profile-guests.js'), 'utf8'), { document, WeakMap });
    return { guest, trigger, link, fire(type, extra = {}) { handlers[type]({ target: trigger, relatedTarget: null, ...extra }); }, outside() { outsideClick({ target: {} }); } };
}

test('hover stops a guest and moving onto its project link keeps it stopped', () => {
    const p = setup();
    p.fire('pointerover', { pointerType: 'mouse' });
    assert.equal(p.guest.paused, true);
    assert.equal(p.trigger.expanded, 'true');
    p.fire('pointerout', { relatedTarget: p.link });
    assert.equal(p.guest.paused, true);
    p.fire('pointerout', { target: p.link });
    assert.equal(p.guest.paused, false);
    assert.equal(p.trigger.expanded, 'false');
});

test('keyboard focus keeps the project link available until focus leaves the guest', () => {
    const p = setup();
    p.fire('focusin');
    p.fire('focusout', { relatedTarget: p.link });
    assert.equal(p.guest.paused, true);
    p.fire('focusout', { target: p.link });
    assert.equal(p.guest.paused, false);
});

test('touch taps toggle stopping without a lingering simulated hover or focus', () => {
    const p = setup();
    p.fire('pointerover', { pointerType: 'touch' });
    assert.equal(p.guest.paused, false);
    p.fire('focusin');
    p.fire('click');
    assert.equal(p.guest.paused, true);
    p.fire('click');
    assert.equal(p.guest.paused, false);
});

test('project links keep normal navigation and an outside tap releases a held guest', () => {
    const p = setup();
    p.fire('focusin');
    p.fire('click');
    p.fire('click', { target: p.link });
    assert.equal(p.guest.paused, true);
    p.outside();
    assert.equal(p.guest.paused, false);
});

test('Escape hides the link and resumes the character', () => {
    const p = setup();
    p.fire('focusin');
    p.fire('pointerover', { pointerType: 'mouse' });
    p.fire('click');
    let prevented = false;
    p.fire('keydown', { key: 'Escape', preventDefault() { prevented = true; } });
    assert.equal(p.guest.paused, false);
    assert.equal(prevented, true);
});
