/**
 * p5.jsを使用して、各セクションに静的なハニカム構造の背景を描画します。
 * @param {string} containerId - キャンバスを配置するコンテナのID
 * @param {string} glowColor - 六角形が光る色
 */
const createSectionSketch = (containerId, glowColor) => {
    
    const sketch = (p) => {
        const hexRadius = 40;
        let hexWidth;
        let hexHeight;
        let hexagons = [];

        p.setup = function () {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container with id ${containerId} not found.`);
                p.noLoop();
                return;
            }
            const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
            canvas.parent(container);

            hexWidth = p.sqrt(3) * hexRadius;
            hexHeight = 2 * hexRadius;

            p.initializeHexagons();
        };

        p.draw = function () {
            p.background(42, 42, 42); // 背景色を灰色 (#2a2a2a) に設定
            p.noFill();

            // 1. 全ての六角形を基本の黒線で描画
            p.stroke(0); // 線の色を黒に設定
            p.strokeWeight(1);
            for (const hex of hexagons) {
                p.drawHexagon(hex.x, hex.y);
            }

            // 2. 光る設定の六角形を、指定された色で上書き描画
            if (glowColor) {
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
            }
        };

        p.initializeHexagons = function () {
            hexagons = [];
            for (let y = 0; y < p.height + hexHeight; y += hexHeight * 3 / 4) {
                for (let x = 0; x < p.width + hexWidth; x += hexWidth) {
                    const xOffset = (p.floor(y / (hexHeight * 3 / 4)) % 2 === 1) ? hexWidth / 2 : 0;
                    const isGlowing = p.random(1) < 0.1; // 10%の確率で光る
                    hexagons.push({ x: x + xOffset, y: y, isGlowing: isGlowing, glowOffset: p.random(p.TWO_PI) });
                }
            }
        };

        p.drawHexagon = function (x, y) {
            p.beginShape();
            for (let i = 0; i < 6; i++) {
                const angle = p.PI / 6 + p.TWO_PI / 6 * i;
                p.vertex(x + p.cos(angle) * hexRadius, y + p.sin(angle) * hexRadius);
            }
            p.endShape(p.CLOSE);
        };
    };

    new p5(sketch);
};

// DOMが読み込まれたら、各セクションのスケッチを生成
document.addEventListener('DOMContentLoaded', () => {
    createSectionSketch('profile-background', '#ff0000');    // PROFILE: 赤
    createSectionSketch('projects-background', '#adff2f');   // PROJECTS: 黄緑
    createSectionSketch('experience-background', '#ffa500'); // EXPERIENCE: オレンジ
    createSectionSketch('skills-background', '#87ceeb');     // SKILLS: 水色
});