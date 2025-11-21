// Instance-mode sketch for tab 3 - Asset Performance Bubbles Visualization
registerSketch('sk3', function (p) {
  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 600;
  
  // Bubble size range
  const MIN_BUBBLE_SIZE = 50;
  const MAX_BUBBLE_SIZE = 350;
  const BASE_SIZE = 120; // Starting size for all bubbles (reduced from 150)
  
  // Data structures
  let assets = {
    bitcoin: { 
      name: 'Bitcoin', 
      color: '#F7931A', 
      data: [], 
      enabled: true,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
      x: 0, y: 0,
      hasData: false
    },
    sp500: { 
      name: 'S&P 500', 
      color: '#4169E1', 
      data: [], 
      enabled: true,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
      x: 0, y: 0,
      hasData: false
    },
    gold: { 
      name: 'Gold', 
      color: '#FFD700', 
      data: [], 
      enabled: true,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
      x: 0, y: 0,
      hasData: false
    },
    oil: { 
      name: 'Oil', 
      color: '#2C2C2C', 
      data: [], 
      enabled: true,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
      x: 0, y: 0,
      hasData: false
    },
    usd: { 
      name: 'USD Index', 
      color: '#2ECC71', 
      data: [], 
      enabled: true,
      currentSize: BASE_SIZE,
      targetSize: BASE_SIZE,
      x: 0, y: 0,
      hasData: false
    }
  };
  
  // Timeline control
  let currentIndex = 0;
  let isPlaying = false;
  let playSpeed = 2; // days per frame
  
  // UI elements
  let slider;
  let playButton;
  let assetToggles = {};
  
  // Slider properties
  let sliderX, sliderY, sliderWidth, sliderHeight;
  let isDraggingSlider = false;
  
  // Animation
  const LERP_FACTOR = 0.15;
  
  // Historical events to highlight
  const events = [
    { date: '03/11/2020', name: 'COVID-19 Pandemic Declared', color: '#FF0000' },
    { date: '03/23/2020', name: 'Market Bottom (COVID)', color: '#FF4444' },
    { date: '01/06/2021', name: 'US Capitol Attack', color: '#FF8800' },
    { date: '02/24/2022', name: 'Ukraine War Begins', color: '#FF0088' },
    { date: '03/10/2023', name: 'Silicon Valley Bank Collapse', color: '#8800FF' }
  ];
  
  let hoveredBubble = null;
  let dataLoaded = false;
  let earliestDate = null;
  let latestDate = null;
  let allDates = [];
  
  p.preload = function() {
    // Load CSV files
    p.loadTable('data/Bitcoin Historical Data.csv', 'csv', 'header', (table) => {
      assets.bitcoin.data = parseTable(table);
    });
    p.loadTable('data/S&P 500 Historical Data.csv', 'csv', 'header', (table) => {
      assets.sp500.data = parseTable(table);
    });
    p.loadTable('data/Gold Futures Historical Data.csv', 'csv', 'header', (table) => {
      assets.gold.data = parseTable(table);
    });
    p.loadTable('data/Crude Oil WTI Futures Historical Data.csv', 'csv', 'header', (table) => {
      assets.oil.data = parseTable(table);
    });
    p.loadTable('data/US Dollar Index Historical Data.csv', 'csv', 'header', (table) => {
      assets.usd.data = parseTable(table);
    });
  };
  
  function parseTable(table) {
    let data = [];
    for (let i = 0; i < table.getRowCount(); i++) {
      let dateStr = table.getString(i, 'Date');
      let priceStr = table.getString(i, 'Price').replace(/,/g, '');
      let changeStr = table.getString(i, 'Change %').replace('%', '');
      
      data.push({
        date: parseDate(dateStr),
        dateStr: dateStr,
        price: parseFloat(priceStr),
        changePercent: parseFloat(changeStr)
      });
    }
    // Reverse so oldest is first
    return data.reverse();
  }
  
  function parseDate(dateStr) {
    let parts = dateStr.split('/');
    return new Date(parts[2], parts[0] - 1, parts[1]);
  }
  
  p.setup = function () {
    let canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(p.canvas.parentElement);
    
    // Wait a bit for data to load
    setTimeout(() => {
      initializeData();
    }, 100);
    
    // Set up slider position
    sliderX = 100;
    sliderY = CANVAS_HEIGHT - 80;
    sliderWidth = CANVAS_WIDTH - 200;
    sliderHeight = 10;
    
    // Position bubbles in a circle
    positionBubbles();
  };
  
  function initializeData() {
    // Find common date range
    let allAssetDates = [];
    
    Object.keys(assets).forEach(key => {
      if (assets[key].data.length > 0) {
        allAssetDates = allAssetDates.concat(assets[key].data.map(d => d.date.getTime()));
      }
    });
    
    if (allAssetDates.length === 0) return;
    
    earliestDate = new Date(Math.min(...allAssetDates));
    latestDate = new Date(Math.max(...allAssetDates));
    
    // Create unified timeline
    createTimeline();
    
    dataLoaded = true;
    currentIndex = 0;
    updateBubbleSizes();
  }
  
  function createTimeline() {
    // Create daily timeline from earliest to latest
    allDates = [];
    let current = new Date(earliestDate);
    
    while (current <= latestDate) {
      allDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  
  function positionBubbles() {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2 + 20; // Moved down to account for top UI
    const radius = 200; // Increased to spread bubbles out more and prevent overlap
    
    const keys = Object.keys(assets);
    const angleStep = p.TWO_PI / keys.length;
    
    keys.forEach((key, i) => {
      const angle = i * angleStep - p.HALF_PI;
      assets[key].x = centerX + p.cos(angle) * radius;
      assets[key].y = centerY + p.sin(angle) * radius;
    });
  }
  
  function updateBubbleSizes() {
    if (!dataLoaded || allDates.length === 0) return;
    
    const currentDate = allDates[currentIndex];
    
    Object.keys(assets).forEach(key => {
      const asset = assets[key];
      
      // Find closest data point
      let closestData = null;
      let minDiff = Infinity;
      
      asset.data.forEach(d => {
        const diff = Math.abs(d.date.getTime() - currentDate.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestData = d;
        }
      });
      
      if (closestData) {
        // Use daily percentage change directly
        const dailyChange = closestData.changePercent;
        
        // Map daily change to size with more dramatic scaling: -5% to +5% range
        // This makes smaller changes more visible
        // Neutral (0%) = BASE_SIZE, positive grows more dramatically, negative shrinks more
        const normalizedChange = (dailyChange + 5) / 10; // Map -5% to 0, +5% to 1
        const clampedChange = p.constrain(normalizedChange, 0, 1);
        
        asset.targetSize = p.lerp(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE, clampedChange);
        asset.currentData = closestData;
        asset.hasData = true;
      } else {
        asset.hasData = false;
      }
    });
  }
  
  p.draw = function () {
    p.background(20, 25, 35);
    
    if (!dataLoaded) {
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text('Loading data...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      return;
    }
    
    // Update animation
    if (isPlaying) {
      currentIndex += playSpeed;
      if (currentIndex >= allDates.length) {
        currentIndex = allDates.length - 1;
        isPlaying = false;
      }
      updateBubbleSizes();
    }
    
    // Smooth bubble size transitions
    Object.keys(assets).forEach(key => {
      const asset = assets[key];
      asset.currentSize = p.lerp(asset.currentSize, asset.targetSize, LERP_FACTOR);
    });
    
    // Draw bubbles
    hoveredBubble = null;
    Object.keys(assets).forEach(key => {
      if (assets[key].enabled) {
        drawBubble(assets[key]);
      }
    });
    
    // Draw UI
    drawTimeline();
    drawControls();
    drawInfoPanel();
    
    // Draw tooltip
    if (hoveredBubble) {
      drawTooltip(hoveredBubble);
    }
  };
  
  function drawBubble(asset) {
    // Don't draw if no data available for current date
    if (!asset.hasData) return;
    
    const size = asset.currentSize;
    
    // Check if mouse is hovering
    const d = p.dist(p.mouseX, p.mouseY, asset.x, asset.y);
    const isHovered = d < size / 2;
    
    if (isHovered) {
      hoveredBubble = asset;
    }
    
    // Draw glow effect
    if (isHovered) {
      p.drawingContext.shadowBlur = 40;
      p.drawingContext.shadowColor = asset.color;
    } else {
      p.drawingContext.shadowBlur = 20;
      p.drawingContext.shadowColor = asset.color;
    }
    
    // Draw bubble
    p.fill(asset.color);
    p.noStroke();
    p.circle(asset.x, asset.y, size);
    
    // Reset shadow
    p.drawingContext.shadowBlur = 0;
    
    // Draw label
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(isHovered ? 18 : 14);
    p.textStyle(p.BOLD);
    p.text(asset.name, asset.x, asset.y);
    
    // Draw daily change percentage
    if (asset.currentData) {
      const changeVal = asset.currentData.changePercent;
      p.textSize(isHovered ? 16 : 12);
      p.textStyle(p.NORMAL);
      const sign = changeVal >= 0 ? '+' : '';
      const changeColor = changeVal >= 0 ? '#2ECC71' : '#E74C3C';
      p.fill(changeColor);
      p.text(sign + changeVal.toFixed(2) + '%', asset.x, asset.y + 20);
    }
  }
  
  function drawTimeline() {
    // Slider background
    p.fill(60, 65, 80);
    p.noStroke();
    p.rect(sliderX, sliderY, sliderWidth, sliderHeight, 5);
    
    // Progress bar
    const progress = currentIndex / (allDates.length - 1);
    p.fill(100, 150, 255);
    p.rect(sliderX, sliderY, sliderWidth * progress, sliderHeight, 5);
    
    // Slider handle
    const handleX = sliderX + sliderWidth * progress;
    p.fill(255);
    p.circle(handleX, sliderY + sliderHeight / 2, 20);
    
    // Date labels
    p.fill(200);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    if (earliestDate) {
      p.text(formatDate(earliestDate), sliderX, sliderY + 20);
    }
    p.textAlign(p.RIGHT, p.TOP);
    if (latestDate) {
      p.text(formatDate(latestDate), sliderX + sliderWidth, sliderY + 20);
    }
    
    // Current date
    p.textAlign(p.CENTER, p.TOP);
    p.textSize(16);
    p.fill(255);
    if (allDates[currentIndex]) {
      p.text(formatDate(allDates[currentIndex]), CANVAS_WIDTH / 2, sliderY + 20);
    }
    
    // Event markers
    events.forEach(event => {
      const eventDate = parseDate(event.date);
      const eventIndex = allDates.findIndex(d => 
        d.getFullYear() === eventDate.getFullYear() &&
        d.getMonth() === eventDate.getMonth() &&
        d.getDate() === eventDate.getDate()
      );
      
      if (eventIndex >= 0) {
        const eventX = sliderX + sliderWidth * (eventIndex / (allDates.length - 1));
        p.stroke(event.color);
        p.strokeWeight(2);
        p.line(eventX, sliderY - 10, eventX, sliderY + sliderHeight + 10);
      }
    });
  }
  
  function drawControls() {
    // Play/Pause button
    const buttonX = 40;
    const buttonY = sliderY + sliderHeight / 2;
    const buttonSize = 30;
    
    p.fill(100, 150, 255);
    p.noStroke();
    p.circle(buttonX, buttonY, buttonSize);
    
    p.fill(255);
    if (isPlaying) {
      // Pause icon
      p.rect(buttonX - 5, buttonY - 7, 3, 14);
      p.rect(buttonX + 2, buttonY - 7, 3, 14);
    } else {
      // Play icon
      p.triangle(buttonX - 4, buttonY - 7, buttonX - 4, buttonY + 7, buttonX + 6, buttonY);
    }
    
    // Asset toggles
    const toggleStartY = 30;
    const toggleSpacing = 35;
    
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(14);
    
    Object.keys(assets).forEach((key, i) => {
      const asset = assets[key];
      const toggleX = CANVAS_WIDTH - 130;
      const toggleY = toggleStartY + i * toggleSpacing;
      
      // Checkbox
      p.stroke(asset.color);
      p.strokeWeight(2);
      if (asset.enabled) {
        p.fill(asset.color);
      } else {
        p.noFill();
      }
      p.rect(toggleX, toggleY - 8, 16, 16, 3);
      
      // Label
      p.fill(asset.enabled ? 255 : 150);
      p.noStroke();
      p.text(asset.name, toggleX + 25, toggleY);
    });
  }
  
  function drawInfoPanel() {
    // Check for notable events
    if (allDates[currentIndex]) {
      const currentDateStr = formatDate(allDates[currentIndex]);
      
      events.forEach(event => {
        const eventDate = parseDate(event.date);
        const daysDiff = Math.abs((allDates[currentIndex] - eventDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 7) {
          // Show event notification
          p.fill(0, 0, 0, 200);
          p.noStroke();
          p.rect(CANVAS_WIDTH / 2 - 200, 20, 400, 40, 5);
          
          p.fill(event.color);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(14);
          p.textStyle(p.BOLD);
          p.text('⚠ ' + event.name, CANVAS_WIDTH / 2, 40);
        }
      });
    }
  }
  
  function drawTooltip(asset) {
    const tooltipWidth = 220;
    const tooltipHeight = 100;
    let tooltipX = p.mouseX + 15;
    let tooltipY = p.mouseY - tooltipHeight / 2;
    
    // Keep tooltip on screen
    if (tooltipX + tooltipWidth > CANVAS_WIDTH) {
      tooltipX = p.mouseX - tooltipWidth - 15;
    }
    
    // Background
    p.fill(0, 0, 0, 230);
    p.stroke(asset.color);
    p.strokeWeight(2);
    p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
    
    // Content
    p.noStroke();
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.text(asset.name, tooltipX + 10, tooltipY + 10);
    
    p.textStyle(p.NORMAL);
    p.textSize(12);
    
    if (asset.currentData) {
      p.fill(255);
      p.text('Price: $' + asset.currentData.price.toLocaleString(), tooltipX + 10, tooltipY + 35);
      
      const changeVal = asset.currentData.changePercent;
      const changeText = (changeVal >= 0 ? '+' : '') + changeVal.toFixed(2) + '%';
      p.fill(changeVal >= 0 ? '#2ECC71' : '#E74C3C');
      p.text('Daily Change: ' + changeText, tooltipX + 10, tooltipY + 55);
      
      // Show date
      p.fill(180);
      p.textSize(10);
      p.text(asset.currentData.dateStr, tooltipX + 10, tooltipY + 75);
    }
  }
  
  function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }
  
  p.mousePressed = function() {
    // Check play button
    const buttonX = 40;
    const buttonY = sliderY + sliderHeight / 2;
    const buttonSize = 30;
    
    if (p.dist(p.mouseX, p.mouseY, buttonX, buttonY) < buttonSize / 2) {
      isPlaying = !isPlaying;
      return;
    }
    
    // Check slider
    if (p.mouseX >= sliderX && p.mouseX <= sliderX + sliderWidth &&
        p.mouseY >= sliderY - 10 && p.mouseY <= sliderY + sliderHeight + 10) {
      isDraggingSlider = true;
      updateSliderPosition();
      return;
    }
    
    // Check asset toggles
    const toggleStartY = 30;
    const toggleSpacing = 35;
    
    Object.keys(assets).forEach((key, i) => {
      const toggleX = CANVAS_WIDTH - 130;
      const toggleY = toggleStartY + i * toggleSpacing;
      
      if (p.mouseX >= toggleX && p.mouseX <= toggleX + 16 &&
          p.mouseY >= toggleY - 8 && p.mouseY <= toggleY + 8) {
        assets[key].enabled = !assets[key].enabled;
      }
    });
  };
  
  p.mouseDragged = function() {
    if (isDraggingSlider) {
      updateSliderPosition();
    }
  };
  
  p.mouseReleased = function() {
    isDraggingSlider = false;
  };
  
  function updateSliderPosition() {
    const progress = p.constrain((p.mouseX - sliderX) / sliderWidth, 0, 1);
    currentIndex = Math.floor(progress * (allDates.length - 1));
    updateBubbleSizes();
  }
  
  p.windowResized = function () {
    // Keep fixed canvas size for consistency
    // p.resizeCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  };
});
