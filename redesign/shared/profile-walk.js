// ぼくのにっきのキャラクターを草原で散歩させる。
// しばらく立ち止まる（idle1・idle2）→ 行き先を決めて歩く（walk1・walk2）→ また立ち止まる、をくり返す。
// 状態は data-state="idle|walk" に書き、どちらの画像を見せるかは CSS が決める。元画像は右向き。
// 触れて止まっている間（data-paused）と、動きを減らす設定のときは動かさない。
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SPEED = 70;   // px/秒
    let x = null, goal = null, idleLeft = 1.5, facing = 1, last = 0;

    const tick = time => {
        const dt = Math.min((time - last) / 1000, 0.05);
        last = time;
        const walker = document.querySelector('.profile-character');
        const room = walker && walker.parentElement ? walker.parentElement.clientWidth - walker.offsetWidth : 0;
        if (walker && room > 0 && !reduce.matches && !walker.hasAttribute('data-paused')) {
            if (x === null) x = room * 0.05;
            x = Math.min(Math.max(x, 0), room);
            if (goal === null) {
                idleLeft -= dt;
                if (idleLeft <= 0) {
                    // 近すぎる行き先は選ばない（その場で足踏みに見えるため）。
                    do goal = Math.random() * room; while (Math.abs(goal - x) < room * 0.2 && room > 200);
                    facing = goal > x ? 1 : -1;
                }
            } else {
                x += Math.sign(goal - x) * Math.min(Math.abs(goal - x), SPEED * dt);
                if (x === goal) {
                    goal = null;
                    idleLeft = 2 + Math.random() * 4;
                }
            }
            walker.dataset.state = goal === null ? 'idle' : 'walk';
            walker.style.left = `${x}px`;
            walker.querySelector('.profile-character-facing').style.transform = `scaleX(${facing})`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(time => { last = time; requestAnimationFrame(tick); });
})();
