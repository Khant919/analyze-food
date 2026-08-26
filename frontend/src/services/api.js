/**
 * Sends a base64 encoded food image to the backend for nutritional analysis.
 * @param {string} base64Image - Base64 data string of the food image.
 * @returns {Promise<{food_name: string, calories: number, carbs_g: number, protein_g: number, fat_g: number, health_score: number}>}
 */
export async function analyzeFoodImage(base64Image) {
  try {
    let baseUrl = import.meta.env.VITE_API_URL;
    let apiUrl;

    if (baseUrl && baseUrl.trim() !== '') {
      // Clean up whitespace & trailing slashes
      baseUrl = baseUrl.trim().replace(/\/+$/, '');
      // Append /api/analyze if only the base Render domain was entered
      if (!baseUrl.endsWith('/api/analyze') && !baseUrl.endsWith('/analyze')) {
        apiUrl = `${baseUrl}/api/analyze`;
      } else {
        apiUrl = baseUrl;
      }
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      apiUrl = 'http://localhost:3001/api/analyze';
    } else {
      // Deployed to production (Netlify) without VITE_API_URL configured
      throw new Error(
        'Backend URL is not configured! Please set VITE_API_URL in Netlify (Site configuration -> Environment variables) to your Render URL (e.g. https://your-backend.onrender.com) and redeploy.'
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Image,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error in analyzeFoodImage API service:', error);
    throw error;
  }
}
