// 再描画されるプロフィール内でも、キャラクターと頭上のリンクを一緒に扱う。
(function () {
    const main = document.getElementById('main');
    if (!main) return;
    const states = new WeakMap();
    const stateOf = guest => {
        if (!states.has(guest)) states.set(guest, { hover: false, focus: false, held: false });
        return states.get(guest);
    };
    const sync = guest => {
        const state = stateOf(guest);
        const paused = state.hover || state.focus || state.held;
        guest.toggleAttribute('data-paused', paused);
        guest.querySelector('.profile-guest-trigger').setAttribute('aria-expanded', String(paused));
        if (paused) keepInside(guest.querySelector('.profile-guest-link'));
    };
    // キャラクターが画面の端にいても、頭の上のボタンが画面からはみ出さないよう横にずらす。
    const keepInside = link => {
        if (!link) return;
        link.style.removeProperty('--guest-shift');
        const rect = link.getBoundingClientRect();
        const margin = 8;
        const shift = Math.max(margin - rect.left, Math.min(0, window.innerWidth - margin - rect.right));
        if (shift) link.style.setProperty('--guest-shift', `${Math.round(shift)}px`);
    };
    const track = (event, key, active) => {
        const guest = event.target.closest('[data-profile-guest]');
        if (!guest || guest.contains(event.relatedTarget)) return;
        if (key === 'hover' && event.pointerType === 'touch') return;
        stateOf(guest)[key] = active;
        sync(guest);
    };
    main.addEventListener('pointerover', event => track(event, 'hover', true));
    main.addEventListener('pointerout', event => track(event, 'hover', false));
    main.addEventListener('focusin', event => track(event, 'focus', true));
    main.addEventListener('focusout', event => track(event, 'focus', false));
    main.addEventListener('click', event => {
        const trigger = event.target.closest('.profile-guest-trigger');
        if (!trigger) return;
        const guest = trigger.closest('[data-profile-guest]');
        const state = stateOf(guest);
        state.held = !state.held;
        // タップ後にボタンのフォーカスだけで停止が残らないようにする。
        if (!state.held) trigger.blur();
        sync(guest);
    });
    main.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const guest = event.target.closest('[data-profile-guest]');
        if (!guest) return;
        const state = stateOf(guest);
        state.hover = state.focus = state.held = false;
        event.target.blur();
        sync(guest);
        event.preventDefault();
    });
    document.addEventListener('click', event => {
        main.querySelectorAll('[data-profile-guest][data-paused]').forEach(guest => {
            if (guest.contains(event.target)) return;
            const state = stateOf(guest);
            state.held = false;
            state.focus = false;
            if (guest.contains(document.activeElement)) document.activeElement.blur();
            sync(guest);
        });
    });
})();
