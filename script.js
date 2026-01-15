// State management
let state = {
    originalImage: null,
    originalImageData: null,
    currentSettings: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        vignette: 0
    }
};

// DOM Elements
const uploadSection = document.getElementById('upload-section');
const processingSection = document.getElementById('processing-section');
const previewSection = document.getElementById('preview-section');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const originalCanvas = document.getElementById('original-canvas');
const enhancedCanvas = document.getElementById('enhanced-canvas');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const newPhotoBtn = document.getElementById('new-photo-btn');

// Control elements
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blur');
const vignetteSlider = document.getElementById('vignette');

const brightnessValue = document.getElementById('brightness-value');
const contrastValue = document.getElementById('contrast-value');
const saturationValue = document.getElementById('saturation-value');
const blurValue = document.getElementById('blur-value');
const vignetteValue = document.getElementById('vignette-value');

// Initialize event listeners
function init() {
    // Upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Control events
    brightnessSlider.addEventListener('input', handleBrightnessChange);
    contrastSlider.addEventListener('input', handleContrastChange);
    saturationSlider.addEventListener('input', handleSaturationChange);
    blurSlider.addEventListener('input', handleBlurChange);
    vignetteSlider.addEventListener('input', handleVignetteChange);
    
    // Button events
    downloadBtn.addEventListener('click', handleDownload);
    resetBtn.addEventListener('click', handleReset);
    newPhotoBtn.addEventListener('click', handleNewPhoto);
}

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

// Image processing
function processImage(file) {
    showSection(processingSection);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            prepareCanvases(img);
            applyEnhancements();
            setTimeout(() => showSection(previewSection), 500);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function prepareCanvases(img) {
    // Calculate dimensions for professional headshot (1:1 ratio)
    const targetSize = 800;
    const aspectRatio = img.width / img.height;
    
    let cropWidth, cropHeight, offsetX, offsetY;
    
    // Crop to square, centered on the image (face detection would go here)
    if (aspectRatio > 1) {
        // Landscape
        cropWidth = img.height;
        cropHeight = img.height;
        offsetX = (img.width - cropWidth) / 2;
        offsetY = 0;
    } else {
        // Portrait or square
        cropWidth = img.width;
        cropHeight = img.width;
        offsetX = 0;
        offsetY = Math.max(0, (img.height - cropHeight) / 3); // Bias towards top for headshots
    }
    
    // Set up original canvas
    originalCanvas.width = targetSize;
    originalCanvas.height = targetSize;
    const originalCtx = originalCanvas.getContext('2d');
    originalCtx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, targetSize, targetSize);
    
    // Set up enhanced canvas
    enhancedCanvas.width = targetSize;
    enhancedCanvas.height = targetSize;
    
    // Store original image data for processing
    state.originalImageData = originalCtx.getImageData(0, 0, targetSize, targetSize);
}

function applyEnhancements() {
    if (!state.originalImageData) return;
    
    const canvas = enhancedCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Start with original image data
    let imageData = new ImageData(
        new Uint8ClampedArray(state.originalImageData.data),
        width,
        height
    );
    
    // Apply adjustments
    imageData = applyBrightnessContrast(imageData);
    imageData = applySaturation(imageData);
    
    // Put the processed image on canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Apply blur if needed (canvas filter for performance)
    if (state.currentSettings.blur > 0) {
        applyBackgroundBlur(ctx, width, height);
    }
    
    // Apply vignette effect
    if (state.currentSettings.vignette > 0) {
        applyVignette(ctx, width, height);
    }
}

function applyBrightnessContrast(imageData) {
    const data = imageData.data;
    const brightness = state.currentSettings.brightness;
    const contrast = state.currentSettings.contrast;
    
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;
        
        // Apply contrast
        data[i] = contrastFactor * (data[i] - 128) + 128;
        data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128;
        data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128;
        
        // Clamp values
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }
    
    return imageData;
}

function applySaturation(imageData) {
    const data = imageData.data;
    const saturation = 1 + (state.currentSettings.saturation / 100);
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate grayscale value
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        
        // Apply saturation
        data[i] = Math.max(0, Math.min(255, gray + (r - gray) * saturation));
        data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * saturation));
        data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * saturation));
    }
    
    return imageData;
}

function applyBackgroundBlur(ctx, width, height) {
    // Simple blur effect - in a production app, you'd use face detection
    // to blur only the background. For now, we'll apply a subtle overall blur
    const blurAmount = state.currentSettings.blur;
    
    if (blurAmount > 0) {
        // Create a subtle blur by drawing the image multiple times with low opacity
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(enhancedCanvas, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }
}

function applyVignette(ctx, width, height) {
    const vignetteStrength = state.currentSettings.vignette / 100;
    
    if (vignetteStrength > 0) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.sqrt(centerX * centerX + centerY * centerY);
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius * 1.2);
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteStrength * 0.7})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
}

// Control handlers
function handleBrightnessChange(e) {
    const value = parseInt(e.target.value);
    state.currentSettings.brightness = value;
    brightnessValue.textContent = value;
    applyEnhancements();
}

function handleContrastChange(e) {
    const value = parseInt(e.target.value);
    state.currentSettings.contrast = value;
    contrastValue.textContent = value;
    applyEnhancements();
}

function handleSaturationChange(e) {
    const value = parseInt(e.target.value);
    state.currentSettings.saturation = value;
    saturationValue.textContent = value;
    applyEnhancements();
}

function handleBlurChange(e) {
    const value = parseInt(e.target.value);
    state.currentSettings.blur = value;
    blurValue.textContent = value;
    applyEnhancements();
}

function handleVignetteChange(e) {
    const value = parseInt(e.target.value);
    state.currentSettings.vignette = value;
    vignetteValue.textContent = value;
    applyEnhancements();
}

// Action handlers
function handleDownload() {
    const link = document.createElement('a');
    link.download = 'professional-headshot.png';
    link.href = enhancedCanvas.toDataURL('image/png');
    link.click();
}

function handleReset() {
    // Reset all settings
    state.currentSettings = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        vignette: 0
    };
    
    // Reset sliders
    brightnessSlider.value = 0;
    contrastSlider.value = 0;
    saturationSlider.value = 0;
    blurSlider.value = 0;
    vignetteSlider.value = 0;
    
    // Reset value displays
    brightnessValue.textContent = '0';
    contrastValue.textContent = '0';
    saturationValue.textContent = '0';
    blurValue.textContent = '0';
    vignetteValue.textContent = '0';
    
    // Reapply enhancements
    applyEnhancements();
}

function handleNewPhoto() {
    // Reset state
    state.originalImage = null;
    state.originalImageData = null;
    state.currentSettings = {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        vignette: 0
    };
    
    // Reset file input
    fileInput.value = '';
    
    // Reset sliders
    handleReset();
    
    // Show upload section
    showSection(uploadSection);
}

// Utility functions
function showSection(section) {
    uploadSection.classList.remove('active');
    processingSection.classList.remove('active');
    previewSection.classList.remove('active');
    section.classList.add('active');
}

// Initialize app
init();
