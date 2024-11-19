const dbName = 'PalettePickerDB';
const dbVersion = 2; // Increment the version to trigger onupgradeneeded
let db;

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = function(event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains('palettes')) {
        db.createObjectStore('palettes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('deletedPalettes')) {
        db.createObjectStore('deletedPalettes', { keyPath: 'id' });
      }
    };

    request.onsuccess = function(event) {
      db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onerror = function(event) {
      console.error('Database error:', event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

async function savePalette(palette) {
  if (!db) {
    await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['palettes'], 'readwrite');
    const store = transaction.objectStore('palettes');
    if (!palette.id) {
      palette.id = generateId(); // Generate a unique id if it doesn't exist
    }
    const request = store.put(palette); // Use put to update or add
    request.onsuccess = function(event) {
      resolve(palette); // Return the palette with the id
    };
    request.onerror = function(event) {
      reject(event.target.errorCode);
    };
  });
}

function getPalettes(callback) {
  if (!db) {
    openDatabase().then(() => {
      const transaction = db.transaction(['palettes'], 'readonly');
      const store = transaction.objectStore('palettes');
      const request = store.getAll();

      request.onsuccess = function(event) {
        callback(event.target.result);
      };

      request.onerror = function(event) {
        console.error('Error getting palettes:', event.target.errorCode);
      };
    });
  } else {
    const transaction = db.transaction(['palettes'], 'readonly');
    const store = transaction.objectStore('palettes');
    const request = store.getAll();

    request.onsuccess = function(event) {
      callback(event.target.result);
    };

    request.onerror = function(event) {
      console.error('Error getting palettes:', event.target.errorCode);
    };
  }
}

function deletePalette(id) {
  if (!db) {
    openDatabase().then(() => deletePalette(id));
    return;
  }
  const transaction = db.transaction(['palettes', 'deletedPalettes'], 'readwrite');
  const paletteStore = transaction.objectStore('palettes');
  const deletedStore = transaction.objectStore('deletedPalettes');
  paletteStore.delete(id);
  deletedStore.put({ id });
}

async function clearIndexedDB() {
  if (!db) {
    await openDatabase();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['palettes', 'deletedPalettes'], 'readwrite');
    const paletteStore = transaction.objectStore('palettes');
    const deletedStore = transaction.objectStore('deletedPalettes');

    const paletteClearRequest = paletteStore.clear();
    const deletedClearRequest = deletedStore.clear();

    paletteClearRequest.onsuccess = function() {
      console.log('Palettes store cleared');
    };
    paletteClearRequest.onerror = function(event) {
      console.error('Error clearing palettes store:', event.target.errorCode);
      reject(event.target.errorCode);
    };

    deletedClearRequest.onsuccess = function() {
      console.log('DeletedPalettes store cleared');
      resolve();
    };
    deletedClearRequest.onerror = function(event) {
      console.error('Error clearing deletedPalettes store:', event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

function getDeletedPalettes(callback) {
  if (!db) {
    openDatabase().then(() => {
      const transaction = db.transaction(['deletedPalettes'], 'readonly');
      const store = transaction.objectStore('deletedPalettes');
      const request = store.getAll();

      request.onsuccess = function(event) {
        callback(event.target.result);
      };

      request.onerror = function(event) {
        console.error('Error getting deleted palettes:', event.target.errorCode);
      };
    });
  } else {
    const transaction = db.transaction(['deletedPalettes'], 'readonly');
    const store = transaction.objectStore('deletedPalettes');
    const request = store.getAll();

    request.onsuccess = function(event) {
      callback(event.target.result);
    };

    request.onerror = function(event) {
      console.error('Error getting deleted palettes:', event.target.errorCode);
    };
  }
}

export {
  openDatabase,
  savePalette,
  getPalettes,
  deletePalette,
  clearIndexedDB,
  getDeletedPalettes
};