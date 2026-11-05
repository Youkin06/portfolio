// 試作デザイン共通：本番の index.html から内容を読み取り、扱いやすいデータに変換する。
// 内容の更新は index.html だけで済み、4案すべてに反映される。

(function () {
    const SOURCE_URL = new URL('../index.html', location.href);

    const text = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const resolve = path => (path ? new URL(path, SOURCE_URL).href : '');
    const videoIdFrom = src => {
        const match = /embed\/([\w-]+)/.exec(src || '') || /youtu\.be\/([\w-]+)/.exec(src || '');
        return match ? match[1] : null;
    };

    /** 本文中の相対パス（画像など）を、元ページ基準の絶対パスに直す。 */
    const fixRelative = root => {
        root.querySelectorAll('[src]').forEach(el => el.setAttribute('src', resolve(el.getAttribute('src'))));
        root.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (!href.startsWith('#') && !/^(https?:|mailto:)/.test(href)) a.setAttribute('href', resolve(href));
            if (/^https?:/.test(href)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
        });
        return root;
    };

    const links = root => [...root.querySelectorAll('a[href]')].map(a => ({ href: a.getAttribute('href'), label: text(a) }));

    /** 受賞歴・メディア掲載のような「本文＋リンク」の一覧。 */
    const parseAwardList = accordion => [...accordion.querySelectorAll('.award-item')].map(item => {
        const a = item.querySelector('a');
        return { text: text(item.querySelector('span')), link: a ? { href: a.getAttribute('href'), label: text(a) } : null };
    });

    /** インターン・研究の各枠。 */
    const parseExperienceItems = accordion => [...accordion.querySelectorAll('.experience-item')].map(item => {
        const detail = fixRelative(item.querySelector('.experience-detail-content').cloneNode(true));
        const body = detail.querySelector('.experience-details');
        const img = detail.querySelector('figure img');
        const extraLinks = [...detail.querySelectorAll('.experience-project-link')].map(a => ({
            href: a.getAttribute('href'),
            label: text(a),
        }));
        return {
            role: text(item.querySelector('.experience-role')),
            org: text(item.querySelector('.company-name')),
            period: text(item.querySelector('.period')),
            html: body ? body.innerHTML.trim() : '',
            links: extraLinks,
            // 研究などで紹介動画があるとき（index.html の data-video）。data-video-audio があれば音を出せる。
            // 研究などの使用技術（index.html の data-tech）
            tech: item.getAttribute('data-tech') || '',
            video: item.getAttribute('data-video') ? { src: resolve(item.getAttribute('data-video')), audio: item.hasAttribute('data-video-audio') } : null,
            image: img ? {
                src: img.getAttribute('src'), alt: img.alt,
                width: Number(img.getAttribute('width')) || null,
                height: Number(img.getAttribute('height')) || null,
                caption: text(detail.querySelector('figcaption')),
            } : null,
        };
    });

    /** 作品詳細モーダルを「ラベル：内容」の並びに分解する。 */
    const parseModal = modal => {
        const content = fixRelative(modal.querySelector('.modal-content').cloneNode(true));
        const fields = [];
        let linkList = [];
        [...content.children].forEach(el => {
            if (el.tagName === 'P') {
                const strong = el.querySelector(':scope > strong');
                if (!strong) return;
                const label = text(strong).replace(/[:：]\s*$/, '');
                strong.remove();
                const html = el.innerHTML.replace(/^\s*(<br\s*\/?>\s*)+/, '').trim();
                if (label === 'リンク') return;
                fields.push({ label, html, plain: text(el) });
            } else if (el.tagName === 'UL') {
                linkList = linkList.concat(links(el));
            }
        });
        return { fields, links: linkList };
    };

    const parseProjects = doc => [...doc.querySelectorAll('#projects .project-item')].map((item, index) => {
        const modalId = item.dataset.modalTarget;
        const modal = doc.getElementById(modalId);
        const summaryEl = item.querySelector('.project-description p').cloneNode(true);
        summaryEl.querySelector('.click-for-details')?.remove();
        const tags = [...item.querySelectorAll('.tag')].map(tag => ({
            key: [...tag.classList].find(c => c !== 'tag') || '',
            label: text(tag),
        }));
        const detail = modal ? parseModal(modal) : { fields: [], links: [] };
        const field = label => detail.fields.find(f => f.label === label)?.plain || '';
        return {
            id: item.id ? item.id.replace(/^project-/, '') : modalId.replace(/^modal-/, ''),
            order: index,
            title: text(item.querySelector('h3')),
            summary: text(summaryEl),
            tags,
            videoId: videoIdFrom(item.querySelector('iframe')?.dataset.videoSrc),
            genre: field('ジャンル'),
            period: field('開発期間'),
            team: field('開発体制'),
            role: field('担当'),
            tech: field('使用技術'),
            ...detail,
        };
    });

    const parse = doc => {
        const profile = doc.getElementById('profile');
        const accordions = [...profile.querySelectorAll('.accordion')];
        const byTitle = title => accordions.find(a => text(a.querySelector('.accordion-toggle h3')) === title);
        const about = fixRelative(profile.querySelector('.profile-text .profile-field p').cloneNode(true));

        return {
            hero: {
                tagline: text(doc.querySelector('.hero-content h1')),
                name: text(doc.querySelector('.hero-content p')),
                videoId: videoIdFrom(doc.querySelector('.hero-video-background iframe')?.dataset.videoSrc),
            },
            profile: {
                name: text(profile.querySelector('#name-field p')),
                photo: resolve(profile.querySelector('.flip-card-front img')?.getAttribute('src')),
                pixel: resolve(profile.querySelector('.flip-card-back img')?.getAttribute('src')),
                aboutHtml: about.innerHTML,
                socials: [...profile.querySelectorAll('.social-link-item')].map(a => ({
                    href: a.getAttribute('href'),
                    label: text(a.querySelector('span')),
                    icon: a.querySelector('img')?.getAttribute('src'),
                })),
                emails: [...profile.querySelectorAll('.contact-info a')].map(a => text(a)),
            },
            awards: byTitle('受賞歴') ? parseAwardList(byTitle('受賞歴')) : [],
            media: byTitle('メディア掲載') ? parseAwardList(byTitle('メディア掲載')) : [],
            internships: byTitle('インターン・バイト経験') ? parseExperienceItems(byTitle('インターン・バイト経験')) : [],
            research: byTitle('研究') ? parseExperienceItems(byTitle('研究')) : [],
            history: [...doc.querySelectorAll('#experience .accordion')].map(acc => ({
                title: text(acc.querySelector('h3')),
                html: fixRelative(acc.querySelector('.accordion-content').cloneNode(true)).innerHTML.trim(),
            })),
            skills: [...doc.querySelectorAll('#skills .skill-category')].map(cat => ({
                category: text(cat.querySelector('h3')),
                items: [...cat.querySelectorAll('li')].map(li => ({
                    name: text(li.querySelector('.skill-name')),
                    rating: Number(li.querySelector('.stars')?.dataset.rating || 0),
                })),
            })),
            projects: parseProjects(doc),
        };
    };

    window.loadPortfolio = async () => {
        const response = await fetch(SOURCE_URL, { cache: 'no-cache' });
        const html = await response.text();
        return parse(new DOMParser().parseFromString(html, 'text/html'));
    };
})();
