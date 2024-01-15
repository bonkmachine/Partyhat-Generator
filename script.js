<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>PARTYHAT GENERATOR</title>
</head>
<body>
    <div class="wrapper">
        <div class="control-panel">
            <h2>PARTYHAT GENERATOR</h2>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    color: #FFFFFF; /* Change text color to black */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: auto;
                    margin: 0;
                    background-color: #000000;
                }

                .wrapper {
                    background-repeat: no-repeat;
                    background-size: cover;
                    margin: 20px;
                    display: flex;
                    background-color: #232323;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border-radius: 10px;
                }

                .control-panel {
                    padding: 32px;
                    background-repeat: no-repeat;
                    background-size: 100% 100%;
                    background-position: center;
                    border-right: 10px solid #000000;
                }

                .canvas-container {
                    flex-grow: 1;
                    padding: 32px;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
                    background: none;
                }

                button {
                    margin-top: 16px;
                    padding: 8px 12px;
                    border: none;
                    background-color: #f9c404;
                    color: black;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #a6820c;
                }

                label {
                    display: block;
                    margin-top: 15px;
                    font-weight: bold;
                }

                input[type="file"] {
                    margin-top: 8px;
                }

                input[type="range"] {
                    margin-top: 10px;
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 6px;
                    background: #e4e4e4;
                    border-radius: 4px;
                    outline: none;
                    transition: opacity 0.2s;
                }

                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 15px;
                    height: 15px;
                    background: #f3bf12;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                input[type="range"]::-webkit-slider-thumb:hover {
                    background: #340f0e;
                }

                input[type="range"]:focus {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .wrapper {
                        flex-direction: column;
                        width: 100%;
                        padding: 0;
                    }

                    .canvas-container {
                        padding: 24px;
                    }

                    .control-panel {
                        padding: 24px;
                        border-right: 0px solid #111111;
                        border-bottom: 10px solid #111111;
                    }

                    input[type="range"]::-webkit-slider-thumb {
                        width: 18px;
                        height: 18px;
                    }
                }
            </style>
            <label for="baseImageUpload">Upload Image:</label>
            <input type="file" id="baseImageUpload">
            <br>
            <button id="addOverlayBtn">ADD PHAT</button>
            <button id="resetBtn">Reset</button>
            <br>
            <label for="resizeControl">Resize Partyhat</label>
            <input type="range" id="resizeControl" min="1" max="100" step="1" value="50">
            <br>
            <label for="rotateControl">Rotate Partyhat</label>
            <input type="range" id="rotateControl" min="0" max="360" step="1" value="180">
            <br>
            <button id="downloadBtn">Download </button>
            <br>
        </div>
        <div class="canvas-container">
            <canvas id="imageCanvas"></canvas>
        </div>
    </div>
    <script src="script.js"></script>
<script>
'use strict';

// Get references to HTML elements
const baseImageUpload = document.getElementById('baseImageUpload');
const addOverlayBtn = document.getElementById('addOverlayBtn');
const resizeControl = document.getElementById('resizeControl');
const rotateControl = document.getElementById('rotateControl');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialize variables
let baseImage = null;
let overlayImage = null;
let overlayImageScale = 0.2; // Initial scale (20%)
let overlayRotation = 180;
let overlayPosition = { x: 50, y: 50 };
let isDragging = false;
let dragStartX, dragStartY;

// Overlay image URL
const overlayImageUrl = 'https://i.ibb.co/NFMp0jq/partyhatforweb.png';

// Add an initial call to setCanvasDimensions to ensure canvas dimensions are set correctly on page load
setCanvasDimensions();

// Add an event listener to update canvas dimensions when the window is resized
window.addEventListener('resize', setCanvasDimensions);

// Load base image when a file is selected
baseImageUpload.addEventListener('change', function(e) {
    loadImage(e.target.files[0], true);
});

// Load overlay image when "ADD PHAT" button is clicked
addOverlayBtn.addEventListener('click', function() {
    loadOverlayImage(overlayImageUrl);
});

