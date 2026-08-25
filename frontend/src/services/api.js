/**
 * Sends a base64 encoded food image to the backend for nutritional analysis.
 * @param {string} base64Image - Base64 data string of the food image.
 * @returns {Promise<{food_name: string, calories: number, carbs_g: number, protein_g: number, fat_g: number, health_score: number}>}
 */
export async function analyzeFoodImage(base64Image) {
  try {
    // Dynamically resolve backend host so it works on mobile devices over local Wi-Fi
    const backendHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
    const apiUrl = `http://${backendHost}:3001/api/analyze`;

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
