import {
  openDatabase,
  getPalettes,
  deletePalette as deleteIndexedDBPalette
} from './indexedDB.js';
import {
  readPalettes,
  deletePalette as deleteFirestorePalette
} from './firebaseCRUD.js';
import { syncData } from './sync.js';
import { signIn, signOutUser } from './firebaseAuth.js';
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  openDatabase();

  const paletteList = document.getElementById('paletteList');
  if (!paletteList) {
    console.error('paletteList element not found');
    return;
  }

  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const mobileLoginButton = document.getElementById('mobileLoginButton');
  const mobileLogoutButton = document.getElementById('mobileLogoutButton');

  function displayPalettes(palettes) {
    paletteList.innerHTML = '';
    if (palettes && palettes.length > 0) {
      palettes.forEach(palette => {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'palette';

        // Create swatch elements for each color
        palette.colors.forEach(color => {
          const swatch = document.createElement('div');
          swatch.className = 'swatch';
          swatch.style.backgroundColor = color;
          swatch.style.border = '1px solid #fff'; // Add a white border for visibility
          swatch.style.width = '50px';
          swatch.style.height = '50px';
          swatch.style.display = 'inline-block';
          swatch.style.margin = '2px';
          swatch.style.position = 'relative';

          // Create a span to display the RGB code
          const rgbCode = document.createElement('span');
          rgbCode.textContent = color;
          rgbCode.style.position = 'absolute';
          rgbCode.style.bottom = '0';
          rgbCode.style.left = '0';
          rgbCode.style.width = '100%';
          rgbCode.style.textAlign = 'center';
          rgbCode.style.fontSize = '10px';
          rgbCode.style.color = '#fff';
          rgbCode.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background for readability

          swatch.appendChild(rgbCode);
          paletteDiv.appendChild(swatch);
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = async () => {
        await window.deletePalette(String(palette.id));
        loadPalettes(); // Reload palettes after deletion
      };
      paletteDiv.appendChild(deleteButton);

      paletteList.appendChild(paletteDiv);
    });
  } else {
    paletteList.innerHTML = '<p>No palettes available.</p>';
  }
}

// ...existing code...

async function loadPalettes() {
  const user = getAuth().currentUser;
  if (navigator.onLine) {
    if (user) {
      const palettes = await readPalettes();
      displayPalettes(palettes);
    } else {
      console.error('Error reading palettes: User not authenticated');
      paletteList.innerHTML = '<p>Please log in to see your saved palettes.</p>';
    }
  } else {
    if (user) {
      getPalettes(displayPalettes);
    } else {
      paletteList.innerHTML = '<p>Please log in to see your saved palettes.</p>';
    }
  }
}

// ...existing code...

window.loadPalettes = loadPalettes;

// Initial load
loadPalettes();

// Update UI when coming back online
window.addEventListener('online', () => {
  loadPalettes();
});

window.addEventListener('offline', loadPalettes);

// Sign-in form handling
if (document.getElementById('signInForm')) {
  document.getElementById('signInForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    await signIn(email, password);
    loadPalettes(); // Load palettes after successful login
  });
}

// Sign-out button handling
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await signOutUser();
    window.location.href = '/';
  });
}

if (mobileLogoutButton) {
  mobileLogoutButton.addEventListener('click', async () => {
    await signOutUser();
    window.location.href = '/';
  });
}

// Update login/logout button visibility based on authentication state
const auth = getAuth();
auth.onAuthStateChanged((user) => {
  if (user) {
    if (loginButton) loginButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'block';
    if (mobileLoginButton) mobileLoginButton.style.display = 'none';
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'block';
    loadPalettes(); // Load palettes after user logs in
  } else {
    if (loginButton) loginButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
    if (mobileLoginButton) mobileLoginButton.style.display = 'block';
    if (mobileLogoutButton) mobileLogoutButton.style.display = 'none';
  }
});

// Define deletePalette in the global scope
window.deletePalette = async function(id) {
  if (navigator.onLine) {
    // Delete from Firestore
    await deleteFirestorePalette(String(id));
  } else {
    // Delete from IndexedDB
    await deleteIndexedDBPalette(id);
  }

  // Reload palettes
  window.loadPalettes();
};

async function signUp(email, password) {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Signed up:', userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error);
  }
}
});