import { db, collection, setDoc, getDocs, updateDoc, deleteDoc, doc } from './firebaseDB.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const auth = getAuth();

async function createPalette(palette) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const paletteId = palette.id || generateId();
    await setDoc(doc(db, `users/${user.uid}/palettes`, paletteId), palette);
    console.log('Document written with ID: ', paletteId);
    return paletteId;
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

async function readPalettes() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const querySnapshot = await getDocs(collection(db, `users/${user.uid}/palettes`));
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
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const paletteDoc = doc(db, `users/${user.uid}/palettes`, id);
  await updateDoc(paletteDoc, updatedPalette);
}

async function deletePalette(id) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const paletteDoc = doc(db, `users/${user.uid}/palettes`, id);
  await deleteDoc(paletteDoc);
}

export { createPalette, readPalettes, updatePalette, deletePalette };