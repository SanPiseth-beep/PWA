import {
  createPalette,
  readPalettes,
  deletePalette as deleteFirestorePalette
} from './firebaseCRUD.js';
import {
  openDatabase,
  getPalettes,
  deletePalette as deleteIndexedDBPalette,
  getDeletedPalettes,
  clearIndexedDB
} from './indexedDB.js';

let isSyncing = false;
let db;

async function syncData() {
  if (navigator.onLine && !isSyncing) {
    isSyncing = true;
    console.log('Starting sync...');
    try {
      db = await openDatabase();
      const palettes = await new Promise((resolve) => getPalettes(resolve));
      const deletedPalettes = await new Promise((resolve) => getDeletedPalettes(resolve));
      const deletedPaletteIds = new Set(deletedPalettes.map(palette => palette.id));
      const existingPalettes = await readPalettes();
      const existingPaletteIds = new Set(existingPalettes.map(palette => palette.id));

      // Delete palettes from Firestore that have been deleted offline
      for (const id of deletedPaletteIds) {
        if (existingPaletteIds.has(id)) {
          await deleteFirestorePalette(id);
        }
      }

      // Sync new palettes to Firestore
      for (const palette of palettes) {
        const { id } = palette;

        if (!existingPaletteIds.has(id) && !deletedPaletteIds.has(id)) {
          await createPalette(palette);
        }
        await deleteIndexedDBPalette(id);
      }

      console.log('Sync completed.');
      await clearDeletedPalettes(); // Clear the deletedPalettes store after syncing

      // Update the UI after syncing
      if (window.loadPalettes) {
        window.loadPalettes();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      isSyncing = false;
    }
  }
}

async function clearDeletedPalettes() {
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['deletedPalettes'], 'readwrite');
    const store = transaction.objectStore('deletedPalettes');
    const request = store.clear();
    request.onsuccess = function () {
      console.log('Deleted palettes cleared');
      resolve();
    };
    request.onerror = function (event) {
      console.error('Error clearing deleted palettes:', event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

// Listen for the online event to trigger sync
window.addEventListener('online', () => {
  syncData();
});

openDatabase().then(database => {
  db = database;
});

export { syncData };