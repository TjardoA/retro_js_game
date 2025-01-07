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

function setCursor(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 20 20">
      <line x1="10" y1="0" x2="10" y2="20" stroke="${color}" stroke-width="2"/>
      <line x1="0" y1="10" x2="20" y2="10" stroke="${color}" stroke-width="2"/>
    </svg>
  `;
  const dataURL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  canvas.style.cursor = `url(${dataURL}) 10 10, crosshair`;
}
setCursor("red");

// --- Game functionaliteit ---
function createElves() {
  elves.length = 0; // Reset de elfenlijst
  for (let i = 0; i < elfCount; i++) {
    const speedMultiplier = 0.5 + level * 1; // Snelheid stijgt per level

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

function updateElves(deltaTime) {
  elves.forEach((elf) => {
    if (!elf.hit) {
      elf.x += elf.speedX * (deltaTime / interval); // Pas snelheid aan op basis van tijd
      elf.y += elf.speedY * (deltaTime / interval); // Pas snelheid aan op basis van tijd

      // Correctie voor botsingen met de randen van het canvas
      if (elf.x <= 0) {
        elf.x = 0; // Zorg ervoor dat de elf niet buiten de linkerrand gaat
        elf.speedX *= -1; // Keer de beweging om
      }
      if (elf.x + elf.width >= canvas.width) {
        elf.x = canvas.width - elf.width; // Zorg ervoor dat de elf niet buiten de rechterrand gaat
        elf.speedX *= -1; // Keer de beweging om
      }
      if (elf.y <= 0) {
        elf.y = 0; // Zorg ervoor dat de elf niet buiten de bovenkant gaat
        elf.speedY *= -1; // Keer de beweging om
      }
      if (elf.y + elf.height >= canvas.height) {
        elf.y = canvas.height - elf.height; // Zorg ervoor dat de elf niet buiten de onderkant gaat
        elf.speedY *= -1; // Keer de beweging om
      }
    }
  });
}

function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Remaining Shots: ${remainingShots}`, 20, 60);
  ctx.fillText(`Level: ${level}`, canvas.width - 120, 30);

  // Checkpoint message
  if (checkpointMessage) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "green";
    ctx.fillText(checkpointMessage, canvas.width / 2 - 150, canvas.height / 2);
  }
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

    // Controleer op checkpoint levels (5, 10, 15, ...)
    if (level % 5 === 0) {
      remainingShots += 20; // Voeg 20 extra kogels toe
      showCheckpointMessage("Checkpoint +20");
    } else {
      remainingShots += 10; // Voeg standaard 10 kogels toe
    }

    createElves(); // Elfen met hogere snelheid
  } else {
    alert("Je hebt niet alle elfen geraakt! Probeer opnieuw.");
    resetGame();
  }
}

function showCheckpointMessage(message) {
  checkpointMessage = message;
  clearTimeout(checkpointTimer);
  checkpointTimer = setTimeout(() => {
    checkpointMessage = "";
  }, 2000); // Bericht verdwijnt na 2 seconden
}

function resetGame() {
  score = 0;
  remainingShots = 10; // Reset naar 10 kogels
  elfCount = 5; // Begin opnieuw met 5 elfen
  level = 1;
  createElves();
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;

  // Update de game alleen als de benodigde tijd is verstreken
  if (deltaTime >= interval) {
    lastTime = timestamp - (deltaTime % interval); // Herstel de tijd voor de volgende iteratie

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawElves();
    updateElves(deltaTime); // Gebruik deltaTime voor consistentie
    drawScore();
  }

  requestAnimationFrame(gameLoop);
}

// Startscherm laten zien
drawStartScreen();