// Handle resizing of the overlay image from the center
resizeControl.addEventListener('input', function () {
    if (baseImage && overlayImage) {
        const newScale = resizeControl.value / 100;
        const centerX = overlayPosition.x + (overlayImage.width * overlayImageScale) / 2;
        const centerY = overlayPosition.y + (overlayImage.height * overlayImageScale) / 2;
        
        overlayImageScale = newScale;

        // Calculate the new position to keep the center of the overlay image fixed
        overlayPosition.x = centerX - (overlayImage.width * overlayImageScale) / 2;
        overlayPosition.y = centerY - (overlayImage.height * overlayImageScale) / 2;

        drawImages();
    }
});

// Handle rotation of the overlay image
rotateControl.addEventListener('input', function() {
    overlayRotation = parseInt(rotateControl.value);
    drawImages();
});

// Mouse interactions for dragging
canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', dragImage);
canvas.addEventListener('mouseup', stopDragging);

// Touch interactions for dragging
canvas.addEventListener('touchstart', startDragging);
canvas.addEventListener('touchmove', dragImage);
canvas.addEventListener('touchend', stopDragging);

// Function to handle touchmove on the entire document
function preventDocumentScroll(e) {
    e.preventDefault();
}

// Load image and display it on the canvas
function loadImage(file, isBase) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            if (isBase) {
                baseImage = img;
                scaleAndCenterBaseImage();
                drawImages();
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// Scale and center base image to fit the canvas while maintaining aspect ratio
function scaleAndCenterBaseImage() {
    const canvasAspectRatio = canvas.width / canvas.height;
    const imageAspectRatio = baseImage.width / baseImage.height;
    let scale;

    if (canvasAspectRatio > imageAspectRatio) {
        scale = canvas.height / baseImage.height;
        baseImage.width *= scale;
        baseImage.height *= scale;
    } else {
        scale = canvas.width / baseImage.width;
        baseImage.width *= scale;
        baseImage.height *= scale;
    }

    // Center the image on the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    overlayPosition = { x: centerX - baseImage.width / 2, y: centerY - baseImage.height / 2 };
}

// Load overlay image and display it on the canvas
function loadOverlayImage(url) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        overlayImage = img;
        calculateOverlayScale();
        overlayPosition = { x: 50, y: 50 };
        drawImages();
    }
    img.src = url;
}

// Scale base image to fit the canvas while maintaining aspect ratio
function scaleBaseImageToFitCanvas() {
    let scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height);
    baseImage.width *= scale;
    baseImage.height *= scale;
}

// Calculate initial scale for overlay image
function calculateOverlayScale() {
    if (baseImage && overlayImage) {
        overlayImageScale = 0.2 * (baseImage.width / overlayImage.width);
        resizeControl.value = overlayImageScale * 100;
    }
}

// Start dragging overlay image
function startDragging(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.type === 'mousedown') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    if (mouseX >= overlayPosition.x && mouseX <= overlayPosition.x + overlayImage.width * overlayImageScale &&
        mouseY >= overlayPosition.y && mouseY <= overlayPosition.y + overlayImage.height * overlayImageScale) {
        isDragging = true;
        dragStartX = mouseX - overlayPosition.x;
        dragStartY = mouseY - overlayPosition.y;

        // Prevent document scrolling during dragging on mobile
        document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    }
}

// Drag overlay image
function dragImage(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        overlayPosition.x = clientX - rect.left - dragStartX;
        overlayPosition.y = clientY - rect.top - dragStartY;
        drawImages();
    }
}

// Stop dragging overlay image
function stopDragging() {
    isDragging = false;

    // Remove the event listener to allow document scrolling again
    document.removeEventListener('touchmove', preventDocumentScroll);
}


// Draw base and overlay images on the canvas
function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage) {
                ctx.drawImage(baseImage, (canvas.width - baseImage.width) / 2, (canvas.height - baseImage.height) / 2, baseImage.width, baseImage.height);
    }

    if (overlayImage) {
        ctx.save();
        ctx.translate(overlayPosition.x + overlayImage.width * overlayImageScale / 2, overlayPosition.y + overlayImage.height * overlayImageScale / 2);
        ctx.rotate(overlayRotation * Math.PI / 180);
        ctx.drawImage(overlayImage, -overlayImage.width * overlayImageScale / 2, -overlayImage.height * overlayImageScale / 2, overlayImage.width * overlayImageScale, overlayImage.height * overlayImageScale);
        ctx.restore();
    }
}

