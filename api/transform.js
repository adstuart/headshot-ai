/**
 * Vercel Serverless Function for AI Headshot Transformation
 * This function receives an image, sends it to OpenAI's API, and returns the transformed result
 */

// Import FormData for multipart/form-data support
import FormData from 'form-data';

export default async function handler(req, res) {
  // Set CORS headers
  // Note: Using wildcard (*) for CORS. For production, consider restricting to specific domains
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get the image from request body
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Check image size (limit to ~10MB base64, which is ~7.5MB binary)
    // OpenAI's edits endpoint accepts images up to 50MB
    if (image.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Please use a smaller image.' });
    }

    // Convert base64 image to buffer for multipart/form-data
    // Extract the base64 data from the data URL
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Determine image format from data URL
    const mimeType = image.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1];

    // Use the exact prompt as specified
    const prompt = 'Ultra-realistic 8K corporate headshot of the person in the input photo. Keep their exact face, identity, age, gender, ethnicity, hairstyle and expression; do not alter unique facial features. Replace clothing with a tailored navy blue wool business suit and crisp white shirt. Clean dark gray studio backdrop with a soft center-light gradient and subtle vignette, no objects. Style as a Sony A7III 85mm f/1.4 studio portrait in portrait orientation with shallow depth of field: subject sharp, background softly blurred. Soft three-point lighting with gentle shadows and a subtle rim light on hair and shoulders. Preserve natural skin texture with pores and fine details, no plastic smoothing. Bright, natural catchlights in the eyes. Final image: high-end LinkedIn-ready studio portrait.';

    console.log('Transforming image with gpt-image-1...');
    
    // Create multipart form data
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('image', imageBuffer, {
      filename: `image.${extension}`,
      contentType: mimeType,
    });
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');
    formData.append('response_format', 'b64_json');

    const imageEditResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!imageEditResponse.ok) {
      const errorData = await imageEditResponse.json().catch(() => ({}));
      console.error('Image edit API error:', errorData);
      
      if (imageEditResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      return res.status(500).json({ error: 'Failed to transform image. Please try again.' });
    }

    const imageEditData = await imageEditResponse.json();
    
    if (!imageEditData.data || !imageEditData.data[0] || !imageEditData.data[0].b64_json) {
      console.error('Invalid response from image edit API:', imageEditData);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    // Return the transformed image as base64
    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${imageEditData.data[0].b64_json}`,
    });

  } catch (error) {
    console.error('Error in transform function:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}
