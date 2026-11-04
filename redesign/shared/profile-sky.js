// プロフィールの草原の空を、見ている人の現在時刻に合わせる。
// 時間帯を html[data-sky] に、太陽と月の位置を CSS 変数に書く（main が描き直されても残るように html に置く）。
(function () {
    const root = document.documentElement;
    // 太陽は5時〜18時、月は18時〜翌5時に、左から右へ弧を描いて動く。
    const arc = (t, prefix) => {
        root.style.setProperty(`--${prefix}-x`, `${8 + 84 * t}%`);
        root.style.setProperty(`--${prefix}-y`, `${88 - 70 * Math.sin(Math.PI * t)}%`);
    };
    const update = () => {
        const now = new Date();
        const h = now.getHours() + now.getMinutes() / 60;
        root.dataset.sky = h >= 5 && h < 7 ? 'dawn'
            : h >= 7 && h < 16 ? 'day'
            : h >= 16 && h < 18 ? 'evening'
            : 'night';
        arc(Math.min(Math.max((h - 5) / 13, 0), 1), 'sun');
        arc(((h + 6) % 24) / 11, 'moon');
    };
    update();
    setInterval(update, 60 * 1000);
})();
