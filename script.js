// === script.js ===

// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBgtQdwGMzD-8GK4EEnl4Cd_gGuKGWJ9G0",
  authDomain: "virtuallovegarden.firebaseapp.com",
  databaseURL: "https://virtuallovegarden-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ Updated to correct region
  projectId: "virtuallovegarden",
  storageBucket: "virtuallovegarden.firebasestorage.app",
  messagingSenderId: "73424640990",
  appId: "1:73424640990:web:b65870e0892831f0bd1b4f",
  measurementId: "G-3GMCVYZXS8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ✅ Check Firebase connection
firebase.database().ref('.info/connected').on('value', (snap) => {
  console.log("🔌 Firebase connected:", snap.val());
});

// === Flower Rendering ===
function renderFlower(data, id) {
  const garden = document.getElementById('garden');
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
function plantFlower() {
  const message = document.getElementById('message').value.trim();
  if (!message) return;

  const flowerData = {
    message: message,
    row: Math.floor(Math.random() * 5),
    left: Math.random() * 60 + 40,  // 40% to 100% = right 60% of page
    top: Math.random() * 60 + 40,   // 40% to 100% = bottom 60% of page
    timestamp: Date.now()
  };

  const flowerRef = db.ref('flowers').push();
  flowerRef.set(flowerData)
    .then(() => {
      renderFlower(flowerData, flowerRef.key);
    })
    .catch(err => {
      console.error("Error saving flower:", err);
    });

  document.getElementById('message').value = '';
}



// === Realtime Sync ===
const flowerRef = db.ref('flowers');

// Add flowers in realtime
flowerRef.on('child_added', snapshot => {
  console.log("🌼 Loaded flower:", snapshot.val());
  renderFlower(snapshot.val(), snapshot.key);
});

// Remove flowers in realtime
flowerRef.on('child_removed', snapshot => {
  const flowerEl = document.querySelector(`.flower[data-id='${snapshot.key}']`);
  if (flowerEl) flowerEl.remove();
});

// === Close popup ===
function closePopup() {
  document.getElementById('popup').classList.add('hidden');
  const flower = document.currentFlower;
  if (flower) {
    flower.style.animation = 'none';
    flower.offsetHeight;
    flower.style.backgroundPositionX = '-41px';
  }
}

// === Music & Shovel Logic ===
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

  // Shovel removal mode toggle
  const shovel = document.getElementById("shovel-icon");
  shovel.addEventListener("click", () => {
    window.removalMode = !window.removalMode;
    shovel.classList.toggle("active", window.removalMode);
  });
});
