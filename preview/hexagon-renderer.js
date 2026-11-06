/**
 * p5.js を使用してハニカム構造を描画するための共通レンダラー。
 */
const hexagonRenderer = {
    /**
     * 1つの六角形を描画するヘルパー関数
     * @param {p5} p - p5.jsインスタンス
     * @param {number} x - 中心のx座標
     * @param {number} y - 中心のy座標
     * @param {number} hexRadius - 六角形の半径
     */
    drawHexagon: (p, x, y, hexRadius) => {
        p.beginShape();
        // 頂点が真上に来るように、角度の開始を p.PI / 6 (30度) に設定
        for (let i = 0; i < 6; i++) {
            const angle = p.PI / 6 + p.TWO_PI / 6 * i;
            p.vertex(x + p.cos(angle) * hexRadius, y + p.sin(angle) * hexRadius);
        }
        p.endShape(p.CLOSE);
    },

    /**
     * 画面上に配置するすべての六角形の座標とプロパティを計算
     * @param {p5} p - p5.jsインスタンス
     * @param {number} hexRadius - 六角形の半径
     * @param {Array|null} glowColors - 光る色の配列、または単色
     * @returns {Array} - 六角形オブジェクトの配列
     */
    initializeHexagons: (p, hexRadius, glowColors = null) => {
        const hexagons = [];
        const hexWidth = p.sqrt(3) * hexRadius;
        const hexHeight = 2 * hexRadius;

        // 奇数行をずらすため、行の高さを `hexHeight * 3 / 4` にする
        for (let y = 0; y < p.height + hexHeight; y += hexHeight * 3 / 4) {
            for (let x = 0; x < p.width + hexWidth; x += hexWidth) {
                const xOffset = (p.floor(y / (hexHeight * 3 / 4)) % 2 === 1) ? hexWidth / 2 : 0;
                const isGlowing = p.random(1) < 0.1; // 10%の確率で光る
                
                let glowColor = null;
                if (isGlowing) {
                    if (Array.isArray(glowColors)) {
                        glowColor = p.random(glowColors); // 配列からランダムに選択
                    } else {
                        glowColor = glowColors; // 単色をそのまま使用
                    }
                }

                hexagons.push({
                    x: x + xOffset,
                    y: y,
                    isGlowing: isGlowing,
                    glowColor: glowColor,
                    glowOffset: p.random(p.TWO_PI) // 各六角形の明滅タイミングをずらす
                });
            }
        }
        return hexagons;
    }
};

// script.js や他のファイルから参照できるようにグローバルスコープに公開
window.hexagonRenderer = hexagonRenderer;