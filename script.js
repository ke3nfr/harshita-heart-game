const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let items = [];
let basket = { x: canvas.width / 2, width: 120, height: 25 };
let score = 0;
let heartWords = ["ILY! 💖", "Babe! 😘", "IMY! 🥺", "My Love 💕", "Cutie 🥰", "Princess 👑", "Sweetheart 💝","Harshilicious 😋", "Harshiboo 🐻"];
let caughtWords = [];
let particles = [];
let gameActive = false;

function startGame() {
  document.getElementById('startScreen').style.opacity = 0;
  setTimeout(() => {
    document.getElementById('startScreen').style.display = 'none';
    canvas.style.display = 'block';
    gameActive = true;
    score = 0;
    items = [];
    caughtWords = [];
    gameLoop();
    itemInterval = setInterval(createItem, 800);
  }, 1000);
}

function createItem() {
  if (!gameActive) return;
  
  const isCheesecake = Math.random() < 0.2;
  const size = isCheesecake ? 40 : 35;
  const x = Math.random() * (canvas.width - size);
  
  items.push({
    x: x,
    y: -size,
    size: size,
    speed: 2 + Math.random() * 4,
    type: isCheesecake ? "cheesecake" : "heart",
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1
  });
}

function drawHeart(x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Simplified symmetrical heart shape
  ctx.fillStyle = "#ff1493";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  // Left curve
  ctx.bezierCurveTo(
    -size/2, -size/2,
    -size/2, size/4,
    0, size/2
  );
  
  // Right curve
  ctx.bezierCurveTo(
    size/2, size/4,
    size/2, -size/2,
    0, 0
  );
  
  ctx.fill();
  ctx.restore();
}

function drawCheesecake(x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Cake base - simple rounded rectangle
  ctx.fillStyle = "#f5deb3";
  ctx.beginPath();
  ctx.roundRect(-size/2, -size/3, size, size/1.5, [10, 10, 10, 10]);
  ctx.fill();
  
  // Strawberry topping - simple circle
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(0, -size/3, size/3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawBasket() {
  ctx.fillStyle = "#ff1493";
  ctx.beginPath();
  ctx.roundRect(basket.x, canvas.height - 60, basket.width, basket.height, [10, 10, 0, 0]);
  ctx.fill();
  
  // Basket details
  ctx.fillStyle = "#ff69b4";
  ctx.beginPath();
  ctx.roundRect(basket.x + 5, canvas.height - 55, basket.width - 10, basket.height - 10, [5, 5, 0, 0]);
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "#ff1493";
  ctx.font = "24px 'Poppins', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}/30`, 20, 40);
}

function createParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    const size = 3 + Math.random() * 5;
    
    particles.push({
      x: x,
      y: y,
      size: size,
      color: color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 30
    });
  }
}

function drawParticles() {
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 60;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  });
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, "#fff0f5");
  bgGradient.addColorStop(1, "#ffd1e6");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw items
  items.forEach(item => {
    item.y += item.speed;
    item.rotation += item.rotationSpeed;
    
    if (item.type === "heart") {
      drawHeart(item.x + item.size/2, item.y + item.size/2, item.size, item.rotation);
    } else {
      drawCheesecake(item.x + item.size/2, item.y + item.size/2, item.size, item.rotation);
    }
  });
  
  drawBasket();
  drawScore();
  drawParticles();
  
  // Draw caught words
  caughtWords.forEach((word, i) => {
    ctx.fillStyle = "#ff1493";
    ctx.font = "24px 'Dancing Script', cursive";
    ctx.globalAlpha = word.opacity;
    ctx.fillText(word.text, word.x, word.y);
    ctx.globalAlpha = 1;
  });
}

function detectCatch() {
  items = items.filter(item => {
    if (
      item.y + item.size > canvas.height - 60 &&
      item.x + item.size > basket.x &&
      item.x < basket.x + basket.width
    ) {
      const points = item.type === "cheesecake" ? 3 : 1;
      score += points;
      
      // Add word effect
      const word = heartWords[Math.floor(Math.random() * heartWords.length)];
      caughtWords.push({
        text: word,
        x: item.x + item.size/2,
        y: item.y,
        opacity: 1
      });
      
      // Create particles
      const color = item.type === "cheesecake" ? "#f5deb3" : "#ff1493";
      createParticles(item.x + item.size/2, item.y + item.size/2, color, 15);
      
      return false;
    }
    return item.y < canvas.height;
  });
  
  // Update caught words
  caughtWords.forEach(word => {
    word.y -= 1.5;
    word.opacity -= 0.01;
  });
  
  caughtWords = caughtWords.filter(word => word.opacity > 0);
}

function gameLoop() {
  if (!gameActive) return;
  
  draw();
  detectCatch();

  if (score >= 30) {
    endGame();
    return;
  }

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameActive = false;
  clearInterval(itemInterval);
  
  canvas.style.opacity = 0;
  setTimeout(() => {
    canvas.style.display = 'none';
    const endScreen = document.getElementById('endScreen');
    endScreen.style.display = 'flex';
    setTimeout(() => {
      endScreen.style.opacity = 1;
      showMessages();
      createConfetti();
    }, 100);
  }, 1000);
}

function createConfetti() {
  const colors = ['#ff1493', '#ff69b4', '#ffb6c1', '#ffc0cb', '#fff0f5', '#ffffff'];
  const container = document.getElementById('confetti');
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = (5 + Math.random() * 10) + 'px';
    confetti.style.height = (5 + Math.random() * 10) + 'px';
    confetti.style.animationDelay = Math.random() * 5 + 's';
    confetti.style.animationDuration = (3 + Math.random() * 4) + 's';
    container.appendChild(confetti);
  }
}

function showMessages() {
  let messages = [
    "I love how you yap 💬",
    "I miss your random I love yous 💌",
    "You're the chaos I never want to lose 🌪️",
    "I never wanted to hurt you 😔",
    "I'm still yours 💖"
  ];

  const msgDiv = document.getElementById('messages');
  let i = 0;

  const interval = setInterval(() => {
    if (i < messages.length) {
      const msg = document.createElement('div');
      msg.textContent = messages[i++];
      msg.style.animationDelay = `${i * 0.5}s`;
      msgDiv.appendChild(msg);
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

document.addEventListener('mousemove', e => {
  basket.x = e.clientX - basket.width / 2;
  // Keep basket within canvas bounds
  basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  basket.x = Math.min(basket.x, canvas.width - basket.width);
});