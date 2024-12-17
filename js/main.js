// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Spel variabelen
const elfImage = new Image();
elfImage.src = "../assets/elf.png"; // Sprite van de elf
const backgroundImage = new Image();
backgroundImage.src = "../assets/background.jpg"; // Achtergrond voor het startscherm

let score = 0;
let remainingShots = 10; // Start met 10 kogels
let elfCount = 5; // Start met 5 elfen
let level = 1; // Start op level 1
const elves = [];
let gameStarted = false; // Houd bij of het spel is gestart

// --- Startscherm ---
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Achtergrond tekenen
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    backgroundImage.onload = () =>
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Titel
  ctx.font = "48px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(" Elfen Jacht ", canvas.width / 2 - 130, canvas.height / 2 - 50);

  // Startknop
  ctx.fillStyle = "red";
  ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2, 200, 60);

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("START", canvas.width / 2 - 35, canvas.height / 2 + 40);
}

// Klik op startknop om te beginnen
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Controleer of er op de startknop is geklikt
  if (
    !gameStarted &&
    mouseX >= canvas.width / 2 - 100 &&
    mouseX <= canvas.width / 2 + 100 &&
    mouseY >= canvas.height / 2 &&
    mouseY <= canvas.height / 2 + 60
  ) {
    gameStarted = true; // Start het spel
    createElves();
    gameLoop();
  }
});

// --- Game functionaliteit ---
function createElves() {
  elves.length = 0; // Reset de elfenlijst
  for (let i = 0; i < elfCount; i++) {
    const speedMultiplier = 1 + level * 0.5; // Snelheid stijgt per level

    const elfWidth = 100;
    const elfHeight = 100;

    // Willekeurige positie binnen canvasgrenzen
    const x = Math.random() * (canvas.width - elfWidth);
    const y = Math.random() * (canvas.height - elfHeight);

    // Voeg een nieuwe elf toe
    elves.push({
      x: x,
      y: y,
      width: elfWidth,
      height: elfHeight,
      speedX: (Math.random() * 2 + 1) * speedMultiplier, // Willekeurige snelheid
      speedY: (Math.random() * 2 + 1) * speedMultiplier,
      hit: false, // Elf is nog niet geraakt
    });
  }
}

function drawElves() {
  elves.forEach((elf) => {
    if (!elf.hit) {
      ctx.drawImage(elfImage, elf.x, elf.y, elf.width, elf.height);
    }
  });
}

function updateElves() {
  elves.forEach((elf) => {
    if (!elf.hit) {
      elf.x += elf.speedX;
      elf.y += elf.speedY;

      // Botsingen met canvasranden
      if (elf.x <= 0 || elf.x + elf.width >= canvas.width) elf.speedX *= -1;
      if (elf.y <= 0 || elf.y + elf.height >= canvas.height) elf.speedY *= -1;
    }
  });
}

function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Remaining Shots: ${remainingShots}`, 20, 60);
  ctx.fillText(`Level: ${level}`, canvas.width - 120, 30);
}

canvas.addEventListener("click", (event) => {
  if (gameStarted && remainingShots > 0) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    elves.forEach((elf) => {
      if (
        mouseX >= elf.x &&
        mouseX <= elf.x + elf.width &&
        mouseY >= elf.y &&
        mouseY <= elf.y + elf.height &&
        !elf.hit
      ) {
        score += 10;
        elf.hit = true;
      }
    });

    remainingShots--;
    if (elves.every((elf) => elf.hit)) {
      checkLevelProgress(true); // Ga naar het volgende level
    } else if (remainingShots === 0) {
      checkLevelProgress(false); // Controleer of je verder kunt
    }
  }
});

function checkLevelProgress(allElvesHit) {
  if (allElvesHit) {
    // Ga naar het volgende level
    level++;
    elfCount += 2; // Voeg 2 extra elfen toe
    remainingShots += 10; // Voeg 5 extra kogels toe
    createElves(); // Elfen met hogere snelheid
  } else {
    alert("Je hebt niet alle elfen geraakt! Probeer opnieuw.");
    resetGame();
  }
}

function resetGame() {
  score = 0;
  remainingShots = 10; // Reset naar 10 kogels
  elfCount = 5; // Begin opnieuw met 5 elfen
  level = 1;
  createElves();
}

function gameLoop() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawElves();
  updateElves();
  drawScore();
  requestAnimationFrame(gameLoop);
}

// Startscherm laten zien
drawStartScreen();
