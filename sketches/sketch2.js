// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background('#414141');

    drawTimeLine();
    writeNarrative();
  };

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };

  function drawTimeLine() {
    p.stroke(255);
    p.line(p.windowWidth / 2 - 325, p.windowHeight / 2, p.windowWidth / 2 + 575, p.windowHeight / 2);
    p.line(p.windowWidth / 2 - 325, p.windowHeight / 2 - 15, p.windowWidth / 2 - 325, p.windowHeight / 2 + 15);
    p.line(p.windowWidth / 2 + 575, p.windowHeight / 2 - 15, p.windowWidth / 2 + 575, p.windowHeight / 2 + 15);
  }

  function writeNarrative() {

  }
});
