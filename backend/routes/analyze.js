import { Router } from 'express';
import { analyzeFoodImage } from '../services/gemini.js';

const router = Router();

// POST /api/analyze (or mounted at /api/analyze)
router.post('/', async (req, res) => {
  try {
    const { image, imageBase64, mimeType } = req.body;
    const targetImage = imageBase64 || image;

    if (!targetImage) {
      return res.status(400).json({
        error: 'Missing required field: "imageBase64" or "image" (Base64 string)',
      });
    }

    const analysisResult = await analyzeFoodImage(targetImage, mimeType || 'image/jpeg');

    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error handling /analyze request:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error while analyzing food image',
    });
  }
});

// GET /api/analyze/test - Verify API Key status
router.get('/test', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'GEMINI_API_KEY is not set in backend/.env',
      });
    }

    // Direct fetch to list models and verify key
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: data.error?.message || 'Failed to list models with this API key',
        details: data,
      });
    }

    const availableModels = data.models?.map((m) => m.name.replace('models/', '')) || [];
    return res.status(200).json({
      success: true,
      message: 'Gemini API key is valid!',
      availableModelsCount: availableModels.length,
      sampleModels: availableModels.filter((m) => m.includes('flash') || m.includes('pro')),
    });
  } catch (error) {
    console.error('Error in /test endpoint:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
