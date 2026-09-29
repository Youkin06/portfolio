const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createPage() {
    const observers = [];
    const mutations = [];
    const listeners = new Map();
    const scripts = [];
    const players = [];
    let modalOpen = false;
    const frames = Array.from({ length: 3 }, (_, index) => ({
        dataset: { videoSrc: `https://www.youtube.com/embed/video${index}?autoplay=1&mute=1&loop=1&playlist=video${index}` },
        surface: {},
        closest() { return this.surface; },
    }));
    const document = {
        hidden: false,
        head: { appendChild: script => scripts.push(script) },
        createElement: () => ({}),
        querySelectorAll: selector => selector.startsWith('iframe') ? frames : [{}],
        querySelector: () => modalOpen ? {} : null,
        addEventListener: (name, callback) => listeners.set(name, callback),
    };
    const window = {};
    class IntersectionObserver {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            observers.push(this);
        }
        observe() {}
        unobserve() {}
        intersect(frame, ratio) {
            this.callback([{ target: frame.surface, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
        }
    }
    class MutationObserver {
        constructor(callback) { mutations.push(callback); }
        observe() {}
    }
    class Player {
        constructor(frame, options) {
            this.frame = frame;
            this.events = options.events;
            this.calls = [];
            players.push(this);
        }
        mute() { this.calls.push('mute'); }
        playVideo() { this.calls.push('play'); }
        pauseVideo() { this.calls.push('pause'); }
        ready() { this.events.onReady({ target: this }); }
    }
    const code = fs.readFileSync(path.join(__dirname, '../video-performance.js'), 'utf8');
    vm.runInNewContext(code, { window, document, location: { origin: 'https://portfolio.example' }, URL, IntersectionObserver, MutationObserver });
    listeners.get('DOMContentLoaded')();
    return {
        frames, scripts, players,
        preload: observers[0], playback: observers[1],
        async apiReady() {
            window.YT = { Player, PlayerState: { PLAYING: 1 } };
            window.onYouTubeIframeAPIReady();
            await Promise.resolve();
        },
        visibility(hidden) {
            document.hidden = hidden;
            listeners.get('visibilitychange')();
        },
        modal(open) {
            modalOpen = open;
            mutations.forEach(callback => callback());
        },
    };
}

test('distant videos have no source; preloading creates one muted, paused player', async () => {
    const page = createPage();
    assert.ok(page.frames.every(frame => !frame.src));
    page.preload.intersect(page.frames[0], 1);
    assert.ok(page.frames[0].src);
    assert.equal(page.frames[1].src, undefined);
    const url = new URL(page.frames[0].src);
    assert.equal(url.searchParams.get('autoplay'), '0');
    assert.equal(url.searchParams.get('origin'), 'https://portfolio.example');
    assert.equal(url.searchParams.get('enablejsapi'), '1');
    assert.equal(url.searchParams.get('playlist'), 'video0');
    await page.apiReady();
    page.players[0].ready();
    assert.deepEqual(page.players[0].calls, ['mute', 'pause']);
});

test('scrolling switches playback without recreating or reloading players', async () => {
    const page = createPage();
    page.playback.intersect(page.frames[0], 1);
    await page.apiReady();
    page.players[0].ready();
    assert.equal(page.players[0].calls.at(-1), 'play');
    const originalSource = page.frames[0].src;
    page.playback.intersect(page.frames[0], 0);
    assert.equal(page.players[0].calls.at(-1), 'pause');
    page.playback.intersect(page.frames[0], 1);
    assert.equal(page.players[0].calls.at(-1), 'play');
    assert.equal(page.frames[0].src, originalSource);
    assert.equal(page.players.length, 1);
    assert.equal(page.scripts.length, 1);
});

test('leaving the viewport before API readiness never starts playback', async () => {
    const page = createPage();
    page.playback.intersect(page.frames[0], 1);
    page.playback.intersect(page.frames[0], 0);
    await page.apiReady();
    const player = page.players[0];
    player.ready();
    assert.deepEqual(player.calls, ['mute', 'pause']);
    player.events.onStateChange({ data: 1, target: player });
    assert.equal(player.calls.at(-1), 'pause');
});

test('hidden tabs and open modals pause videos and preserve viewport restrictions', async () => {
    const page = createPage();
    page.playback.intersect(page.frames[0], 1);
    page.preload.intersect(page.frames[1], 1);
    page.visibility(true);
    await page.apiReady();
    page.players.forEach(player => player.ready());
    assert.ok(page.players.every(player => player.calls.at(-1) === 'pause'));
    page.visibility(false);
    assert.equal(page.players[0].calls.at(-1), 'play');
    assert.equal(page.players[1].calls.at(-1), 'pause');
    page.modal(true);
    assert.ok(page.players.every(player => player.calls.at(-1) === 'pause'));
    page.visibility(true);
    page.modal(false);
    assert.ok(page.players.every(player => player.calls.at(-1) === 'pause'));
    page.visibility(false);
    assert.equal(page.players[0].calls.at(-1), 'play');
    assert.equal(page.players[1].calls.at(-1), 'pause');
});
