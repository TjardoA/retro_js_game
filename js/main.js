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
elfImage.src = "../assets/elf_falling-.png"; // Sprite van de elf met motion blur
const elfFlyingImage = new Image();
elfFlyingImage.src = "../assets/elf_flying.png"; // Sprite van de elf die omhoog gaat
const elfHitImage = new Image();
elfHitImage.src = "../assets/game_over_elf.png"; // Sprite van de elf die geraakt is
const backgroundImage = new Image();
backgroundImage.src = "../assets/background.jpg"; // Achtergrond voor het startscherm

let score = 0;
let remainingShots = 10; // Start met 10 kogels
let elfCount = 5; // Start met 5 elfen
let level = 1; // Start op level 1
const elves = [];
let gameStarted = false; // Houd bij of het spel is gestart

// Deeltjes array
let particles = [];

// Checkpoint message
let checkpointMessage = "";
let checkpointTimer = null;

// FPS instellen
const FPS = 60;
const interval = 1000 / FPS; // 60 FPS = 1000 ms / 60 = 16.67 ms
let lastTime = 0; // Tijd van de laatste update

// --- Startscherm ---
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Achtergrond tekenen
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }

  // Titel
  ctx.font = "48px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Elfen Jacht", canvas.width / 2 - 120, canvas.height / 2 - 50);

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
  } else if (gameStarted && remainingShots > 0) {
    let hitElf = false;

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
        // Voeg deeltjes toe wanneer een elf geraakt wordt
        particles.push([mouseX, mouseY]);

        setTimeout(() => {
          elf.remove = true; // Markeer dat de elf verwijderd moet worden
        }, 1000);
      }
    });

    remainingShots--; // Trek altijd een kogel af, ongeacht of je raakt of mist

    if (elves.every((elf) => elf.hit)) {
      checkLevelProgress(true); // Ga naar het volgende level
    } else if (remainingShots === 0) {
      checkLevelProgress(false); // Controleer of je verder kunt
    }
  }
});

function setCursor(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 20 20">
      <line x1="10" y1="0" x2="10" y2="20" stroke="${color}" stroke-width="2"/>
      <line x1="0" y1="10" x2="20" y2="10" stroke="${color}" stroke-width="2"/>
    </svg>`;
  const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  canvas.style.cursor = `url(${dataURL}) 10 10, crosshair`;
}
setCursor("red");

// --- Deeltjeslogica ---
function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i][1] += 3; // Laat de deeltjes naar beneden vallen

    // Reset de deeltjes naar boven als ze de bodem bereiken
    if (particles[i][1] > canvas.height) {
      particles[i][1] = 0;
    }
  }
}

function drawParticles() {
  ctx.fillStyle = "white"; // De kleur van de deeltjes
  for (let i = 0; i < particles.length; i++) {
    ctx.beginPath();
    ctx.arc(particles[i][0], particles[i][1], 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Game functionaliteit ---
function createElves() {
  elves.length = 0; // Reset de elfenlijst
  for (let i = 0; i < elfCount; i++) {
    const speedMultiplier = 0.2 + level * 0.5; // Snelheid stijgt per level

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
      speedX:
        (Math.random() * 2 + 1) *
        speedMultiplier *
        (Math.random() < 0.5 ? -1 : 1), // Willekeurige richting
      speedY:
        (Math.random() * 2 + 1) *
        speedMultiplier *
        (Math.random() < 0.5 ? -1 : 1),
      hit: false, // Elf is nog niet geraakt
      remove: false, // Markeer als false, totdat de elf geraakt wordt
    });
  }
}

function updateElves(deltaTime) {
  for (let i = elves.length - 1; i >= 0; i--) {
    const elf = elves[i];

    if (elf.remove) {
      // Verwijder de elf uit de lijst
      elves.splice(i, 1);
      continue;
    }

    if (!elf.hit) {
      elf.x += elf.speedX * (deltaTime / interval); // Pas snelheid aan op basis van tijd
      elf.y += elf.speedY * (deltaTime / interval);

      // Correctie voor botsingen met de randen van het canvas
      if (elf.x <= 0) {
        elf.x = 0;
        elf.speedX *= -1; // Keer de beweging om
      }
      if (elf.x + elf.width >= canvas.width) {
        elf.x = canvas.width - elf.width;
        elf.speedX *= -1; // Keer de beweging om
      }
      if (elf.y <= 0) {
        elf.y = 0;
        elf.speedY *= -1; // Keer de beweging om
      }
      if (elf.y + elf.height >= canvas.height) {
        elf.y = canvas.height - elf.height;
        elf.speedY *= -1; // Keer de beweging om
      }
    }
  }
}

function checkLevelProgress(allElvesHit) {
  if (allElvesHit) {
    level++;
    elfCount += 2;
    remainingShots += level % 5 === 0 ? 20 : 10;
    showCheckpointMessage(level % 5 === 0 ? "Checkpoint +20" : "+10 Shots");
    createElves();
  } else {
    window.location.href = "game_over.html";
  }
}

function drawElfWithMotionBlur(elf) {
  if (elf.hit) {
    ctx.drawImage(elfHitImage, elf.x, elf.y, elf.width, elf.height);
  } else {
    const imageToDraw = elf.speedY < 0 ? elfFlyingImage : elfImage;
    ctx.drawImage(imageToDraw, elf.x, elf.y, elf.width, elf.height);
  }
}

function drawElves() {
  elves.forEach((elf) => {
    drawElfWithMotionBlur(elf);
  });
}

function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Remaining Shots: ${remainingShots}`, 20, 60);
  ctx.fillText(`Level: ${level}`, canvas.width - 120, 30);

  if (checkpointMessage) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(checkpointMessage, canvas.width / 2 - 150, canvas.height / 2);
  }
}

function showCheckpointMessage(message) {
  checkpointMessage = message;
  clearTimeout(checkpointTimer);
  checkpointTimer = setTimeout(() => {
    checkpointMessage = "";
  }, 2000);
}

function resetGame() {
  score = 0;
  remainingShots = 10;
  elfCount = 5;
  level = 1;
  createElves();
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;

  if (deltaTime >= interval) {
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas wissen
    drawElves(); // Teken de elfen
    updateElves(deltaTime); // Werk de elfen bij
    drawScore(); // Teken de score

    // Deeltjes updaten en tekenen
    updateParticles();
    drawParticles();

    if (gameStarted && elves.every((elf) => elf.hit)) {
      checkLevelProgress(true);
    }
  }

  requestAnimationFrame(gameLoop);
}

drawStartScreen();
