downloadBtn.addEventListener('click', function() {
    // Create a larger canvas for upscaling
    const enlargedCanvas = document.createElement('canvas');
    const enlargedCtx = enlargedCanvas.getContext('2d');
    enlargedCanvas.width = canvas.width * (isMobile ? 3 : 2);
    enlargedCanvas.height = canvas.height * (isMobile ? 3 : 2);

    // Fill the background with white for JPG export
    enlargedCtx.fillStyle = 'white';
    enlargedCtx.fillRect(0, 0, enlargedCanvas.width, enlargedCanvas.height);

    // Draw base and overlay images on the enlarged canvas with the desired scaling
    if (baseImage) {
        const baseImageScale = isMobile ? 3 : 2; // Upscale by 3x on mobile, 2x on others
        const baseImageX = (enlargedCanvas.width - baseImage.width * baseImageScale) / 2;
        const baseImageY = (enlargedCanvas.height - baseImage.height * baseImageScale) / 2;
        enlargedCtx.drawImage(baseImage, baseImageX, baseImageY, baseImage.width * baseImageScale, baseImage.height * baseImageScale);
    }

    if (overlayImage) {
        const overlayImageX = overlayPosition.x * (isMobile ? 3 : 2);
        const overlayImageY = overlayPosition.y * (isMobile ? 3 : 2);
        const overlayImageWidth = overlayImage.width * overlayImageScale * (isMobile ? 3 : 2);
        const overlayImageHeight = overlayImage.height * overlayImageScale * (isMobile ? 3 : 2);

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

    // Export the enlarged canvas as a JPG image
    const dataURL = enlargedCanvas.toDataURL('image/jpeg', 0.9); // Quality set to 0.9

    // Open the image in a new tab/window
    const newTab = window.open();
    newTab.document.write('<img src="' + dataURL + '" alt="enlarged_image" />');
});
