// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas en pas game-elementen aan
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Roep de resizeCanvas functie aan bij het laden van de pagina
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// Spel variabelen
const elfImage = new Image();
elfImage.src = "../assets/elf.png"; // Sprite van de elf

let score = 0;
let remainingShots = 5; // Start met 5 kogels
let elfCount = 5; // Start met 5 elfen
let level = 1; // Start op level 1
const elves = [];

// Elf-objecten genereren
function createElves() {
  elves.length = 0; // Reset de lijst met elfen
  for (let i = 0; i < elfCount; i++) {
    elves.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      width: 50,
      height: 50,
      speedX: Math.random() * 2 + 1, // Willekeurige snelheid
      speedY: Math.random() * 2 + 1, // Willekeurige snelheid
      hit: false,
    });
  }
}

// Elfen tekenen
function drawElves() {
  elves.forEach((elf) => {
    if (!elf.hit) {
      ctx.drawImage(elfImage, elf.x, elf.y, elf.width, elf.height);
    }
  });
}

// Elfen bewegen
function updateElves() {
  elves.forEach((elf) => {
    if (!elf.hit) {
      elf.x += elf.speedX;
      elf.y += elf.speedY;

      // Stuiteren tegen de randen van het canvas
      if (elf.x <= 0 || elf.x + elf.width >= canvas.width) elf.speedX *= -1;
      if (elf.y <= 0 || elf.y + elf.height >= canvas.height) elf.speedY *= -1;
    }
  });
}

// Score en kogels tekenen
function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`Remaining Shots: ${remainingShots}`, 20, 60);
  ctx.fillText(`Level: ${level}`, canvas.width - 120, 30);
}

// Muis klik event (schieten)
canvas.addEventListener("click", (event) => {
  if (remainingShots > 0) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Vergroot de hitbox met een marge (bijv. 10 pixels rondom de elf)
    const hitBoxMargin = 10;

    elves.forEach((elf) => {
      // Vergroot de hitbox door de marge toe te voegen
      if (
        mouseX >= elf.x - hitBoxMargin &&
        mouseX <= elf.x + elf.width + hitBoxMargin &&
        mouseY >= elf.y - hitBoxMargin &&
        mouseY <= elf.y + elf.height + hitBoxMargin &&
        !elf.hit
      ) {
        score += 10; // Verhoog score
        elf.hit = true; // Markeer elf als geraakt
      }
    });

    remainingShots--; // Verlies een kogel na elke klik

    if (remainingShots === 0) {
      checkLevelProgress(); // Controleer of we naar het volgende level moeten
    }
  }
});

// Controleer of de speler naar het volgende level moet
function checkLevelProgress() {
  if (elves.every((elf) => elf.hit)) {
    // Als alle elfen zijn geraakt
    level++; // Verhoog het level
    elfCount += 5; // Voeg 5 elfen toe voor het volgende level
    remainingShots += 5; // Voeg 5 kogels toe voor het volgende level

    createElves(); // Maak nieuwe elfen voor het volgende level
  } else {
    // Als de speler alle elfen niet heeft geraakt, herstart het level
    alert("Je hebt niet alle elfen geraakt! Probeer opnieuw.");
    resetGame(); // Herstart het spel
  }
}

// Herstart het spel
function resetGame() {
  score = 0;
  remainingShots = 10; // Reset naar de originele hoeveelheid kogels
  elfCount = 5; // Begin met 5 elfen
  level = 1; // Begin opnieuw op level 1
  createElves(); // Maak de elfen opnieuw aan
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Maak het canvas schoon

  drawElves();
  updateElves();
  drawScore();

  requestAnimationFrame(gameLoop); // Zorg ervoor dat de game blijft draaien
}

// Start game
createElves();
gameLoop();
