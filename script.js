// === script.js ===

// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBgtQdwGMzD-8GK4EEnl4Cd_gGuKGWJ9G0",
  authDomain: "virtuallovegarden.firebaseapp.com",
  databaseURL: "https://virtuallovegarden-default-rtdb.firebaseio.com",
  projectId: "virtuallovegarden",
  storageBucket: "virtuallovegarden.firebasestorage.app",
  messagingSenderId: "73424640990",
  appId: "1:73424640990:web:b65870e0892831f0bd1b4f",
  measurementId: "G-3GMCVYZXS8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to add a flower to the screen
function renderFlower(data, id) {
  const garden = document.getElementById('garden');
  if (!garden) return;

  const flower = document.createElement('div');
  flower.className = 'flower';
  flower.dataset.id = id;
  flower.dataset.message = data.message;
  flower.dataset.row = data.row;

  const rowOffset = data.row * 41;
  flower.style.backgroundPositionY = `-${rowOffset}px`;
  flower.style.backgroundPositionX = '0px';
  flower.style.animation = 'grow-to-2 0.4s steps(1) forwards';
  flower.style.left = data.left + '%';
  flower.style.top = data.top + '%';

  flower.onclick = () => {
    if (window.removalMode) {
      db.ref('flowers/' + id).remove();
      flower.remove();
      document.getElementById('puff-sound').play();
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

// Add flower to Firebase and render it
function plantFlower() {
  const message = document.getElementById('message').value.trim();
  if (!message) return;

  const flowerData = {
    message,
    row: Math.floor(Math.random() * 5),
    left: Math.random() * 60 + 20,
    top: Math.random() * 60 + 20,
    timestamp: Date.now()
  };

  const flowerRef = db.ref('flowers').push();
  flowerRef.set(flowerData);
  // No need to call renderFlower manually; it will be handled by child_added
  document.getElementById('message').value = '';
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

// DOM content loaded — all interactive logic starts here
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const slider = document.getElementById("volume-slider");
  const icon = document.getElementById("speaker-icon");

  music.volume = 0.5;

  icon.addEventListener("click", () => {
    slider.classList.toggle("visible");
  });

  slider.addEventListener("input", () => {
    music.volume = parseFloat(slider.value);
  });

  // Shovel logic
  const shovel = document.getElementById("shovel-icon");
  shovel.addEventListener("click", () => {
    window.removalMode = !window.removalMode;
    shovel.classList.toggle("active", window.removalMode);
  });

  // Firebase listeners AFTER DOM is ready
  const flowerRef = db.ref('flowers');

  flowerRef.on('child_added', snapshot => {
    renderFlower(snapshot.val(), snapshot.key);
  });

  flowerRef.on('child_removed', snapshot => {
    const flowerEl = document.querySelector(`.flower[data-id='${snapshot.key}']`);
    if (flowerEl) flowerEl.remove();
  });
});
