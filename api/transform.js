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

    // Check image size (limit to ~5MB base64, which is ~3.75MB binary)
    if (image.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Please use a smaller image.' });
    }

    // Step 1: Use GPT-4 Vision to analyze the person in the image
    console.log('Analyzing image with GPT-4 Vision...');
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this person and provide a detailed description focusing on: facial features, apparent age, gender presentation, ethnicity, hair color and style, eye color, facial expression, and any distinctive features. Be specific and detailed for accurate image generation. Format as a natural description.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json().catch(() => ({}));
      console.error('GPT-4 Vision API error:', errorData);
      
      if (visionResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      return res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
    }

    const visionData = await visionResponse.json();
    const personDescription = visionData.choices?.[0]?.message?.content;
    
    if (!personDescription) {
      console.error('Invalid vision response:', visionData);
      return res.status(500).json({ error: 'Failed to analyze image' });
    }

    console.log('Person description:', personDescription);

    // Step 2: Generate professional headshot with DALL-E 3
    // Combine the person description with the professional headshot requirements
    const prompt = `Ultra-realistic 8K corporate headshot photograph. ${personDescription}. The person is wearing a tailored navy blue wool business suit and crisp white shirt. Clean dark gray studio backdrop with a soft center-light gradient and subtle vignette, no objects or distractions. Professional studio portrait in portrait orientation, styled as a Sony A7III 85mm f/1.4 photograph with shallow depth of field: subject in sharp focus, background softly blurred. Soft three-point lighting creating gentle shadows and a subtle rim light on hair and shoulders. Natural skin texture with visible pores and fine details, no artificial smoothing or filters. Bright, natural catchlights in the eyes. Professional LinkedIn-ready studio portrait with corporate polish.`;

    console.log('Generating professional headshot with DALL-E 3...');
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
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

    if (!dalleResponse.ok) {
      const errorData = await dalleResponse.json().catch(() => ({}));
      console.error('DALL-E API error:', errorData);
      
      if (dalleResponse.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      return res.status(500).json({ error: 'Failed to generate headshot. Please try again.' });
    }

    const dalleData = await dalleResponse.json();
    
    if (!dalleData.data || !dalleData.data[0] || !dalleData.data[0].b64_json) {
      console.error('Invalid response from DALL-E:', dalleData);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    // Return the generated image as base64
    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${dalleData.data[0].b64_json}`,
      revised_prompt: dalleData.data[0].revised_prompt || null,
    });

  } catch (error) {
    console.error('Error in transform function:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}
