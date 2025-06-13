let img; 
let splashes = [];

function preload() {
  img = loadImage('typographic-poster.png'); 
}

function setup() {
  createCanvas(img.width, img.height);
  pixelDensity(1);
  noStroke();
  frameRate(30);
}

function draw() {
  background(0);

  for (let s of splashes) {
    s.life -= 0.5;
  }
  splashes = splashes.filter(s => s.life > 0);

  img.loadPixels();

  let distorted = createImage(img.width, img.height);
  distorted.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {

      let ripple = 0;
      let invAmount = 0;
      for (let s of splashes) {
        let age = frameCount - s.frame;
        let dx = x - s.x;
        let dy = y - s.y;
        if (abs(dx) > s.size || abs(dy) > s.size) continue;
        let d = sqrt(dx * dx + dy * dy);
        if (d < s.size) {
          let time = age / s.life;
          let edgeFalloff = exp(-1.5 * pow(d / s.size, 2));
          let timeFade = pow(s.life / 60, 1.2);
          let fade = edgeFalloff * timeFade;
          let angle = atan2(dy, dx);
          let angularMod = 1 + 0.3 * sin(angle * 8 + frameCount * 0.1);
          ripple += sin(d * 0.2 + age * 0.15) * 6 * fade * angularMod;

          let invEdgeFalloff = exp(-pow(d / s.size, 2));
          let invTimeFade = pow(s.life / 60, 1.2);
          invAmount = max(invAmount, invEdgeFalloff * invTimeFade);
        }
      }

      let newX = constrain(floor(x + ripple), 0, img.width - 1);
      let newY = y;

      let i = 4 * (y * img.width + x);
      let j = 4 * (newY * img.width + newX);

      let r = img.pixels[j];
      let g = img.pixels[j + 1];
      let b = img.pixels[j + 2];
      let a = img.pixels[j + 3];

      if (invAmount > 0) {
        r = lerp(r, 255 - r, invAmount);
        g = lerp(g, 255 - g, invAmount);
        b = lerp(b, 255 - b, invAmount);
      }

      distorted.pixels[i] = r;
      distorted.pixels[i + 1] = g;
      distorted.pixels[i + 2] = b;
      distorted.pixels[i + 3] = a;
    }
  }

  distorted.updatePixels();
  image(distorted, 0, 0);

  push();
  noFill();
  strokeWeight(1.5);
  for (let s of splashes) {
    let progress = 1 - s.life / 60;
    for (let i = 1; i <= 3; i++) {
      let ringProgress = progress - i * 0.1;
      if (ringProgress > 0) {
        let radius = ringProgress * 200;
        let alpha = 100 * exp(-2 * pow(ringProgress, 1.5));
        stroke(255, alpha);
        ellipse(s.x, s.y, radius * 2);
      }
    }
  }
  pop();
}

function mousePressed() {
  let size = random(50, 150); 
  splashes.push({ x: mouseX, y: mouseY, frame: frameCount, life: 60, size: size });
  if (splashes.length > 8) splashes.splice(0, splashes.length - 8);
}

let cursorEl;

window.addEventListener('DOMContentLoaded', () => {
  cursorEl = document.createElement('div');
  cursorEl.classList.add('custom-cursor');
  document.body.appendChild(cursorEl);

  document.addEventListener('mousemove', (e) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const withinX = e.clientX >= canvasRect.left && e.clientX <= canvasRect.right;
    const withinY = e.clientY >= canvasRect.top && e.clientY <= canvasRect.bottom;
    if (withinX && withinY) {
      cursorEl.style.display = 'block';
      cursorEl.style.left = e.clientX + 'px';
      cursorEl.style.top = e.clientY + 'px';
    } else {
      cursorEl.style.display = 'none';
    }
  });
});