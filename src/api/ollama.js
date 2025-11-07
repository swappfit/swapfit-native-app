// ../api/ollama.js
export const OLLAMA_BASE_URL = 'http://192.168.1.7:11434';

// Preload the model to reduce loading time
let modelLoaded = false;

export async function preloadModel() {
  if (modelLoaded) return;
  
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava:7b',
        prompt: 'Hi',
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_ctx: 1024,
          num_batch: 512,
          num_gpu: 0,
        },
        stream: false,
      }),
    });
    
    modelLoaded = true;
    console.log('Model preloaded');
    return true;
  } catch (error) {
    console.error('Failed to preload model:', error);
    return false;
  }
}

export async function generateText(prompt, image = null) {
  try {
    const startTime = Date.now();
    
    // Compress image if provided
    let compressedImage = null;
    if (image && image.base64) {
      // Create a smaller version for faster processing
      compressedImage = image.base64;
    }

    // Create a system prompt to focus on fitness
    const systemPrompt = `You are swapfit, a professional fitness and nutrition assistant with expertise in workout routines, exercise form, muscle development, diet planning, and recovery strategies. 
    Provide detailed, accurate information about:
    - Workout routines for different goals (muscle gain, fat loss, strength, endurance)
    - Proper exercise form and technique
    - Muscle anatomy and targeting specific muscle groups
    - Nutrition plans for different fitness goals
    - Supplement advice
    - Recovery strategies and injury prevention
    
    When analyzing images, identify exercises, form issues, or muscle groups being worked. Always provide actionable advice.
    Keep responses concise but comprehensive, focusing on practical fitness advice.`;

    const requestBody = {
      model: 'llava:7b',
      prompt: `${systemPrompt}\n\nUser: ${prompt}`,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 1024,        // Reduced context for faster response
        num_batch: 256,        // Smaller batch size
        num_gpu: 0,
        repeat_penalty: 1.1,
        repeat_last_n: 64,
      },
      stream: false,
    };

    // Add compressed image if provided
    if (compressedImage) {
      requestBody.images = [compressedImage];
    }

    console.log('Sending request to Ollama...');
    
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`Response received in ${duration} seconds`);
    return data.response || 'No response generated';
  } catch (error) {
    console.error('Ollama error:', error);
    return `⚠️ Error: ${error.message}`;
  }
}