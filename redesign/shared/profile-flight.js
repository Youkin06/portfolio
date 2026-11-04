// DEPTH DIARY の Player を草原の空で自由に飛ばす。
// 次の目的地を選んでは少しずつ旋回し、機首をいつも進む方向へ向ける（元画像は機首が上向き）。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SPEED = 110;      // px/秒
    const TURN = 2.2;       // 旋回の速さ（rad/秒）
    let pos = null, heading = -Math.PI / 4, target = null, targetAge = 0, last = 0;

    const pickTarget = (w, h) => ({ x: w * (0.05 + Math.random() * 0.9), y: h * (0.05 + Math.random() * 0.9) });
    const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

    const tick = time => {
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        const player = document.querySelector('.profile-depth-player');
        const box = player && player.parentElement;
        const w = box ? box.clientWidth : 0, h = box ? box.clientHeight : 0;
        if (player && w && h && !reduce.matches && !player.hasAttribute('data-paused')) {
            if (!pos) pos = { x: w * 0.3, y: h * 0.4 };
            pos.x = Math.min(Math.max(pos.x, 0), w);
            pos.y = Math.min(Math.max(pos.y, 0), h);
            // 近づいたら次の目的地へ。旋回しきれず回り続けないよう、6秒たっても着かなければ選び直す。
            targetAge += dt;
            if (!target || targetAge > 6 || Math.hypot(target.x - pos.x, target.y - pos.y) < 60) {
                target = pickTarget(w, h);
                targetAge = 0;
            }
            const want = Math.atan2(target.y - pos.y, target.x - pos.x);
            const diff = wrap(want - heading);
            heading = wrap(heading + Math.sign(diff) * Math.min(Math.abs(diff), TURN * dt));
            pos.x += Math.cos(heading) * SPEED * dt;
            pos.y += Math.sin(heading) * SPEED * dt;
            player.style.left = `${pos.x}px`;
            player.style.top = `${pos.y}px`;
            player.querySelector('.profile-depth-player-facing').style.transform = `rotate(${heading + Math.PI / 2}rad)`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(time => { last = time; requestAnimationFrame(tick); });
})();
