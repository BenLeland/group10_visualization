// Instance-mode sketch registered as 'sk1'
registerSketch('sk1', function (p) {

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background(255);
    p.fill(0);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Narrative', p.width / 2, p.height / 2);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    horizon = p.height / 2;
  };
});

