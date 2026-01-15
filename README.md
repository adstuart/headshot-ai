# Headshot AI

A simple static web application that transforms your photos into professional LinkedIn headshots using client-side image processing.

## Features

- **📸 Easy Photo Upload**: Drag-and-drop or browse to select your photo
- **✨ Professional Enhancements**: 
  - Automatic cropping to professional headshot dimensions (square format)
  - Brightness and contrast adjustments
  - Saturation control for natural-looking photos
  - Background blur for professional focus
  - Vignette effect for polished appearance
- **👀 Before/After Preview**: See your original photo side-by-side with the enhanced version
- **⚙️ Real-time Adjustments**: Fine-tune all settings with interactive sliders
- **⬇️ Easy Download**: Download your professional headshot in high quality PNG format
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Usage

### Live Demo
Visit the live website: [https://adstuart.github.io/headshot-ai/](https://adstuart.github.io/headshot-ai/)

### Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/adstuart/headshot-ai.git
   cd headshot-ai
   ```

2. Open `index.html` in your web browser:
   - **Option 1**: Double-click the `index.html` file
   - **Option 2**: Use a local web server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Or using Python 2
     python -m SimpleHTTPServer 8000
     
     # Or using Node.js (if you have http-server installed)
     npx http-server
     ```
   - Open `http://localhost:8000` in your browser

3. Upload a photo and start transforming!

## How It Works

1. **Upload**: Select or drag-and-drop a photo of yourself
2. **Processing**: The app automatically crops your photo to a professional square format
3. **Adjust**: Use the sliders to fine-tune brightness, contrast, saturation, background blur, and vignette
4. **Download**: Click "Download Headshot" to save your professional photo

## Deployment to GitHub Pages

1. Push your changes to the `main` branch (or your default branch)
2. Go to your repository settings on GitHub
3. Navigate to **Settings** > **Pages**
4. Under **Source**, select your branch (e.g., `main`) and root folder (`/`)
5. Click **Save**
6. Your site will be published at `https://[your-username].github.io/headshot-ai/`

## Technical Details

- **100% Client-Side**: All image processing happens in your browser - no data is uploaded to any server
- **No Dependencies**: Built with vanilla JavaScript, HTML5 Canvas, and CSS3
- **Privacy First**: Your photos never leave your device
- **Lightweight**: Fast loading and processing
- **Modern Browser Support**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## File Structure

```
headshot-ai/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── script.js       # Image processing logic
└── README.md       # Documentation
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Roadmap

This is **Phase 1** of the Headshot AI project, focused on client-side image processing and user experience validation.

### Future Enhancements (Phase 2+)
- AI-powered face detection and automatic centering
- Advanced background replacement with solid colors or patterns
- AI-based lighting and skin tone optimization
- Multiple headshot style presets (Corporate, Creative, Casual)
- Batch processing for multiple photos
- Integration with AI/ML models for advanced enhancements

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
