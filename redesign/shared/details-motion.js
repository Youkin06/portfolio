// details 本来の見た目・キーボード操作を保ち、高さだけを滑らかに開閉する。
(function () {
    if (!window.SKIN?.detailsMotion) return;
    const main = document.getElementById('main');
    if (!main) return;
    const states = new WeakMap();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    main.addEventListener('click', event => {
        const summary = event.target.closest('summary');
        const details = summary?.parentElement;
        if (!details?.matches('details.exp-more') || event.defaultPrevented || event.button !== 0) return;
        event.preventDefault();

        const previous = states.get(details);
        const opening = previous ? !previous.opening : !details.open;
        const original = previous?.original || { height: details.style.height, overflow: details.style.overflow };
        // 連打時は、その時点で見えている高さから逆向きに動かす。
        const from = details.getBoundingClientRect().height;
        if (previous) {
            previous.animation.onfinish = null;
            previous.animation.cancel();
            states.delete(details);
        }

        const finish = () => {
            details.open = opening;
            details.style.height = original.height;
            details.style.overflow = original.overflow;
            states.delete(details);
        };
        if (reducedMotion.matches || typeof details.animate !== 'function') {
            finish();
            return;
        }

        details.style.height = original.height;
        details.open = opening;
        const to = details.getBoundingClientRect().height;
        // 閉じる間も本文を描画し、アニメーションが終わってから open を外す。
        details.open = true;
        details.style.height = `${from}px`;
        details.style.overflow = 'hidden';
        const animation = details.animate(
            [{ height: `${from}px` }, { height: `${to}px` }],
            { duration: 240, easing: 'cubic-bezier(.2, .8, .2, 1)' }
        );
        states.set(details, { opening, animation, original });
        animation.onfinish = finish;
    });
})();
