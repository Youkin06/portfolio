// 試作デザイン共通の表示部品。各案はこれを使い、見た目（CSS）と配置だけを変える。

(function () {
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /** トップに大きく出す作品。採用担当が最初に見る3〜4本に絞る。 */
    const FEATURED = ['sausage-smash', 'zelly-swipe', 'pintch-witch', 'boku-no-nikki'];

    /** タグから絞り込み用のカテゴリを作る。 */
    const CATEGORY_RULES = [
        { label: '受賞・選出', keys: ['winner', 'gc-koshien'] },
        { label: 'インターン', keys: ['internship'] },
        { label: 'ジャム・ハッカソン', keys: ['hackathon', 'game-jam', 'unity1week'] },
        { label: 'ストアリリース', keys: ['google-play'] },
        { label: 'VR・体感', keys: ['vr', 'android'] },
        { label: 'チーム開発', keys: ['team-dev'] },
        { label: '個人開発', keys: ['solo-dev'] },
    ];
    const categoriesOf = project => CATEGORY_RULES
        .filter(rule => project.tags.some(tag => rule.keys.includes(tag.key)))
        .map(rule => rule.label);

    const tagsHTML = tags => `<ul class="tags">${tags.map(t => `<li class="tag tag-${esc(t.key)}">${esc(t.label)}</li>`).join('')}</ul>`;

    const thumbUrl = (id, quality = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;

    /**
     * YouTube本体は再生ボタンを押すまで読み込まない（軽量化の要）。
     * 画面には静止画のサムネイルだけを置く。
     */
    const videoFacade = (id, title, quality = 'hqdefault') => id ? `
        <button type="button" class="yt-facade" data-video="${esc(id)}" aria-label="${esc(title)} の動画を再生">
            <img src="${thumbUrl(id, quality)}" alt="" loading="lazy" decoding="async"
                onerror="this.onerror=null;this.src='${thumbUrl(id, 'hqdefault')}'">
            <span class="yt-play" aria-hidden="true"></span>
        </button>` : '<div class="yt-facade yt-empty">No video</div>';

    const KEY_FACTS = ['ジャンル', '開発期間', '開発体制', '担当', '使用技術', '操作説明'];

    /** 作品の詳細（モーダル・ドロワー・ケーススタディで共通）。 */
    const detailHTML = (project, { video = true } = {}) => {
        const facts = project.fields.filter(f => KEY_FACTS.includes(f.label));
        const sections = project.fields.filter(f => !KEY_FACTS.includes(f.label));
        return `
            ${video ? `<div class="detail-video">${videoFacade(project.videoId, project.title, 'maxresdefault')}</div>` : ''}
            <h2 class="detail-title">${esc(project.title)}</h2>
            <p class="detail-summary">${esc(project.summary)}</p>
            ${tagsHTML(project.tags)}
            ${facts.length ? `<dl class="facts">${facts.map(f => `<dt>${esc(f.label)}</dt><dd>${f.html}</dd>`).join('')}</dl>` : ''}
            ${sections.map(f => `<section class="detail-section"><h3>${esc(f.label)}</h3><p>${f.html}</p></section>`).join('')}
            ${project.links.length ? `<div class="detail-links">${project.links.map(l =>
                `<a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}`;
    };

    const starsHTML = rating => `<span class="stars" aria-label="5段階中${rating}">${'●'.repeat(rating)}<span class="stars-off">${'●'.repeat(5 - rating)}</span></span>`;

    const linkHTML = l => {
        const external = /^https?:/.test(l.href);
        // 元の文言に「↗」が付いている場合は二重にしない。
        const label = l.label.replace(/\s*↗\s*$/, '');
        return `<a href="${esc(l.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}${external ? ' ↗' : ''}</a>`;
    };

    // 再生ボタンが押されたら、その場でだけYouTubeを読み込む。
    document.addEventListener('click', event => {
        const facade = event.target.closest('.yt-facade[data-video]');
        if (facade) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${facade.dataset.video}?autoplay=1&rel=0&playsinline=1`;
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            iframe.allowFullscreen = true;
            iframe.title = facade.getAttribute('aria-label') || 'YouTube';
            iframe.className = 'yt-frame';
            facade.replaceWith(iframe);
            return;
        }
        // 本文中の「制作作品：〇〇」リンクは、各案の作品詳細を開く。
        const projectLink = event.target.closest('a[href^="#project-"]');
        if (projectLink) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('open-project', { detail: projectLink.getAttribute('href').slice('#project-'.length) }));
        }
    });

    window.PortfolioUI = { esc, FEATURED, CATEGORY_RULES, categoriesOf, tagsHTML, thumbUrl, videoFacade, detailHTML, starsHTML, linkHTML };
})();
