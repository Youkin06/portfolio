// 草原を歩くキャラクター（ぼくのにっき、KamoRogue のカモ）を動かす。
// プロフィールでは、立ち止まる → 行き先を決めて歩く、をくり返す。
// 2体が重ならないよう、ぼくのにっきは草原の左側、カモは右側だけを歩く（zone は草原の幅に対する割合）。
// 受賞歴などほかのページへ移ると、自分の側の画面の端へ歩いて出ていく。プロフィールに戻ると、同じ端から歩いて戻ってくる。
// 状態は data-state="idle|walk" に書き、どの画像を見せるかは CSS が決める。元画像はどちらも右向き。
// ページを移ると草原は描き直されるが、位置はここで覚えているので、続きから動く。
// 全部スクロール版では、箱の上（data-perch の中）を歩く。どのページを読んでいても出ていかない。
// 箱のすぐ上に見出し（「受賞歴」など）があるときは、見出しの文字に当たらないよう、その右側だけを歩く。
// 見出しの右に歩ける場所が残らないとき（スマホのインターンなど）は、箱の右端に立ったままにする。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const walkers = [
        // ぼくのにっき：idle1・idle2 で立ち止まり、walk1・walk2 で歩く。
        { selector: '.profile-character', speed: 70, idle: [2, 6], zone: [0, 0.45], exit: 'left' },
        // カモ：走り回り、ときどき少しだけ止まる。
        { selector: '.profile-kamo', speed: 140, idle: [0.3, 1.2], zone: [0.55, 1], exit: 'right' },
    ].map(w => ({ ...w, x: null, goal: null, idleLeft: 1, facing: 1 }));

    const step = (w, dt, onProfile) => {
        const el = document.querySelector(w.selector);
        if (!el || !el.parentElement) return;
        const perched = Boolean(el.closest('[data-perch]'));
        const home = perched || onProfile;
        const zone = perched ? [0, 1] : w.zone;
        const size = el.offsetWidth;
        const width = el.parentElement.clientWidth;
        // 自分の側で、体ごと収まる左端の範囲。
        let lo = width * zone[0];
        const hi = width * zone[1] - size;
        if (perched) lo = Math.max(lo, titleRight(el.parentElement));
        const room = hi - lo;
        if (perched && room <= 0) {
            w.x = hi; w.goal = null; w.facing = -1;
            el.dataset.state = 'idle';
            el.style.left = `${w.x}px`;
            el.querySelector('[class$="-facing"]').style.transform = `scaleX(${w.facing})`;
            return;
        }
        if (room <= 0) return;
        const offLeft = -size - 30, offRight = width + 30;
        const exitX = w.exit === 'left' ? offLeft : offRight;
        const outside = x => x <= offLeft || x >= offRight;
        const inside = x => x >= lo && x <= hi;
        const somewhere = (a, b) => lo + room * (a + Math.random() * (b - a));

        if (w.x === null) w.x = home ? somewhere(0.1, 0.9) : exitX;
        if (home && el.hasAttribute('data-paused')) return;

        if (!home) {
            // ほかのページ：もう外にいれば何もしない。まだ中なら近い方の端へ。
            if (outside(w.x)) return;
            w.goal = exitX;
        } else if (!inside(w.x) || (w.goal !== null && !inside(w.goal))) {
            // プロフィールに戻った：自分の側の外にいるなら、その中のどこかへ歩いて入ってくる。
            if (w.goal === null || !inside(w.goal)) w.goal = somewhere(0.1, 0.9);
        } else if (w.goal === null) {
            w.idleLeft -= dt;
            if (w.idleLeft <= 0) {
                // 近すぎる行き先は選ばない（その場で足踏みに見えるため）。
                do w.goal = somewhere(0, 1); while (Math.abs(w.goal - w.x) < room * 0.2 && room > 150);
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

    // 歩く場所と高さが重なる見出しの、文字の右端（歩く場所の左端から測る）。重ならなければ 0。
    const titleRight = way => {
        const title = way.closest('.block')?.querySelector('.window-title');
        if (!title) return 0;
        const w = way.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(title);
        const t = range.getBoundingClientRect();
        return t.bottom > w.top && t.top < w.bottom ? t.right - w.left + 24 : 0;
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