// Reset button functionality
resetBtn.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    baseImage = null;
    overlayImage = null;
    overlayImageScale = 0.2;
    overlayRotation = 0;
    overlayPosition = { x: 50, y: 50 };
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    baseImageUpload.value = '';
    resizeControl.value = 20;
    rotateControl.value = 0;
    drawImages();
});

downloadBtn.addEventListener('click', function() {
    // Create a larger canvas for upscaling (3x on mobile, 2x on desktop)
    const scaleFactor = window.innerWidth <= 768 ? 3 : 2;
    const enlargedCanvas = document.createElement('canvas');
    const enlargedCtx = enlargedCanvas.getContext('2d');
    enlargedCanvas.width = canvas.width * scaleFactor;
    enlargedCanvas.height = canvas.height * scaleFactor;

    // Draw base and overlay images on the enlarged canvas with the desired scaling
    if (baseImage) {
        const baseImageScale = scaleFactor; // Upscale by 3x on mobile, 2x on desktop
        const baseImageX = (enlargedCanvas.width - baseImage.width * baseImageScale) / 2;
        const baseImageY = (enlargedCanvas.height - baseImage.height * baseImageScale) / 2;
        enlargedCtx.drawImage(baseImage, baseImageX, baseImageY, baseImage.width * baseImageScale, baseImage.height * baseImageScale);
    }

    if (overlayImage) {
        const overlayImageX = overlayPosition.x * scaleFactor;
        const overlayImageY = overlayPosition.y * scaleFactor;
        const overlayImageWidth = overlayImage.width * overlayImageScale * scaleFactor;
        const overlayImageHeight = overlayImage.height * overlayImageScale * scaleFactor;

        enlargedCtx.save();
        enlargedCtx.translate(
            overlayImageX + overlayImageWidth / 2,
            overlayImageY + overlayImageHeight / 2
        );
        enlargedCtx.rotate(overlayRotation * Math.PI / 180);
        enlargedCtx.drawImage(
            overlayImage,
            -overlayImageWidth / 2,
            -overlayImageHeight / 2,
            overlayImageWidth,
            overlayImageHeight
        );
        enlargedCtx.restore();
    }

    // Export the enlarged canvas as an image (JPG format)
    const dataURL = enlargedCanvas.toDataURL('image/png'); // Use JPEG format with 80% quality
    
    // Open the image in a new tab/window
    const newTab = window.open();
    newTab.document.write('<img src="' + dataURL + '" alt="phatted_image" />');
});




// Function to set canvas dimensions dynamically
function setCanvasDimensions() {
    const maxWidthMobile = 300; // Maximum width for mobile

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if it's a mobile device (you can adjust this condition as needed)
    const isMobile = viewportWidth <= 768; // Adjust the breakpoint if necessary

    if (isMobile) {
        canvas.width = maxWidthMobile;
        canvas.height = maxWidthMobile; // Set the canvas width and height to 300px for mobile
    } else {
        const maxWidth = 600;
        const maxHeight = 600;
        const aspectRatio = maxWidth / maxHeight;

        // Calculate canvas dimensions based on screen size and aspect ratio
        if (viewportWidth < maxWidth || viewportHeight < maxHeight) {
            if (viewportWidth / viewportHeight > aspectRatio) {
                canvas.width = viewportHeight * aspectRatio;
                canvas.height = viewportHeight;
            } else {
                canvas.width = viewportWidth;
                canvas.height = viewportWidth / aspectRatio;
            }
        } else {
            canvas.width = maxWidth;
            canvas.height = maxHeight;
        }
    }

    // Redraw images when canvas dimensions change
    if (baseImage) {
        scaleBaseImageToFitCanvas();
        calculateOverlayScale();
        drawImages();
    }
}
</script>
</body>
</html>
