// Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/transform'
    : '/api/transform';

// Canvas dimensions for portrait orientation (1024x1536)
const TARGET_WIDTH = 1024;
const TARGET_HEIGHT = 1536;

// State management
let state = {
    originalImage: null,
    aiGeneratedImage: null, // Store the AI-generated result
    selectedStyle: null, // Store the selected style
    uploadedImageData: null // Store the base64 image data for API call
};

// DOM Elements
const uploadSection = document.getElementById('upload-section');
const styleSection = document.getElementById('style-section');
const processingSection = document.getElementById('processing-section');
const previewSection = document.getElementById('preview-section');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const originalCanvas = document.getElementById('original-canvas');
const enhancedCanvas = document.getElementById('enhanced-canvas');
const previewCanvas = document.getElementById('preview-canvas');
const downloadBtn = document.getElementById('download-btn');
const newPhotoBtn = document.getElementById('new-photo-btn');
const styleButtons = document.querySelectorAll('.btn-style');

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
    
    // Button events
    downloadBtn.addEventListener('click', handleDownload);
    newPhotoBtn.addEventListener('click', handleNewPhoto);
    
    // Style selection events
    styleButtons.forEach(button => {
        button.addEventListener('click', handleStyleSelection);
    });
}

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image file is too large. Please use an image smaller than 10MB.');
            return;
        }
        processImage(file);
    } else if (file) {
        showError('Please select a valid image file (JPEG, PNG, etc.).');
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
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image file is too large. Please use an image smaller than 10MB.');
            return;
        }
        processImage(file);
    } else if (file) {
        showError('Please select a valid image file (JPEG, PNG, etc.).');
    }
}

// Image processing
async function processImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
            state.originalImage = img;
            prepareCanvases(img);
            
            // Get base64 of the cropped/prepared image and store it
            state.uploadedImageData = originalCanvas.toDataURL('image/png');
            
            // Show the preview canvas with the uploaded image
            displayPreview();
            
            // Show style selection section
            showSection(styleSection);
        };
        img.onerror = () => {
            showError('Failed to load image. Please try a different file.');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Update processing message
function updateProcessingMessage(message) {
    const processingText = document.querySelector('.processing-content p');
    if (processingText) {
        processingText.innerHTML = message;
    }
}

// Display preview of uploaded image
function displayPreview() {
    const ctx = previewCanvas.getContext('2d');
    // Use same dimensions as original canvas for consistency
    previewCanvas.width = originalCanvas.width;
    previewCanvas.height = originalCanvas.height;
    ctx.drawImage(originalCanvas, 0, 0);
}

// Handle style selection
async function handleStyleSelection(e) {
    const button = e.currentTarget;
    const style = button.getAttribute('data-style');
    
    // Validate style parameter (must match styles defined in API)
    // These should be kept in sync with CLOTHING_PROMPTS in api/transform.js
    const validStyles = ['traditional', 'modern', 'relaxed'];
    if (!style || !validStyles.includes(style)) {
        console.error('Invalid style selected:', style);
        showError('Invalid style selection. Please try again.');
        return;
    }
    
    state.selectedStyle = style;
    
    // Show processing section
    showSection(processingSection);
    updateProcessingMessage('Transforming your photo with AI...<br><small>This may take 15-30 seconds</small>');
    
    // Call the AI backend with the selected style
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: state.uploadedImageData,
                style: style
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to transform image');
        }
        
        const result = await response.json();
        
        if (result.success && result.image) {
            // Load the AI-generated image
            const aiImg = new Image();
            aiImg.onload = () => {
                state.aiGeneratedImage = aiImg;
                displayAIResult(aiImg);
                setTimeout(() => showSection(previewSection), 300);
            };
            aiImg.onerror = () => {
                throw new Error('Failed to load AI-generated image');
            };
            aiImg.src = result.image;
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        showError(error.message || 'Failed to transform image. Please try again.');
    }
}

// Display AI-generated result
function displayAIResult(aiImage) {
    const ctx = enhancedCanvas.getContext('2d');
    enhancedCanvas.width = aiImage.width;
    enhancedCanvas.height = aiImage.height;
    ctx.drawImage(aiImage, 0, 0);
}

// Show error message
function showError(message) {
    // Sanitize message to prevent XSS using a safe approach
    const div = document.createElement('div');
    div.textContent = message; // textContent automatically escapes HTML
    const sanitizedMessage = div.innerHTML;
    
    const processingContent = document.querySelector('.processing-content');
    processingContent.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <svg style="width: 60px; height: 60px; color: #dc3545; margin-bottom: 20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 style="color: #dc3545; margin-bottom: 10px;">Oops! Something went wrong</h3>
            <p style="color: #6c757d; margin-bottom: 20px;">${sanitizedMessage}</p>
            <button class="btn btn-primary" onclick="handleNewPhoto()">Try Another Photo</button>
        </div>
    `;
}

function prepareCanvases(img) {
    // Calculate dimensions for professional headshot (portrait 1024x1536)
    const aspectRatio = img.width / img.height;
    
    let cropWidth, cropHeight, offsetX, offsetY;
    
    // Crop to portrait orientation (2:3 ratio), centered on the image
    const targetAspectRatio = TARGET_WIDTH / TARGET_HEIGHT; // 1024/1536 = 0.667
    
    if (aspectRatio > targetAspectRatio) {
        // Image is wider than target - crop width
        cropHeight = img.height;
        cropWidth = img.height * targetAspectRatio;
        offsetX = (img.width - cropWidth) / 2;
        offsetY = 0;
    } else {
        // Image is taller than target - crop height, bias towards top for headshots
        cropWidth = img.width;
        cropHeight = img.width / targetAspectRatio;
        offsetX = 0;
        offsetY = Math.max(0, (img.height - cropHeight) / 4); // Bias towards top
    }
    
    // Set up original canvas with portrait dimensions
    originalCanvas.width = TARGET_WIDTH;
    originalCanvas.height = TARGET_HEIGHT;
    const originalCtx = originalCanvas.getContext('2d');
    originalCtx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    
    // Set up enhanced canvas with same portrait dimensions
    enhancedCanvas.width = TARGET_WIDTH;
    enhancedCanvas.height = TARGET_HEIGHT;
}

// Action handlers
function handleDownload() {
    const link = document.createElement('a');
    link.download = 'professional-headshot.png';
    link.href = enhancedCanvas.toDataURL('image/png');
    link.click();
}

function handleNewPhoto() {
    // Reset state
    state.originalImage = null;
    state.aiGeneratedImage = null;
    state.selectedStyle = null;
    state.uploadedImageData = null;
    
    // Reset file input
    fileInput.value = '';
    
    // Show upload section
    showSection(uploadSection);
}

// Utility functions
function showSection(section) {
    uploadSection.classList.remove('active');
    styleSection.classList.remove('active');
    processingSection.classList.remove('active');
    previewSection.classList.remove('active');
    section.classList.add('active');
}

// Initialize app
init();
