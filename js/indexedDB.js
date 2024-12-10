import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
        const paletteStore = db.createObjectStore('palettes', { keyPath: 'id' });
        paletteStore.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('deletedPalettes')) {
        const deletedStore = db.createObjectStore('deletedPalettes', { keyPath: 'id' });
        deletedStore.createIndex('userId', 'userId', { unique: false });
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
  const user = getAuth().currentUser;
  if (!user) throw new Error('User not authenticated');
  if (!db) {
    db = await openDatabase();
  }
  return new Promise((resolve, reject) => {
    if (!db) {
      reject('Database not initialized');
      return;
    }
    const transaction = db.transaction(['palettes'], 'readwrite');
    const store = transaction.objectStore('palettes');
    if (!palette.id) {
      palette.id = generateId(); // Generate a unique id if it doesn't exist
    }
    palette.userId = user.uid;
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
  const user = getAuth().currentUser;
  if (!user) throw new Error('User not authenticated');
  if (!db) {
    openDatabase().then(() => {
      const transaction = db.transaction(['palettes'], 'readonly');
      const store = transaction.objectStore('palettes');
      const request = store.index('userId').getAll(user.uid);

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
    const request = store.index('userId').getAll(user.uid);

    request.onsuccess = function(event) {
      callback(event.target.result);
    };

    request.onerror = function(event) {
      console.error('Error getting palettes:', event.target.errorCode);
    };
  }
}

function deletePalette(id) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('User not authenticated');
  if (!db) {
    openDatabase().then(() => deletePalette(id));
    return;
  }
  const transaction = db.transaction(['palettes', 'deletedPalettes'], 'readwrite');
  const paletteStore = transaction.objectStore('palettes');
  const deletedStore = transaction.objectStore('deletedPalettes');
  paletteStore.delete(id);
  deletedStore.put({ id, userId: user.uid });
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
  const user = getAuth().currentUser;
  if (!user) throw new Error('User not authenticated');
  if (!db) {
    openDatabase().then(() => {
      const transaction = db.transaction(['deletedPalettes'], 'readonly');
      const store = transaction.objectStore('deletedPalettes');
      const request = store.index('userId').getAll(user.uid);

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
    const request = store.index('userId').getAll(user.uid);

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