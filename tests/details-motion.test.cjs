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
        dataset: {},
        querySelector: () => content,
        matches: selector => selector === 'details.exp-more',
    };
    const content = {
        style: { height: '', overflow: '' },
        getBoundingClientRect: () => {
            const height = visibleHeight ?? (details.open ? 212 : 0);
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
        details, content, animations,
        setVisibleHeight: height => { visibleHeight = height; },
        click(onSummary = true) {
            const event = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, target: { closest: () => onSummary ? summary : null } };
            listener(event);
            return event;
        },
    };
}

test('only the content expands and collapses below the stationary summary', () => {
    const page = createDetails();
    page.click();
    assert.equal(page.details.open, true);
    assert.equal(page.details.dataset.expanded, 'true');
    assert.equal(page.animations[0].frames[0].height, '0px');
    assert.equal(page.animations[0].frames[1].height, '212px');
    assert.equal(page.content.style.overflow, 'hidden');
    assert.equal(page.details.style, undefined, 'the details container is never resized or clipped');
    page.animations[0].onfinish();
    assert.equal(page.content.style.height, '');
    assert.equal(page.details.dataset.expanded, undefined);
    page.click();
    assert.equal(page.details.open, true, 'content stays visible during collapse');
    assert.equal(page.details.dataset.expanded, 'false', 'arrow starts closing immediately');
    assert.equal(page.animations[1].frames[1].height, '0px');
    page.animations[1].onfinish();
    assert.equal(page.details.open, false);
    assert.equal(page.content.style.overflow, '');
    assert.equal(page.details.dataset.expanded, undefined);
});

test('rapid clicks reverse from the visible height and keep the last requested state', () => {
    const page = createDetails();
    page.click();
    page.setVisibleHeight(100);
    page.click();
    assert.equal(page.animations[0].cancelled, true);
    assert.equal(page.animations[0].onfinish, null);
    assert.equal(page.animations[1].frames[0].height, '100px');
    assert.equal(page.animations[1].frames[1].height, '0px');
    page.setVisibleHeight(60);
    page.click();
    assert.equal(page.animations[1].cancelled, true);
    assert.equal(page.animations[2].frames[0].height, '60px');
    assert.equal(page.animations[2].frames[1].height, '212px');
    page.animations[2].onfinish();
    assert.equal(page.details.open, true);
    assert.equal(page.content.style.height, '');
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

test('opening one item closes the other open item', () => {
    let listener;
    const animations = [];
    const makeItem = () => {
        const item = { open: false, dataset: {}, matches: selector => selector === 'details.exp-more' };
        item.content = {
            style: { height: '', overflow: '' },
            getBoundingClientRect: () => ({ height: item.open ? 120 : 0 }),
            animate: frames => { const a = { frames, cancel() {} }; animations.push(a); return a; },
        };
        item.summary = { parentElement: item, click: () => listener(clickOn(item)) };
        item.querySelector = selector => selector === 'summary' ? item.summary : item.content;
        return item;
    };
    const clickOn = item => ({ button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, target: { closest: () => item.summary } });
    const first = makeItem(), second = makeItem();
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../redesign/shared/details-motion.js'), 'utf8'), {
        window: { SKIN: { detailsMotion: true }, matchMedia: () => ({ matches: false }) },
        document: { getElementById: () => ({
            addEventListener: (type, callback) => { listener = callback; },
            querySelectorAll: () => [first, second],
        }) },
    });
    listener(clickOn(first));
    animations[0].onfinish();
    assert.equal(first.open, true);
    listener(clickOn(second));
    assert.equal(first.dataset.expanded, 'false', 'the first item starts closing');
    assert.equal(second.dataset.expanded, 'true');
    animations.forEach(a => a.onfinish && a.onfinish());
    assert.equal(first.open, false);
    assert.equal(second.open, true);
});
