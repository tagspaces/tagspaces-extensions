// --- Initial State ---
const ImageState = {
    scale: 1,
    fitScale: 1,
    x: 0, y: 0,
    rotate: 0, h: 1, v: 1,
    grayscale: false,
    // Panning State
    isDragging: false,
    startX: 0, startY: 0,
    // Touch State
    lastPinchDist: 0
};

function initCustomViewer(img) {
    if (!img) return { zoom: () => {}, reset: () => {}, rotate: () => {}, flipH: () => {}, flipV: () => {}, toggleGrayscale: () => {} };

    const container = img.parentElement;
    const indicator = document.getElementById('zoomIndicator');
    let timer;

    const showZoom = () => {
        if (!indicator) return;
        const zoomPercent = Math.round((ImageState.scale / ImageState.fitScale) * 100);
        indicator.textContent = zoomPercent + '%';
        indicator.style.opacity = '1';
        clearTimeout(timer);
        timer = setTimeout(() => { if (indicator) indicator.style.opacity = '0'; }, 800);
    };

    const updateTransform = (smooth = true) => {
        if (!img) return;
        img.style.transition = smooth ? 'transform 0.1s ease-out' : 'none';
        // Using translate3d for GPU acceleration
        img.style.transform = `translate3d(${ImageState.x}px, ${ImageState.y}px, 0) 
                               scale(${ImageState.scale * ImageState.h}, ${ImageState.scale * ImageState.v}) 
                               rotate(${ImageState.rotate}deg)`;
    };

    const applyZoom = (delta, focalX, focalY) => {
        const oldScale = ImageState.scale;
        const factor = delta > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(oldScale * factor, 0.05), 50);

        if (newScale === oldScale) return;

        const rect = img.getBoundingClientRect();
        const dx = (focalX - (rect.left + rect.width / 2)) / oldScale;
        const dy = (focalY - (rect.top + rect.height / 2)) / oldScale;

        ImageState.x -= dx * (newScale - oldScale);
        ImageState.y -= dy * (newScale - oldScale);
        ImageState.scale = newScale;

        updateTransform();
        showZoom();
    };

    // --- Mouse Listeners ---
    container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Left click only
        ImageState.isDragging = true;
        ImageState.startX = e.clientX - ImageState.x;
        ImageState.startY = e.clientY - ImageState.y;
        img.style.cursor = 'grabbing';
    });

    // We attach move/up to window so dragging continues if mouse leaves container
    window.addEventListener('mousemove', (e) => {
        if (!ImageState.isDragging) return;
        ImageState.x = e.clientX - ImageState.startX;
        ImageState.y = e.clientY - ImageState.startY;
        updateTransform(false); // No transition during active drag for performance
    });

    window.addEventListener('mouseup', () => {
        ImageState.isDragging = false;
        img.style.cursor = 'grab';
    });

    // --- Touch Listeners ---
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // One finger pan
            ImageState.isDragging = true;
            ImageState.startX = e.touches[0].clientX - ImageState.x;
            ImageState.startY = e.touches[0].clientY - ImageState.y;
        } else if (e.touches.length === 2) {
            // Two finger pinch
            ImageState.isDragging = false;
            ImageState.lastPinchDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX, 
                e.touches[0].pageY - e.touches[1].pageY
            );
        }
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling the whole page
        if (e.touches.length === 1 && ImageState.isDragging) {
            ImageState.x = e.touches[0].clientX - ImageState.startX;
            ImageState.y = e.touches[0].clientY - ImageState.startY;
            updateTransform(false);
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX, 
                e.touches[0].pageY - e.touches[1].pageY
            );
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            applyZoom(ImageState.lastPinchDist - dist, midX, midY);
            ImageState.lastPinchDist = dist;
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        ImageState.isDragging = false;
    });

    // Wheel Zoom
    container.addEventListener('wheel', e => {
        e.preventDefault();
        applyZoom(e.deltaY, e.clientX, e.clientY);
    }, { passive: false });

    // --- Public API ---
    const resetToFit = () => {
        if (!img.naturalWidth) return;
        const vW = window.innerWidth, vH = window.innerHeight;
        ImageState.fitScale = Math.min(vW / img.naturalWidth, vH / img.naturalHeight) * 0.95;
        ImageState.scale = ImageState.fitScale;
        ImageState.x = 0; ImageState.y = 0; ImageState.rotate = 0;
        ImageState.h = 1; ImageState.v = 1; ImageState.grayscale = false;
        img.style.filter = 'none';
        img.style.visibility = 'visible';
        updateTransform(false);
    };

    resetToFit();

    return {
        zoom: (delta) => applyZoom(delta, window.innerWidth / 2, window.innerHeight / 2),
        rotate: (deg) => { ImageState.rotate += deg; updateTransform(); },
        flipH: () => { ImageState.h *= -1; updateTransform(); },
        flipV: () => { ImageState.v *= -1; updateTransform(); },
        toggleGrayscale: () => {
            ImageState.grayscale = !ImageState.grayscale;
            img.style.filter = ImageState.grayscale ? 'grayscale(100%)' : 'none';
        },
        reset: resetToFit
    };
}