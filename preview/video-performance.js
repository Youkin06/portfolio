document.addEventListener('DOMContentLoaded', () => {
    const frames = [...document.querySelectorAll('iframe[data-video-src]')];
    const states = frames.map(frame => ({
        frame,
        surface: frame.closest('.hero-section, .video-container'),
        visible: false,
        loaded: false,
        ready: false,
        player: null,
    }));
    const statesBySurface = new Map(states.map(state => [state.surface, state]));
    let apiPromise;

    const loadYouTubeApi = () => {
        if (window.YT?.Player) return Promise.resolve(window.YT);
        if (apiPromise) return apiPromise;

        apiPromise = new Promise(resolve => {
            const previousCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previousCallback?.();
                resolve(window.YT);
            };
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
        return apiPromise;
    };

    const shouldPlay = state => state.visible && !document.hidden &&
        !document.querySelector('.modal.visible');

    const updatePlayback = state => {
        if (!state.ready) return;
        if (shouldPlay(state)) {
            state.player.playVideo();
        } else {
            state.player.pauseVideo();
        }
    };

    const loadVideo = state => {
        if (state.loaded) return;
        state.loaded = true;

        const url = new URL(state.frame.dataset.videoSrc);
        // 先読みした動画は、画面内に入るまで再生しない。
        url.searchParams.set('autoplay', '0');
        url.searchParams.set('enablejsapi', '1');
        url.searchParams.set('playsinline', '1');
        url.searchParams.set('origin', location.origin);
        state.frame.src = url.href;

        loadYouTubeApi().then(api => {
            if (!api) return;
            state.player = new api.Player(state.frame, {
                events: {
                    onReady: event => {
                        state.player = event.target;
                        state.ready = true;
                        state.player.mute();
                        updatePlayback(state);
                    },
                    onStateChange: event => {
                        // 読み込み中に画面外へ移動した場合も、遅れて再生させない。
                        if (event.data === api.PlayerState.PLAYING && !shouldPlay(state)) {
                            event.target.pauseVideo();
                        }
                    },
                },
            });
        });
    };

    const preloadObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            loadVideo(statesBySurface.get(entry.target));
            preloadObserver.unobserve(entry.target);
        });
    }, { rootMargin: '600px 0px' });

    const playbackObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const state = statesBySurface.get(entry.target);
            state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
            if (state.visible) loadVideo(state);
            updatePlayback(state);
        });
    }, { threshold: [0, 0.1] });

    states.forEach(state => {
        preloadObserver.observe(state.surface);
        playbackObserver.observe(state.surface);
    });

    const updateAllPlayback = () => states.forEach(updatePlayback);
    document.addEventListener('visibilitychange', updateAllPlayback);

    // 詳細を読んでいる間は、背面の動画も停止する。
    const modalObserver = new MutationObserver(updateAllPlayback);
    document.querySelectorAll('.modal').forEach(modal => {
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
});
