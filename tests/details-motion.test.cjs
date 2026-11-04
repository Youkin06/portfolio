const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createDetails({ reduced = false, animationSupported = true } = {}) {
    const animations = [];
    let listener;
    let visibleHeight;
    const details = {
        open: false,
        style: { height: '', overflow: '' },
        matches: selector => selector === 'details.exp-more',
        getBoundingClientRect: () => {
            const height = visibleHeight ?? (details.open ? 240 : 28);
            visibleHeight = undefined;
            return { height };
        },
        animate: animationSupported ? (frames, options) => {
            const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
            animations.push(animation);
            return animation;
        } : undefined,
    };
    const summary = { parentElement: details };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../redesign/shared/details-motion.js'), 'utf8'), {
        window: { SKIN: { detailsMotion: true }, matchMedia: () => ({ matches: reduced }) },
        document: { getElementById: () => ({ addEventListener: (type, callback) => { listener = callback; } }) },
    });
    return {
        details, animations,
        setVisibleHeight: height => { visibleHeight = height; },
        click(onSummary = true) {
            const event = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, target: { closest: () => onSummary ? summary : null } };
            listener(event);
            return event;
        },
    };
}

test('details expand and collapse to their measured height, then release the fixed height', () => {
    const page = createDetails();
    page.click();
    assert.equal(page.details.open, true);
    assert.equal(page.animations[0].frames[1].height, '240px');
    page.animations[0].onfinish();
    assert.equal(page.details.style.height, '');
    page.click();
    assert.equal(page.details.open, true, 'content stays visible during collapse');
    assert.equal(page.animations[1].frames[1].height, '28px');
    page.animations[1].onfinish();
    assert.equal(page.details.open, false);
    assert.equal(page.details.style.overflow, '');
});

test('rapid clicks reverse from the visible height and keep the last requested state', () => {
    const page = createDetails();
    page.click();
    page.setVisibleHeight(100);
    page.click();
    assert.equal(page.animations[0].cancelled, true);
    assert.equal(page.animations[0].onfinish, null);
    assert.equal(page.animations[1].frames[0].height, '100px');
    assert.equal(page.animations[1].frames[1].height, '28px');
    page.setVisibleHeight(60);
    page.click();
    assert.equal(page.animations[1].cancelled, true);
    assert.equal(page.animations[2].frames[0].height, '60px');
    assert.equal(page.animations[2].frames[1].height, '240px');
    page.animations[2].onfinish();
    assert.equal(page.details.open, true);
    assert.equal(page.details.style.height, '');
});

test('reduced motion and browsers without animation keep instant, working disclosure', () => {
    for (const options of [{ reduced: true }, { animationSupported: false }]) {
        const page = createDetails(options);
        page.click();
        assert.equal(page.details.open, true);
        page.click();
        assert.equal(page.details.open, false);
        assert.equal(page.animations.length, 0);
    }
});

test('clicking content or links does not toggle the details', () => {
    const page = createDetails();
    const event = page.click(false);
    assert.equal(event.defaultPrevented, false);
    assert.equal(page.animations.length, 0);
    assert.equal(page.details.open, false);
});
