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

document.addEventListener("DOMContentLoaded", function () {
  openDatabase();

  const paletteList = document.getElementById('paletteList');

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

async function loadPalettes() {
  if (navigator.onLine) {
    const palettes = await readPalettes();
    displayPalettes(palettes);
  } else {
    getPalettes(displayPalettes);
  }
}

window.loadPalettes = loadPalettes;

// Initial load
loadPalettes();

// Update UI when coming back online
window.addEventListener('online', () => {
  loadPalettes();
});


  window.addEventListener('offline', loadPalettes);

  loadPalettes();

  // Define loadPalettes in the global scope
  window.loadPalettes = loadPalettes;
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