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
baseImageUpload.addEventListener('change', function (e) {
    loadImage(e.target.files[0], true);
});

// Load overlay image when "ADD PHAT" button is clicked
addOverlayBtn.addEventListener('click', function () {
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
rotateControl.addEventListener('input', function () {
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
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            if (isBase) {
                baseImage = img;
                scaleAndCenterBaseImage();
                drawImages();
            }
        };
        img.src = event.target.result;
    };
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
    img.onload = function () {
        overlayImage = img;
        calculateOverlayScale();
        overlayPosition = { x: 50, y: 50 };
        drawImages();
    };
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
resetBtn.addEventListener('click', function () {
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

// Download button functionality
downloadBtn.addEventListener('click', function () {
    const dataURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'phatted_image.png';
    downloadLink.click();
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
