// DEPTH DIARY の Player を草原の空で飛ばす。
// 遠めの目的地を選び、曲がるときは減速しながらゆるやかに旋回し、まっすぐ進めるときは加速する。
// 着いたら、ときどきその場でふわっと浮いて休んでから次へ向かう。機首はいつも進む方向へ向ける（元画像は機首が上向き）。
// 受賞歴などほかのページへ移ると、右上の画面の外へ飛び去る。プロフィールに戻ると、外から飛んで戻ってくる。
// 全部スクロール版では、メディア掲載の箱の上（data-perch の中）を左右に行ったり来たりする。どのページを読んでいても出ていかない。
// ほかの歩くキャラクターと同じく箱の線の上にいて、等速で進み、端に着いたらその場で向きを反転する。見出し（「メディア掲載」）の文字には当たらないよう、その右側だけを飛ぶ。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない（動きを減らす設定では、右端で左を向いて止まる）。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const MAX_SPEED = 130;   // px/秒
    const MAX_TURN = 1.3;    // 旋回の速さの上限（rad/秒）
    let pos = null, heading = -Math.PI / 4, turn = 0, speed = 60;
    let target = null, targetAge = 0, rest = 0, clock = 0, last = 0, leaving = false;

    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    // ---- 箱の上で、左右に行ったり来たり ----
    const PERCH_SPEED = 90;  // px/秒（ずっと同じ速さ）
    const perch = { x: null, dir: 1 };
    // 飛ぶ場所と高さが重なる見出しの、文字の右端（飛ぶ場所の左端から測る）。重ならなければ 0。profile-walk.js と同じ。
    const titleRight = way => {
        const title = way.closest('.block')?.querySelector('.window-title');
        if (!title) return 0;
        const w = way.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(title);
        const t = range.getBoundingClientRect();
        return t.bottom > w.top && t.top < w.bottom ? t.right - w.left + 24 : 0;
    };
    const flyPerched = (player, dt) => {
        const way = player.parentElement;
        const half = player.offsetWidth / 2;
        const lo = titleRight(way) + half, hi = way.clientWidth - half;
        // 元画像は機首が上向き。右へは 90° 回し、左へはそれを左右反転する（歩くキャラクターと同じく、上下はそのまま）。
        const show = () => {
            player.style.left = `${perch.x}px`;
            player.querySelector('.profile-depth-player-facing').style.transform = `scaleX(${perch.dir}) rotate(90deg)`;
        };
        if (hi <= lo || reduce.matches) {
            perch.x = Math.max(lo, hi); perch.dir = -1;
            return show();
        }
        if (perch.x === null) perch.x = lo + (hi - lo) * Math.random();
        perch.x = clamp(perch.x, lo, hi);
        if (!player.hasAttribute('data-paused')) {
            perch.x += perch.dir * PERCH_SPEED * dt;
            if (perch.x >= hi) { perch.x = hi; perch.dir = -1; }
            if (perch.x <= lo) { perch.x = lo; perch.dir = 1; }
        }
        show();
    };
    const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
    // 今いる場所から離れた目的地を選ぶ（近いと小さく回り続けて不自然なため）。
    const pickTarget = (w, h) => {
        let next;
        for (let i = 0; i < 12; i++) {
            next = { x: w * (0.06 + Math.random() * 0.88), y: h * (0.08 + Math.random() * 0.84) };
            if (Math.hypot(next.x - pos.x, next.y - pos.y) > Math.min(w, h * 2) * 0.45) break;
        }
        return next;
    };

    const tick = time => {
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        const player = document.querySelector('.profile-depth-player');
        if (player && player.closest('[data-perch]')) {
            flyPerched(player, dt);
            return requestAnimationFrame(tick);
        }
        const box = player && player.parentElement;
        const w = box ? box.clientWidth : 0, h = box ? box.clientHeight : 0;
        const home = document.body.dataset.page === 'about/';
        const exit = { x: w + 220, y: -160 };
        if (w && h && !pos) pos = home ? { x: w * 0.3, y: h * 0.4 } : { ...exit };
        // ほかのページで、もう画面の外にいるなら止めておく。
        const gone = !home && pos && (pos.x > w + 120 || pos.y < -120);
        if (player && w && h && !gone && !reduce.matches && !(home && player.hasAttribute('data-paused'))) {
            clock += dt;
            if (!home) {
                // ほかのページ：右上の画面の外へ飛び去る。
                leaving = true;
                target = exit;
                rest = 0;
                targetAge = 0;
            } else if (leaving || !target) {
                // プロフィールに戻った：外から、飛ぶ帯の中の目的地へ向かって入ってくる。
                leaving = false;
                target = pickTarget(w, h);
                targetAge = 0;
            }

            const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
            const diff = wrap(Math.atan2(target.y - pos.y, target.x - pos.x) - heading);
            targetAge += dt;
            if (rest > 0) {
                // 休憩中：ほぼ止まり、向きもそのまま。
                rest -= dt;
                if (rest <= 0) { target = pickTarget(w, h); targetAge = 0; }
            } else if (dist < 50 || targetAge > 12) {
                if (Math.random() < 0.4) rest = 1 + Math.random() * 1.5;
                else { target = pickTarget(w, h); targetAge = 0; }
            }

            // 旋回は急に切り替えず、目標の旋回速度へ少しずつ寄せる。
            const wantTurn = rest > 0 ? 0 : clamp(diff * 1.6, -MAX_TURN, MAX_TURN);
            turn += (wantTurn - turn) * Math.min(1, dt * 2.5);
            heading = wrap(heading + turn * dt);

            // 正面に目的地があるほど速く、曲がっている途中と到着前は遅く。
            const ahead = Math.max(0, Math.cos(diff));
            const wantSpeed = rest > 0 ? 8 : MAX_SPEED * (0.35 + 0.65 * ahead) * Math.min(1, 0.4 + dist / 220);
            speed += (wantSpeed - speed) * Math.min(1, dt * 1.6);

            pos.x += Math.cos(heading) * speed * dt;
            pos.y += Math.sin(heading) * speed * dt;
            // 浮いている感じを出すため、上下にわずかに揺らす。
            const bob = Math.sin(clock * 2.4) * 3;
            player.style.left = `${pos.x}px`;
            player.style.top = `${pos.y + bob}px`;
            player.querySelector('.profile-depth-player-facing').style.transform = `rotate(${heading + Math.PI / 2}rad)`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(time => { last = time; requestAnimationFrame(tick); });
})();
