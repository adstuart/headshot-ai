# Headshot AI

A web application that transforms your photos into professional LinkedIn headshots using AI-powered image generation via OpenAI's DALL-E 3.

## Features

- **📸 Easy Photo Upload**: Drag-and-drop or browse to select your photo
- **🤖 AI-Powered Transformation**: Uses OpenAI's DALL-E 3 to generate ultra-realistic professional headshots
- **✨ Professional Quality**: 
  - Automatic professional attire (navy blue suit, white shirt)
  - Studio-quality lighting and background
  - Preserves your exact facial features, identity, and expression
  - High-resolution 8K quality output
- **👀 Before/After Preview**: See your original photo side-by-side with the AI-enhanced version
- **⬇️ Easy Download**: Download your professional headshot in high quality PNG format
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Live Demo

Visit the live website: [https://adstuart.github.io/headshot-ai/](https://adstuart.github.io/headshot-ai/) (requires OpenAI API setup)

## Quick Start

### Prerequisites

- An OpenAI API key (get one at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))
- A Vercel account (free tier works fine)

### Deployment to Vercel

1. **Clone this repository**:
   ```bash
   git clone https://github.com/adstuart/headshot-ai.git
   cd headshot-ai
   ```

2. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   
   **Option A: Using Vercel CLI**
   ```bash
   vercel
   ```
   Follow the prompts to link to your Vercel account.

   **Option B: Using Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

4. **Set Environment Variables**:
   
   In your Vercel project dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add a new variable:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (starts with `sk-`)
   - Click **Save**
   
   For local development, create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

5. **Redeploy** (if you added env vars after initial deploy):
   ```bash
   vercel --prod
   ```

Your site will be live at `https://your-project.vercel.app`!

## Local Development

### Using Vercel Dev (Recommended)

```bash
# Install dependencies
npm install -g vercel

# Create .env file with your API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here

# Run local dev server
vercel dev
```

Open `http://localhost:3000` in your browser.

### Using a Simple HTTP Server

For frontend-only development (without the API):

```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server
```

**Note**: The AI transformation won't work without the backend running.

## How It Works

1. **Upload**: Select or drag-and-drop a photo of yourself
2. **AI Processing**: The photo is sent to the serverless backend, which:
   - Receives your image (processed client-side first for privacy)
   - Analyzes the person using GPT-4o Vision
   - Calls OpenAI's DALL-E 3 API with a specialized prompt
   - Returns a professional 8K corporate headshot
3. **Preview**: View your original photo next to the AI-generated professional headshot
4. **Download**: Save your professional LinkedIn-ready headshot

## Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │────────▶│ Vercel Serverless│────────▶│  OpenAI API │
│  (Frontend) │         │   Function       │         │  (DALL-E 3) │
│             │◀────────│  /api/transform  │◀────────│             │
└─────────────┘         └──────────────────┘         └─────────────┘
```

- **Frontend**: Static HTML/CSS/JavaScript
- **Backend**: Vercel Serverless Function (Node.js)
- **AI Engine**: OpenAI DALL-E 3 API

## File Structure

```
headshot-ai/
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Frontend logic & API integration
├── api/
│   └── transform.js    # Vercel serverless function
├── vercel.json         # Vercel configuration
├── .env.example        # Environment variables template
└── README.md           # Documentation
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

### API Endpoint

The frontend automatically detects the environment:
- **Local**: `http://localhost:3000/api/transform`
- **Production**: `/api/transform` (relative URL)

To customize, edit the `API_URL` constant in `script.js`.

## Security & Privacy

- ✅ **API Key Security**: OpenAI API key is stored only in environment variables on the server, never exposed to the frontend
- ✅ **CORS Protection**: CORS headers configured (uses wildcard for simplicity; restrict to specific domains in production for enhanced security)
- ✅ **Error Handling**: Errors don't leak sensitive information
- ✅ **Input Validation**: File size limits and type validation on both frontend and backend
- ✅ **XSS Protection**: User input is properly sanitized
- ✅ **Client-side Prep**: Images are prepared client-side before being sent to reduce data transfer
- ⚠️ **Rate Limiting**: Consider adding rate limiting for production use (Vercel has built-in limits)

## Cost Considerations

- **OpenAI API**: DALL-E 3 costs approximately $0.04-$0.08 per image (1024x1024, HD quality)
- **Vercel Hosting**: Free tier includes:
  - 100GB bandwidth per month
  - 100 serverless function executions per day
  - Generous function execution time

**For production**: Monitor your OpenAI API usage and consider implementing:
- User authentication
- Rate limiting per user
- Payment/subscription system

## Troubleshooting

### "Server configuration error"
- Ensure `OPENAI_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

### "Failed to transform image"
- Check your OpenAI API key is valid and has sufficient credits
- Check OpenAI API status: [https://status.openai.com/](https://status.openai.com/)
- Review function logs in Vercel dashboard

### Local development not working
- Ensure you're using `vercel dev` (not a simple HTTP server)
- Check that `.env` file exists with your API key
- Verify the API key format: should start with `sk-`

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Alternative Deployment Options

While this project is optimized for Vercel, you can adapt it for:

### Netlify Functions
1. Move `api/transform.js` to `netlify/functions/`
2. Update API endpoint in `script.js`
3. Set environment variables in Netlify dashboard

### Cloudflare Workers
1. Convert the function to Cloudflare Workers format
2. Use `wrangler.toml` for configuration
3. Deploy with `wrangler publish`

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/adstuart/headshot-ai/issues)
- Check the [OpenAI API documentation](https://platform.openai.com/docs)
- Review [Vercel documentation](https://vercel.com/docs)
