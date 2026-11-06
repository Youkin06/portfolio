// 上下キーで見えているメニュー項目を選び、そのページへ移動する。
(function () {
    const menu = document.getElementById('menu');
    if (!menu) return;

    document.addEventListener('keydown', event => {
        if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        // 入力欄・開閉ボタン・動画などのキー操作はそのまま使えるようにする。
        if (event.target.closest?.('input, textarea, select, button, summary, video, audio, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"]')) return;

        const links = [...menu.querySelectorAll('.menu-list a[data-key]')]
            .filter(link => link.getClientRects().length);
        if (!links.length) return;
        event.preventDefault();
        const focused = links.indexOf(document.activeElement);
        const current = focused >= 0 ? focused : links.findIndex(link => link.classList.contains('active'));
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const index = current < 0 ? (step > 0 ? 0 : links.length - 1)
            : Math.max(0, Math.min(links.length - 1, current + step));
        const next = links[index];
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: 'nearest' });
        if (index !== current) next.click();
    });
})();
