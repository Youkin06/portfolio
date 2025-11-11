/**
 * p5.jsを使用して、ページ全体に静的なハニカム構造の背景を描画します。
 */
const mainSketch = (p) => {
    const hexRadius = 40; // 六角形の半径（大きさ）
    let hexWidth;
    let hexHeight;
    let hexagons = [];
    const glowColors = ['#ff0000', '#ffa500', '#87ceeb', '#adff2f']; // 赤、オレンジ、水色、黄緑

    p.setup = function () {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        // キャンバスを #canvas-container の子要素にする
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvas.parent(canvasContainer);
        }
        canvas.id('background-canvas');

        hexWidth = p.sqrt(3) * hexRadius;
        hexHeight = 2 * hexRadius;

        p.initializeHexagons();
    };

    p.draw = function () {
        // 背景を黒で塗りつぶす
        p.background(0);
        p.noFill();

        // 1. 全ての六角形を基本の灰色で描画
        p.stroke(50); // 灰色
        p.strokeWeight(1);
        for (const hex of hexagons) {
            p.drawHexagon(hex.x, hex.y);
        }

        // 2. 光る設定の六角形を、指定された色で上書き描画
        for (const hex of hexagons) {
            if (!hex.isGlowing) continue;

            // sin関数を使って明滅効果を生成 (値は -1 から 1 の間を変動)
            const pulse = p.sin(p.frameCount * 0.02 + hex.glowOffset);
            
            // pulseの値に応じて、透明度と線の太さを変化させる
            const alpha = p.map(pulse, -1, 1, 50, 200);
            const weight = p.map(pulse, -1, 1, 1, 2.5);

            let c = p.color(hex.glowColor);
            c.setAlpha(alpha);
            p.stroke(c);
            p.strokeWeight(weight);
            p.drawHexagon(hex.x, hex.y);
        }
    };

    // 画面上に配置するすべての六角形の座標を計算
    p.initializeHexagons = function () {
        hexagons = [];

        // 奇数行をずらすため、行の高さを `hexHeight * 3 / 4` にする
        for (let y = 0; y < p.height + hexHeight; y += hexHeight * 3 / 4) {
            for (let x = 0; x < p.width + hexWidth; x += hexWidth) {
                const xOffset = (p.floor(y / (hexHeight * 3 / 4)) % 2 === 1) ? hexWidth / 2 : 0;
                const isGlowing = p.random(1) < 0.1; // 10%の確率で光る
                
                hexagons.push({
                    x: x + xOffset,
                    y: y,
                    isGlowing: isGlowing,
                    glowColor: isGlowing ? p.random(glowColors) : null, // 光るなら色をランダムに選択
                    glowOffset: p.random(p.TWO_PI) // 各六角形の明滅タイミングをずらす
                });
            }
        }
    };

    // ウィンドウサイズが変更されたときに再描画
    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.initializeHexagons();
        // noLoopではないのでredrawは不要
    };

    // 1つの六角形を描画するヘルパー関数
    p.drawHexagon = function (x, y) {
        p.beginShape();
        // 頂点が真上に来るように、角度の開始を p.PI / 6 (30度) に設定
        for (let i = 0; i < 6; i++) {
            const angle = p.PI / 6 + p.TWO_PI / 6 * i;
            p.vertex(x + p.cos(angle) * hexRadius, y + p.sin(angle) * hexRadius);
        }
        p.endShape(p.CLOSE);
    };
};

new p5(mainSketch);