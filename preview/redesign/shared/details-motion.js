// summary を固定したまま、本文だけをその下で滑らかに開閉する。
// 開くのは一度に1つだけ。新しく開くと、ほかに開いている項目は同じ動きで閉じる。
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
        const content = details.querySelector('.exp-content');
        if (!content) return;
        event.preventDefault();

        const previous = states.get(details);
        const opening = previous ? !previous.opening : !details.open;
        const original = previous?.original || { height: content.style.height, overflow: content.style.overflow };
        if (opening) {
            main.querySelectorAll?.('details.exp-more').forEach(other => {
                const otherOpen = other.dataset.expanded ? other.dataset.expanded === 'true' : other.open;
                if (other !== details && otherOpen) other.querySelector('summary')?.click();
            });
        }
        // 連打時は、その時点で見えている高さから逆向きに動かす。
        const from = details.open ? content.getBoundingClientRect().height : 0;
        // 閉じる間も open は残るため、矢印には操作直後の向きを別に伝える。
        details.dataset.expanded = String(opening);
        if (previous) {
            previous.animation.onfinish = null;
            previous.animation.cancel();
            states.delete(details);
        }

        const finish = () => {
            details.open = opening;
            content.style.height = original.height;
            content.style.overflow = original.overflow;
            delete details.dataset.expanded;
            states.delete(details);
        };
        if (reducedMotion.matches || typeof content.animate !== 'function') {
            finish();
            return;
        }

        content.style.height = original.height;
        details.open = true;
        const to = opening ? content.getBoundingClientRect().height : 0;
        // 本文だけを切り取り、summary の位置と余白は動かさない。
        content.style.height = `${from}px`;
        content.style.overflow = 'hidden';
        const animation = content.animate(
            [{ height: `${from}px` }, { height: `${to}px` }],
            { duration: 400, easing: 'cubic-bezier(.2, .8, .2, 1)' }
        );
        states.set(details, { opening, animation, original });
        animation.onfinish = finish;
    });
})();
