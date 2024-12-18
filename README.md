# Project Overview

This project is a web-based prototype for the Design a PWA Application Prototypet. The goal is to create a functional and interactive web application that demonstrates the core concepts learned during the semester.

## APP Description
This is a Palette Picker app that allows users to generate color palettes from an uploaded image. Users can upload an image, and the app will generate a color palette and RGB color code based on the image's colors. 

## Viewing the Prototype

To view the prototype, follow these steps:

1. Clone the repository to your local machine:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd <project-directory>
    ```
3. put the `config.js` file in to the `js` folder
4. Open the `index.html` file in your preferred web browser.


## Firebase and IndexedDB Integration

The application uses Firebase Firestore for online data storage and IndexedDB for offline data storage. This ensures that users can continue to use the app even when they are offline.

## Using CRUD Operations

### Online Mode
- **Create**: When online, palettes are saved to Firebase Firestore.
- **Read**: Palettes are fetched from Firebase Firestore.
- **Update**: Updates to palettes are saved to Firebase Firestore.
- **Delete**: Palettes are deleted from Firebase Firestore.

### Offline Mode
- **Create**: When offline, palettes are saved to IndexedDB.
- **Read**: Palettes are fetched from IndexedDB.
- **Update**: Updates to palettes are saved to IndexedDB.
- **Delete**: Palettes are deleted from IndexedDB.

## Synchronization Process

When the application detects an internet connection, it synchronizes data between IndexedDB and Firebase Firestore. The synchronization process works as follows:
1. **Fetch Data**: The app fetches palettes from both IndexedDB and Firebase Firestore.
2. **Identify Changes**: It identifies new, updated, and deleted palettes.
3. **Sync Data**: 
   - New palettes created offline are added to Firebase Firestore.
   - Updated palettes are synchronized between IndexedDB and Firebase Firestore.
   - Deleted palettes are removed from Firebase Firestore if they were deleted offline.
4. **Maintain IDs**: Firebase IDs are maintained to ensure consistency between the online and offline databases.

## Additional Information

- Ensure you have a stable internet connection to load any external resources.
- The prototype is best viewed on modern web browsers like Chrome, Firefox, or Edge.
- For any issues or questions, please refer to the project's documentation or contact the project maintainer.

## limitations
- The app only generates a color palette from the uploaded image. It does not save the palette or allow users to download it.
- The palette that is generated is not alway 100% accurate. due to the baisc algorithm used to generate the colors.

Thank you for checking out our project!

