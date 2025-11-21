// Instance-mode sketch registered as 'sk1'
registerSketch('sk1', function (p) {
  let img;
  let font;

  p.preload = function() {
    img = p.loadImage('./images/stock-background-image.jpg');
    font = p.loadFont('./resources/goldman-latin-400-normal.ttf');
  };

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function() {
    p.background(0);
    
    p.image(img, 0, 0, p.windowWidth, 250);
    p.fill(255);
    p.textSize(50);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont(font);
    p.text('The Forces that Shape the Value of Money', p.windowWidth / 2, 300);

    let bodyText = 'Since the beginning of the modern world, the importance of currency has always stayed the same. What has not stayed the same is the value of any currency. Outside factors like war, policy, and technological advances have changed how society works and more importantly the value of money. We aim to show how the value of currency changes over time and why some large events can create large shifts in economic power. Not only that, but if we compare currencies, what has the most power and how can people invest their money to be the most safe from outside factors.';
    let boxWidth = p.windowWidth * 0.7;
    let boxX = (p.windowWidth - boxWidth) / 2;

    p.textSize(32);
    p.text(bodyText, boxX, 400, boxWidth, 500);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    horizon = p.height / 2;
  };
});

