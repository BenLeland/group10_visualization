// Instance-mode sketch for tab 2
registerSketch('sk2', function (p) {
  let timeTicks;
  let bars;
  let events;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    timeTicks = [];
    populateTimeTicks();
    bars = [];
    populateBars();
    events = [];
    populateEvents();
  };

  p.draw = function () {
    p.background('#414141');

    drawTimeLine();
    writeNarrative();
    drawTimeTicks();
    drawBars();
    drawEvents();
  };

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };

  function drawTimeLine() {
    p.stroke(255);
    p.strokeWeight(1);
    p.line(p.windowWidth / 2 - 325, p.windowHeight / 2, p.windowWidth / 2 + 575, p.windowHeight / 2);
    p.line(p.windowWidth / 2 - 325, p.windowHeight / 2 - 15, p.windowWidth / 2 - 325, p.windowHeight / 2 + 15);
    p.line(p.windowWidth / 2 + 575, p.windowHeight / 2 - 15, p.windowWidth / 2 + 575, p.windowHeight / 2 + 15);
  }

  function writeNarrative() {
    p.fill(255);
    p.strokeWeight(0);
    p.textSize(20);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Currency Value Over Time', 150, p.windowHeight / 2 - 200);

    let summary = 'Currency shifts value over time due to various factors including economic policies, technological advancements, and geopolitical events. This timeline illustrates significant moments that have influenced the value of money throughout history. When the value increased we color it green and when it decreased it is red. Significant points are labeled as dots on the timeline.';
    p.fill(200);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(12);
    p.text(summary, 15, p.windowHeight / 2 - 150, 285);
  }

  function populateTimeTicks() {
    let count = Math.floor(p.random(15, 21));

    let startX = p.windowWidth / 2 - 325;
    let endX = p.windowWidth / 2 + 575;
    let spacing = (endX - startX) / (count - 1);

    for (let i = 0; i < count; i++) {
      timeTicks.push(startX + i * spacing);
    }
  }

  function drawTimeTicks() {
    for (let i = 0; i < timeTicks.length; i++) {
      let tickX = timeTicks[i];

      p.stroke(255);
      p.strokeWeight(1);
      p.line(tickX, p.windowHeight / 2 - 10, tickX, p.windowHeight / 2 + 10);
    }
  }

  function populateBars() {
    for (let i = 0; i < timeTicks.length - 1; i++) {
      let x1 = timeTicks[i];
      let x2 = timeTicks[i + 1];
      let midX = (x1 + x2) / 2;

      let change = p.random(-20, 20);

      bars.push({x: midX, y: p.windowHeight / 2, change: change});
    }
  }

  function drawBars() {
    for (let i = 0; i < bars.length; i++) {
      let bar = bars[i];
      let barLength = p.map(Math.abs(bar.change), 0, 20, 0, 300);

      p.stroke(bar.change >= 0 ? 'green' : 'red');
      p.strokeWeight(38);
      p.line(bar.x, bar.y, bar.x, bar.y - barLength * Math.sign(bar.change));
    }
  }

  function populateEvents() {
    let count = Math.floor(p.random(3, 6));

    for (let i = 0; i < count; i++) {
      let x = timeTicks[Math.floor(p.random(timeTicks.length))];
      events.push({x: x, y: p.windowHeight / 2});
    }
  }

  function drawEvents() {
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      p.fill(200)
      p.stroke(255);
      p.strokeWeight(1);
      p.circle(event.x, event.y, 8);
    }
  }
});
