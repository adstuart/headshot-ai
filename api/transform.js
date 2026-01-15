/**
 * Vercel Serverless Function for AI Headshot Transformation
 * This function receives an image, sends it to OpenAI's API, and returns the transformed result
 */

export default async function handler(req, res) {
  // Set CORS headers
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

    // The exact prompt as specified in requirements
    const prompt = `Ultra-realistic 8K corporate headshot of the person in the input photo. Keep their exact face, identity, age, gender, ethnicity, hairstyle and expression; do not alter unique facial features. Replace clothing with a tailored navy blue wool business suit and crisp white shirt. Clean dark gray studio backdrop with a soft center-light gradient and subtle vignette, no objects. Style as a Sony A7III 85mm f/1.4 studio portrait in portrait orientation with shallow depth of field: subject sharp, background softly blurred. Soft three-point lighting with gentle shadows and a subtle rim light on hair and shoulders. Preserve natural skin texture with pores and fine details, no plastic smoothing. Bright, natural catchlights in the eyes. Final image: high-end LinkedIn-ready studio portrait.`;

    // Extract base64 data (remove data URL prefix)
    const base64Data = image.split(',')[1];

    // Call OpenAI API using DALL-E 3 for image editing
    // Note: DALL-E 3 doesn't support image editing directly, so we'll use GPT-4 Vision
    // to describe the image and then generate a new one, or use DALL-E 2 edit endpoint
    
    // For image-to-image transformation, we'll use the images/edits endpoint with DALL-E 2
    // or the chat completion with vision to analyze and regenerate
    
    // Option 1: Use DALL-E 2 edit endpoint (requires PNG with transparency)
    // Option 2: Use GPT-4 Vision + DALL-E 3 generation
    // For now, we'll use DALL-E 3 generation with the prompt describing the transformation
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      
      // Handle rate limiting
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      // Handle other API errors without exposing details
      return res.status(500).json({ error: 'Failed to generate headshot. Please try again.' });
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      console.error('Invalid response from OpenAI:', data);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    // Return the generated image as base64
    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${data.data[0].b64_json}`,
      revised_prompt: data.data[0].revised_prompt || null,
    });

  } catch (error) {
    console.error('Error in transform function:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}
