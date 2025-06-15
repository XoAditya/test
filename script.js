// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBgtQdwGMzD-8GK4EEnl4Cd_gGuKGWJ9G0",
  authDomain: "virtuallovegarden.firebaseapp.com",
  projectId: "virtuallovegarden",
  storageBucket: "virtuallovegarden.firebasestorage.app",
  messagingSenderId: "73424640990",
  appId: "1:73424640990:web:b65870e0892831f0bd1b4f",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function plantFlower() {
  const message = document.getElementById('message').value.trim();
  if (!message) return;

  const flower = {
    message,
    row: Math.floor(Math.random() * 5),
    left: Math.random() * 60 + 40,
    top: Math.random() * 60 + 40,
    timestamp: Date.now()
  };
  db.ref("flowers").push(flower);
  document.getElementById('message').value = '';
}

function renderFlower(key, data) {
  const garden = document.getElementById('garden');
  const flower = document.createElement('div');
  flower.className = 'flower';

  const rowOffset = data.row * 41;
  flower.style.backgroundPositionY = `-${rowOffset}px`;
  flower.style.backgroundPositionX = '0px';
  flower.style.animation = 'grow-to-2 0.4s steps(1) forwards';
  flower.style.left = data.left + '%';
  flower.style.top = data.top + '%';
  flower.dataset.message = data.message;
  flower.dataset.key = key;

  flower.onclick = () => {
    if (window.shovelMode) {
      db.ref("flowers/" + key).remove();
      document.getElementById("puff-sound").play();
      flower.remove();
    } else {
      flower.style.animation = 'none';
      flower.offsetHeight;
      flower.style.animation = 'grow-to-4 0.6s steps(1) forwards';
      setTimeout(() => {
        document.getElementById('popup-text').innerText = data.message;
        document.getElementById('popup').classList.remove('hidden');
        document.currentFlower = flower;
      }, 600);
    }
  };

  garden.appendChild(flower);
}

function closePopup() {
  document.getElementById('popup').classList.add('hidden');
  const flower = document.currentFlower;
  if (flower) {
    flower.style.animation = 'none';
    flower.offsetHeight;
    flower.style.backgroundPositionX = '-41px';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const slider = document.getElementById("volume-slider");
  const icon = document.getElementById("speaker-icon");
  const shovel = document.getElementById("shovel-icon");
  const tooltip = document.querySelector(".shovel-tooltip");

  music.volume = 0.5;
  icon.addEventListener("click", () => slider.classList.toggle("visible"));
  slider.addEventListener("input", () => music.volume = parseFloat(slider.value));

  // Shovel interaction
  window.shovelMode = false;
  shovel.addEventListener("click", () => {
    window.shovelMode = !window.shovelMode;
    shovel.style.transform = window.shovelMode ? "scale(1.2)" : "scale(1)";
  });
  shovel.addEventListener("mouseenter", () => {
    tooltip.textContent = "Click to remove flowers";
  });
  shovel.addEventListener("mouseleave", () => {
    tooltip.textContent = "";
  });

  // Load flowers
  db.ref("flowers").on("child_added", snapshot => {
    renderFlower(snapshot.key, snapshot.val());
  });
});
