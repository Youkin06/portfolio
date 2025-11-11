/**
 * p5.jsを使用して、SKILLSセクション専用のハニカム構造の背景を描画します。
 */

const skillsSketch = (p) => {
    const hexRadius = 40;
    let hexWidth;
    let hexHeight;
    let hexagons = [];
    const glowColor = '#87ceeb'; // SKILLSセクションのテーマカラー

    p.setup = function () {
        const container = document.getElementById('skills-background');
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container); // キャンバスをコンテナの子要素にする
        canvas.style('z-index', '0');

        hexWidth = p.sqrt(3) * hexRadius;
        hexHeight = 2 * hexRadius;

        p.initializeHexagons();
    };

    p.draw = function () {
        p.background(26, 26, 26); // 背景色を灰色 (#1a1a1a) に設定
        p.noFill();

        // 1. 通常の六角形を描画
        for (const hex of hexagons) {
            p.stroke(0); // 線の色を黒に設定
            p.strokeWeight(1);
            p.drawHexagon(hex.x, hex.y);
        }

        // 2. ランダムに光る水色の六角形を描画
        for (const hex of hexagons) {
            if (!hex.isGlowing) continue;

            const pulse = p.sin(p.frameCount * 0.02 + hex.glowOffset);
            const alpha = p.map(pulse, -1, 1, 50, 200);
            const weight = p.map(pulse, -1, 1, 1, 2.5);
            let c = p.color(glowColor);
            c.setAlpha(alpha);
            p.stroke(c);
            p.strokeWeight(weight);
            p.drawHexagon(hex.x, hex.y);
        }
    };

    p.initializeHexagons = function () {
        hexagons = [];
        for (let y = 0; y < p.height + hexHeight; y += hexHeight * 3 / 4) {
            for (let x = 0; x < p.width + hexWidth; x += hexWidth) {
                const xOffset = (p.floor(y / (hexHeight * 3 / 4)) % 2 === 1) ? hexWidth / 2 : 0;
                const isGlowing = p.random(1) < 0.15; // 15%の確率で光る
                hexagons.push({ x: x + xOffset, y: y, isGlowing: isGlowing, glowOffset: p.random(p.TWO_PI) });
            }
        }
    };

    p.drawHexagon = function (x, y) {
        p.beginShape();
        for (let i = 0; i < 6; i++) {
            const angle = p.PI / 6 + p.TWO_PI / 6 * i;
            p.vertex(x + hexRadius * p.cos(angle), y + hexRadius * p.sin(angle));
        }
        p.endShape(p.CLOSE);
    };
};

// DOMが読み込まれてからインスタンスを生成
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('skills-background')) {
        new p5(skillsSketch);
    }
});