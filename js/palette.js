// truncateFileName function to truncate file name if it exceeds maxLength
function truncateFileName(fileName, maxLength) {
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    let nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    if (nameWithoutExtension.length > maxLength) {
        nameWithoutExtension = nameWithoutExtension.substring(0, maxLength) + '...';
    }
    return nameWithoutExtension + fileExtension;
}

// Event listener for file input change
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }

    const truncatedName = truncateFileName(file.name, 10);
    console.log('Truncated file name:', truncatedName);
    const img = new Image();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imagePreview = document.getElementById('imagePreview'); // Get the img element

    img.onload = () => {
        console.log('Image loaded successfully');

        // Display the image on the webpage
        imagePreview.src = img.src;
        imagePreview.style.display = 'block'; // Make the image visible

        // Downscale the image to 100x100 for faster processing
        const MAX_SIZE = 100;
        const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get the image data
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log('ImageData:', imageData);
            const colors = getColors(imageData);
            console.log('Extracted Colors:', colors);
            displaySwatches(colors);
        } catch (error) {
            console.error('Error extracting image data:', error);
        }
    };

    img.onerror = () => {
        console.error('Failed to load image');
    };

    // Read the image file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        imagePreview.src = e.target.result; // Set the img element's src to the uploaded image
        imagePreview.style.display = 'block'; // Make the image visible
    };
    reader.readAsDataURL(file);
});

// Clear button functionality
document.getElementById('clearButton').addEventListener('click', function() {
    // Clear the file input
    document.getElementById('imageInput').value = '';

    // Clear the canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the swatches
    const swatchesContainer = document.getElementById('swatches');
    swatchesContainer.innerHTML = '';

    // Clear the image preview
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = '';
    imagePreview.style.display = 'none';
});

// Utility function: Get Euclidean distance between two colors in RGB space
function getColorDistance(color1, color2) {
    return Math.sqrt(
        Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2)
    );
}

// Utility function: Random color generator
function getRandomColor() {
    return [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    ];
}

// K-Means Clustering to find dominant colors
function kMeans(imageData, k = 5, iterations = 10) {
    const data = imageData.data;
    let clusters = new Array(k).fill(0).map(getRandomColor); // Random initial centroids
    let clusterAssignments = new Array(data.length / 4);
    
    for (let iter = 0; iter < iterations; iter++) {
        // Step 1: Assign pixels to the nearest cluster
        for (let i = 0; i < data.length; i += 4) {
            const pixel = [data[i], data[i + 1], data[i + 2]];
            let minDistance = Infinity;
            let closestCluster = 0;
            
            clusters.forEach((cluster, idx) => {
                const distance = getColorDistance(pixel, cluster);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = idx;
                }
            });

            clusterAssignments[i / 4] = closestCluster;
        }

        const newClusters = new Array(k).fill(0).map(() => [0, 0, 0, 0]); // [rSum, gSum, bSum, count]
        
        // Step 2: Update cluster centroids
        for (let i = 0; i < data.length; i += 4) {
            const clusterIdx = clusterAssignments[i / 4];
            newClusters[clusterIdx][0] += data[i];
            newClusters[clusterIdx][1] += data[i + 1];
            newClusters[clusterIdx][2] += data[i + 2];
            newClusters[clusterIdx][3] += 1;
        }
        
        // Step 3: Calculate new centroids
        for (let j = 0; j < k; j++) {
            const count = newClusters[j][3];
            if (count > 0) {
                clusters[j] = [
                    Math.floor(newClusters[j][0] / count),
                    Math.floor(newClusters[j][1] / count),
                    Math.floor(newClusters[j][2] / count)
                ];
            }
        }
    }
    
    return clusters.map(color => `rgb(${color[0]},${color[1]},${color[2]})`);
}

// Modified function to get colors using K-Means clustering
function getColors(imageData) {
    const k = 6; // Number of colors to extract
    return kMeans(imageData, k);
}

// Event listener for file input change (duplicate, can be removed)
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error('No file selected');
        return;
    }

    const img = new Image();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
        console.log('Image loaded successfully');

        // Downscale the image to 100x100 for faster processing
        const MAX_SIZE = 100;
        const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get the image data
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            console.log('ImageData:', imageData);
            const colors = getColors(imageData);
            console.log('Extracted Colors:', colors);
            displaySwatches(colors);
        } catch (error) {
            console.error('Error extracting image data:', error);
        }
    };

    img.onerror = () => {
        console.error('Failed to load image');
    };

    // Read the image file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Function to display color swatches
function displaySwatches(colors) {
    const swatchesContainer = document.getElementById('swatches');
    swatchesContainer.innerHTML = ''; // Clear previous swatches

    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        swatch.style.border = '1px solid #fff'; // Add a white border for visibility
        
        // Optional: Display the color value as text
        swatch.textContent = color;
        swatch.style.color = '#fff'; // Set text color to white
        swatch.style.fontSize = '12px';
        swatch.style.textAlign = 'center';
        swatch.style.lineHeight = '50px'; // To center the text vertically

        swatchesContainer.appendChild(swatch);
    });
}
