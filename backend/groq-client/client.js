import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// We expect GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3 in the environment
const apiKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3
].filter(Boolean); // Only keep valid keys

let currentKeyIndex = 0;

export const generateWithFallback = async (prompt, systemPrompt) => {
  if (apiKeys.length === 0) {
    throw new Error('No Groq API keys found. Please set GROQ_API_KEY_1 in your .env file.');
  }

  const maxAttempts = apiKeys.length;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const currentKey = apiKeys[currentKeyIndex];
    try {
      const groq = new Groq({ apiKey: currentKey });
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1, // Low temperature for more deterministic mermaid output
        max_completion_tokens: 1500,
      });

      return completion.choices[0]?.message?.content || '';

    } catch (error) {
      console.warn(`Error with API key index ${currentKeyIndex}:`, error.message);
      
      // Check if it's a rate limit error (status 429) or token limit error
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        console.log(`Rate limit reached for API key index ${currentKeyIndex}. Switching to next key...`);
        // Move to the next key and wrap around
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        attempts++;
      } else {
        // If it's a different kind of error, we can still try to fallback, or throw immediately.
        // Let's try falling back just in case, or throw if we prefer. Usually, we switch on 429.
        console.log(`Unexpected error for API key index ${currentKeyIndex}. Switching to next key...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        attempts++;
      }
    }
  }

  throw new Error('All accessible Groq API keys failed or rate-limited. Please try again later.');
};
