// 草原を歩くキャラクター（ぼくのにっき、KamoRogue のカモ）を動かす。
// プロフィールでは、立ち止まる → 行き先を決めて歩く、をくり返す。
// 受賞歴などほかのページへ移ると、近い方の画面の端へ歩いて出ていく。プロフィールに戻ると、端から歩いて戻ってくる。
// 状態は data-state="idle|walk" に書き、どの画像を見せるかは CSS が決める。元画像はどちらも右向き。
// ページを移ると草原は描き直されるが、位置はここで覚えているので、続きから動く。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const walkers = [
        // ぼくのにっき：idle1・idle2 で立ち止まり、walk1・walk2 で歩く。
        { selector: '.profile-character', speed: 70, idle: [2, 6], start: 0.05 },
        // カモ：走り回り、ときどき少しだけ止まる。
        { selector: '.profile-kamo', speed: 140, idle: [0.3, 1.2], start: 0.6 },
    ].map(w => ({ ...w, x: null, goal: null, idleLeft: 1, facing: 1 }));

    const step = (w, dt, home) => {
        const el = document.querySelector(w.selector);
        if (!el || !el.parentElement) return;
        const size = el.offsetWidth;
        const room = el.parentElement.clientWidth - size;
        if (room <= 0) return;
        const offLeft = -size - 30, offRight = room + size + 30;
        const outside = x => x <= offLeft || x >= offRight;
        const inside = x => x >= 0 && x <= room;

        if (w.x === null) w.x = home ? room * w.start : offLeft;
        if (home && el.hasAttribute('data-paused')) return;

        if (!home) {
            // ほかのページ：もう外にいれば何もしない。まだ中なら近い方の端へ。
            if (outside(w.x)) return;
            if (w.goal === null || !outside(w.goal)) w.goal = w.x < room / 2 ? offLeft : offRight;
        } else if (!inside(w.x) || (w.goal !== null && !inside(w.goal))) {
            // プロフィールに戻った：画面の外にいるなら、中のどこかへ歩いて入ってくる。
            if (w.goal === null || !inside(w.goal)) w.goal = room * (0.1 + Math.random() * 0.8);
        } else if (w.goal === null) {
            w.idleLeft -= dt;
            if (w.idleLeft <= 0) {
                // 近すぎる行き先は選ばない（その場で足踏みに見えるため）。
                do w.goal = Math.random() * room; while (Math.abs(w.goal - w.x) < room * 0.2 && room > 200);
            }
        }

        if (w.goal !== null) {
            w.facing = w.goal > w.x ? 1 : -1;
            const speed = home ? w.speed : w.speed * 1.6;
            w.x += Math.sign(w.goal - w.x) * Math.min(Math.abs(w.goal - w.x), speed * dt);
            if (w.x === w.goal) {
                w.goal = null;
                w.idleLeft = w.idle[0] + Math.random() * (w.idle[1] - w.idle[0]);
            }
        }
        el.dataset.state = w.goal === null ? 'idle' : 'walk';
        el.style.left = `${w.x}px`;
        el.querySelector('[class$="-facing"]').style.transform = `scaleX(${w.facing})`;
    };

    let last = 0;
    const tick = time => {
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        if (!reduce.matches) {
            const home = document.body.dataset.page === 'about/';
            walkers.forEach(w => step(w, dt, home));
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(time => { last = time; requestAnimationFrame(tick); });
})();
