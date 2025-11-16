// ページリロード時に常にトップから表示
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// ページが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

    /* ========================================
     * 0. ローディングアニメーション
     * ======================================== */
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    const text = "YOUKIN";
    const chars = text.split('');
    let delay = 0;

    // スクロールを禁止
    document.body.classList.add('loading');

    chars.forEach((char, index) => {
        const charBox = document.createElement('div');
        charBox.classList.add('char-box');
        charBox.textContent = char;
        loadingText.appendChild(charBox);

        setTimeout(() => {
            charBox.classList.add('visible');
        }, delay);

        delay += 200; // 0.2秒ごとに次の文字を表示
    });

    // アニメーション全体の終了を待つ
    const totalAnimationTime = delay + 1000; // 最後のエフェクトが終わるまでの時間
    setTimeout(() => {
        loadingScreen.classList.add('loaded');
        // スクロールを許可
        document.body.classList.remove('loading');
    }, totalAnimationTime);


    /* ========================================
     * 1. スクロールに応じたナビゲーションバーの表示/非表示 (スクロール停止時に表示)
     * ======================================== */
    const navbar = document.querySelector('.navbar');


    /* ========================================
     * 2. アコーディオン機能 (学歴・経験)
     * ======================================== */
    
    // すべてのアコーディオンのトグル（クリックする部分）を取得
    const accordionToggles = document.querySelectorAll('.accordion-toggle');

    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // クリックされたトグルの親（.accordion）を取得
            const accordionItem = toggle.parentElement;
            
            // 開閉するコンテンツ（.accordion-content）を取得
            const content = accordionItem.querySelector('.accordion-content');

            // .active クラスをトグル（付け外し）
            accordionItem.classList.toggle('active');

            // コンテンツの表示・非表示を切り替え
            if (content.style.maxHeight) {
                // 既に開いている場合 (maxHeightが設定されている) -> 閉じる
                content.style.maxHeight = null;
            } else {
                // 閉じている場合 -> 開く
                // scrollHeight を使って、コンテンツの実際の高さを取得して設定
                content.style.maxHeight = content.scrollHeight + 'px';
            }

            const parentSection = accordionItem.closest('.section-container');
            if (!parentSection) return;

            // アニメーション完了後に一度だけ実行される関数
            const onTransitionEnd = () => {
                const backgroundContainerId = parentSection.querySelector('.section-background-canvas')?.id;
                if (!backgroundContainerId) return;

                const p5Instance = window.p5Instances && window.p5Instances[backgroundContainerId];
                if (p5Instance && typeof p5Instance.windowResized === 'function') {
                    p5Instance.windowResized();
                }

                // 一度実行したらイベントリスナーを削除する
                content.removeEventListener('transitionend', onTransitionEnd);
            };

            // transitionendイベントリスナーを追加
            content.addEventListener('transitionend', onTransitionEnd);
        });
    });

    /* ========================================
     * 3. 作品モーダル (ポップアップ) 機能
     * ======================================== */

    // モーダルを開くトリガー（各作品アイテム）を取得
    const modalTriggers = document.querySelectorAll('.project-item');
    
    // モーダルを閉じるボタン（"×"）をすべて取得
    const closeButtons = document.querySelectorAll('.modal-close');

    // 背景クリックで閉じるためのモーダル本体（背景部分）を取得
    const modals = document.querySelectorAll('.modal');

    // --- モーダルを開く処理 ---
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            // data-modal-target 属性から、対応するモーダルのIDを取得
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if(modal) {
                modal.classList.add('visible'); // .visibleクラスを追加して表示
            }
        });
    });

    // --- モーダルを閉じる処理 (×ボタン) ---
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // クリックされたボタンの親であるモーダルを取得して非表示に
            const modal = button.closest('.modal');
            if(modal) {
                modal.classList.remove('visible'); // .visibleクラスを削除して非表示
            }
        });
    });

    // --- モーダルを閉じる処理 (背景クリック) ---
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            // クリックされたのがモーダルの背景部分（modal本体）かチェック
            if (event.target === modal) {
                modal.classList.remove('visible'); // .visibleクラスを削除して非表示
            }
        });
    });

    /* ========================================
     * 4. スクロールアニメーション
     * ======================================== */

    // アニメーションさせたい要素をすべて取得
    const animatedElements = document.querySelectorAll('.scroll-animate');

    // Intersection Observer のオプション
    const options = {
        root: null, // ビューポートをルートとする
        rootMargin: '0px', // マージンなし
        threshold: 0.2 // 20%見えたら実行
    };

    // Intersection Observer のコールバック関数
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // 要素がビューポートに入った場合
            if (entry.isIntersecting) {
                // visibleクラスを追加してアニメーションを実行
                entry.target.classList.add('visible');
                // 一度表示したら、その要素の監視を停止
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // 各要素を監視
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    /* ========================================
     * 5. プロフィール画像のフリップ効果
     * ======================================== */
    const flipCard = document.querySelector('.profile-image-container');
    if (flipCard) {
        flipCard.addEventListener('click', () => {
            flipCard.classList.toggle('is-flipped');
        });
    }

    /* ========================================
     * 6. 目次表示切り替えボタン機能
     * ======================================== */
    const navbarToggleButton = document.getElementById('navbar-toggle-button');

    // 初期状態でナビゲーションバーを非表示にする
    if (navbar) {
        navbar.classList.add('hidden');
    }

    if (navbar && navbarToggleButton) {
        navbarToggleButton.addEventListener('click', () => {
            // hiddenクラスを付け外しして表示/非表示を切り替える
            navbar.classList.toggle('hidden');
            // ボタン自体のactiveクラスも切り替えて、見た目を変える
            navbarToggleButton.classList.toggle('active');
        });
    }
});

/* ========================================
 * 6. メールアドレスのホバーエフェクト
 * ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // メールアドレスのリンク要素を取得 (href属性が "mailto:" で始まるaタグを想定)
    const emailLink = document.querySelector('a[href^="mailto:"]');

    if (emailLink) {
        // 元の文字色を保持
        const originalColor = window.getComputedStyle(emailLink).color;

        // カーソルが乗った時の処理
        emailLink.addEventListener('mouseover', () => {
            emailLink.style.color = 'red'; // 文字色を赤に変更
        });

        // カーソルが離れた時の処理
        emailLink.addEventListener('mouseout', () => {
            emailLink.style.color = originalColor; // 元の色に戻す
        });
    }
});