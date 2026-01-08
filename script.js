/* ---------- Step navigation ---------- */

const steps = {
  countdown: document.getElementById("step-countdown"),
  cake: document.getElementById("step-cake"),
  letter: document.getElementById("step-letter"),
  video: document.getElementById("step-video"),
  final: document.getElementById("step-final"),
};

function showStep(name) {
  Object.values(steps).forEach(s => s.classList.remove("active"));
  steps[name].classList.add("active");
}

/* ---------- COUNTDOWN + MAKE A WISH ---------- */

const countNumber = document.getElementById("countNumber");
const wishText = document.getElementById("wishText");

function startCountdown() {
  let n = 3;
  countNumber.textContent = n;
  wishText.style.display = "none";

  const interval = setInterval(() => {
    n--;
    if (n > 0) {
      countNumber.textContent = n;
    } else if (n === 0) {
      countNumber.textContent = "";
      wishText.style.display = "block";
      burstConfetti(2500);
    } else {
      clearInterval(interval);
      showStep("cake");
    }
  }, 1000);
}

/* ---------- Buttons ---------- */

const btnToLetter = document.getElementById("btnToLetter");
const btnBackToCake = document.getElementById("btnBackToCake");
const btnToVideo = document.getElementById("btnToVideo");
const btnBackToLetter = document.getElementById("btnBackToLetter");
const btnToFinal = document.getElementById("btnToFinal");
const btnMoreConfetti = document.getElementById("btnMoreConfetti");

btnToLetter?.addEventListener("click", () => showStep("letter"));
btnBackToCake?.addEventListener("click", () => showStep("cake"));
btnToVideo?.addEventListener("click", () => showStep("video"));
btnBackToLetter?.addEventListener("click", () => showStep("letter"));
btnToFinal?.addEventListener("click", () => showStep("final"));
btnMoreConfetti?.addEventListener("click", () => burstConfetti());

/* ---------- Confetti (canvas) ---------- */

const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

let confettiPieces = [];
let confettiRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createConfetti() {
  confettiPieces = [];
  const colors = ["#ffb6ff", "#ffe48a", "#87ffb2", "#8ec5fc", "#fda085"];

  for (let i = 0; i < 200; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 1.2 + Math.random() * 2.2,
      speedX: -1 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.1 + Math.random() * 0.2,
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.rotationSpeed;

    if (p.y > canvas.height + 20) {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });
}

function loop() {
  if (!confettiRunning) return;
  drawConfetti();
  requestAnimationFrame(loop);
}

function burstConfetti(durationMs = 3000) {
  createConfetti();
  confettiRunning = true;
  loop();

  setTimeout(() => {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, durationMs);
}

/* ---------- Bougie à souffler (micro) ---------- */

const btnBlow = document.getElementById("btnBlow");
const flame = document.getElementById("flame");

let audioStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let listening = false;
let candleBlown = false;

async function startListening() {
  if (listening || candleBlown) return;

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.warn("Micro refusé ou indisponible", err);
    alert("Je peux pas accéder au micro 😢. Vérifie les permissions.");
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(audioStream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  listening = true;
  listenLoop();
}

function listenLoop() {
  if (!listening || !analyser) return;

  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = (dataArray[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / dataArray.length);

  const THRESHOLD = 0.25;

  if (rms > THRESHOLD) {
    blowCandle();
    return;
  }

  requestAnimationFrame(listenLoop);
}

function blowCandle() {
  candleBlown = true;
  listening = false;

  if (flame) {
    flame.classList.add("off");
  }

  if (audioStream) {
    audioStream.getTracks().forEach(t => t.stop());
    audioStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  alert("Souhait exaucé ✨");
  burstConfetti(3500);
}

btnBlow?.addEventListener("click", () => {
  if (candleBlown) {
    alert("La bougie est déjà éteinte 🕯️");
  } else {
    startListening();
    alert("Approche-toi du micro et souffle fort sur la bougie 🌬️");
  }
});

/* ---------- LANCEMENT ---------- */

window.addEventListener("load", () => {
  startCountdown();
  burstConfetti(3500);
});
