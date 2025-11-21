registerSketch('sk4', function (p) {
  let values = [];
  let numBars = 12;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    for (let i = 0; i < numBars; i++) {
      values.push(p.random(40, 200));
    }
  };

  p.draw = function () {
    p.background('#1e1e1e');

    drawTitle();
    drawBars();
  };

  function drawTitle() {
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(42);
    p.text("Currency Volatility Prototype", p.width / 2, 120);

    p.textSize(20);
    p.fill(200);
    p.text(
      "Each bar represents a shift in currency value across consecutive months.\n" +
      "Prototype shows how the market fluctuates in response to external forces.",
      p.width / 2,
      180
    );
  }

  function drawBars() {
    let barWidth = p.width / (numBars + 2);
    let baseY = p.height - 100;

    for (let i = 0; i < numBars; i++) {
      let h = values[i] + p.sin(p.frameCount * 0.02 + i) * 25;

      p.fill("#4CAF50");
      p.noStroke();
      p.rect(
        (i + 1) * barWidth,
        baseY - h,
        barWidth * 0.6,
        h
      );

      p.fill(255);
      p.textSize(14);
      p.textAlign(p.CENTER, p.TOP);
      p.text(`M${i + 1}`, (i + 1) * barWidth + barWidth * 0.3, baseY + 10);
    }
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
