// DEPTH DIARY の Player を草原の空で飛ばす。
// 遠めの目的地を選び、曲がるときは減速しながらゆるやかに旋回し、まっすぐ進めるときは加速する。
// 着いたら、ときどきその場でふわっと浮いて休んでから次へ向かう。機首はいつも進む方向へ向ける（元画像は機首が上向き）。
// 受賞歴などほかのページへ移ると、右上の画面の外へ飛び去る。プロフィールに戻ると、外から飛んで戻ってくる。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const MAX_SPEED = 130;   // px/秒
    const MAX_TURN = 1.3;    // 旋回の速さの上限（rad/秒）
    let pos = null, heading = -Math.PI / 4, turn = 0, speed = 60;
    let target = null, targetAge = 0, rest = 0, clock = 0, last = 0, leaving = false;

    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
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
