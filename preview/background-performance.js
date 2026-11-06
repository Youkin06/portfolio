// 背景は装飾用なので、高密度ディスプレイでも1 CSSピクセル単位で描画する。
window.configureBackgroundSketch = (p, element) => {
    p.pixelDensity(1);
    p.frameRate(20);

    let isVisible = !element;
    const updateAnimation = () => {
        if (isVisible && !document.hidden) {
            p.loop();
        } else {
            p.noLoop();
        }
    };

    if (element) {
        const observer = new IntersectionObserver(entries => {
            isVisible = entries[0].isIntersecting;
            updateAnimation();
        });
        observer.observe(element);
    }

    document.addEventListener('visibilitychange', updateAnimation);
    updateAnimation();
};
