const snowContainer = document.getElementById("snowflakes");

const numberOfSnowflakes = 100;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < numberOfSnowflakes; i++) {
  const snowflake = document.createElement("div");
  snowflake.classList.add("snowflake");
  snowflake.innerText = "❄";

  snowflake.style.left = `${random(0, 100)}%`;

  snowflake.style.top = `${random(-100, 0)}%`;

  // Willekeurige grootte en snelheid
  snowflake.style.fontSize = `${random(10, 20)}px`;
  snowflake.style.animationDuration = `${random(3, 8)}s`;
  snowflake.style.opacity = random(0.5, 1);

  snowContainer.appendChild(snowflake);
}
