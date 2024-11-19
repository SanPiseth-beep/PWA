import { db, collection, setDoc, getDocs, updateDoc, deleteDoc, doc } from './firebaseDB.js';

const palettesCollection = collection(db, 'palettes');

async function createPalette(palette) {
  try {
    const paletteId = palette.id;
    if (!paletteId) {
      console.error('No ID provided for the palette');
      return;
    }
    await setDoc(doc(db, 'palettes', paletteId), palette);
    console.log('Document written with ID: ', paletteId);
    return paletteId;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

async function readPalettes() {
  try {
    const querySnapshot = await getDocs(palettesCollection);
    const palettes = [];
    querySnapshot.forEach((doc) => {
      palettes.push({ id: doc.id, ...doc.data() });
    });
    return palettes;
  } catch (e) {
    console.error('Error reading palettes: ', e);
    return [];
  }
}

async function updatePalette(id, updatedPalette) {
  const paletteDoc = doc(db, 'palettes', id);
  await updateDoc(paletteDoc, updatedPalette);
}

async function deletePalette(id) {
  if (typeof id !== 'string') {
    console.error('Invalid ID:', id);
    return;
  }
  const paletteDoc = doc(db, 'palettes', id);
  await deleteDoc(paletteDoc);
}

export { createPalette, readPalettes, updatePalette, deletePalette };