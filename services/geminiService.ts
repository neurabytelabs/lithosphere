/**
 * Gemini AI Service for Lithosphere
 * Real Gemini API integration with rate limiting
 * 
 * @version 1.1.0
 * @since 2026-01-21
 */

// Configuration
const GEMINI_CONFIG = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  model: 'gemini-2.0-flash',
  // Free tier: 15 RPM = 1 request per 4 seconds
  rateLimitMs: 4000,
};

// Get API key from environment
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn('[GeminiService] VITE_GEMINI_API_KEY not set');
  }
  return key || '';
};

// Rate limiting state
let lastRequestTime = 0;
let requestQueue: Array<() => void> = [];
let isProcessingQueue = false;

// Types
export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface MaterialSuggestion {
  name: string;
  description: string;
  parameters: {
    colorDeep?: [number, number, number];
    colorMid?: [number, number, number];
    colorGlow?: [number, number, number];
    emissiveIntensity?: number;
    noiseScale?: number;
    roughness?: number;
    metalness?: number;
  };
}

export interface ShaderSuggestion {
  name: string;
  description: string;
  code?: string;
  parameters?: Record<string, number | string | boolean>;
}

/**
 * Wait for rate limit cooldown
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < GEMINI_CONFIG.rateLimitMs) {
    const waitTime = GEMINI_CONFIG.rateLimitMs - timeSinceLastRequest;
    console.log(`[GeminiService] Rate limit: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Generate content using Gemini API
 */
async function generateContent(prompt: string, systemPrompt?: string): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { 
      text: '', 
      success: false, 
      error: 'API key not configured. Contact administrator.' 
    };
  }

  try {
    // Wait for rate limit
    await waitForRateLimit();

    // Build the prompt with system instruction
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\nUser request: ${prompt}`
      : prompt;

    const response = await fetch(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      console.error('[GeminiService] API error:', errorMessage);
      
      // Handle specific errors
      if (response.status === 429) {
        return { text: '', success: false, error: 'Too many requests. Please wait a moment.' };
      }
      if (response.status === 403) {
        return { text: '', success: false, error: 'API key invalid or quota exceeded.' };
      }
      
      return { text: '', success: false, error: `API error: ${errorMessage}` };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      return { text: '', success: false, error: 'Empty response from AI' };
    }
    
    return { text, success: true };
  } catch (error) {
    console.error('[GeminiService] Request failed:', error);
    return { 
      text: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

/**
 * Check if Gemini service is available
 */
export async function checkAvailability(): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) return false;
  
  try {
    const response = await fetch(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}?key=${apiKey}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get remaining cooldown time in seconds
 */
export function getRateLimitCooldown(): number {
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  const remaining = GEMINI_CONFIG.rateLimitMs - timeSinceLastRequest;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Get AI suggestion for a material based on description
 */
export async function suggestMaterial(description: string): Promise<MaterialSuggestion | null> {
  const systemPrompt = `You are a shader artist and material designer for Three.js WebGPU applications.
Given a description, suggest material parameters for a procedural gemstone/mineral shader.
Always respond in valid JSON format with this structure:
{
  "name": "Material Name",
  "description": "Brief description of the look",
  "parameters": {
    "colorDeep": [r, g, b],
    "colorMid": [r, g, b],
    "colorGlow": [r, g, b],
    "emissiveIntensity": 0.5,
    "noiseScale": 3.0,
    "roughness": 0.1,
    "metalness": 0.0
  }
}
All color values should be in 0-1 range.`;

  const result = await generateContent(
    `Create a material for: "${description}"`,
    systemPrompt
  );

  if (!result.success) return null;

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as MaterialSuggestion;
    }
  } catch (e) {
    console.error('[GeminiService] Failed to parse material suggestion:', e);
  }

  return null;
}

/**
 * Get creative shader effect ideas
 */
export async function suggestShaderEffect(currentMaterial: string): Promise<ShaderSuggestion | null> {
  const systemPrompt = `You are an expert in TSL (Three Shading Language) for Three.js WebGPU.
Suggest a creative shader effect or enhancement for the given material.
Respond in JSON format:
{
  "name": "Effect Name",
  "description": "What this effect does visually",
  "parameters": {
    "effectIntensity": 0.5,
    "effectSpeed": 1.0
  }
}`;

  const result = await generateContent(
    `Suggest a creative shader effect for a "${currentMaterial}" material in a procedural gemstone visualization`,
    systemPrompt
  );

  if (!result.success) return null;

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ShaderSuggestion;
    }
  } catch (e) {
    console.error('[GeminiService] Failed to parse shader suggestion:', e);
  }

  return null;
}

/**
 * Get natural language explanation of a material
 */
export async function explainMaterial(materialName: string): Promise<string> {
  const result = await generateContent(
    `Explain the geological formation and visual characteristics of ${materialName} in 2-3 sentences. Focus on color, light behavior, and crystal structure.`
  );

  return result.success ? result.text : result.error || 'Unable to generate explanation.';
}

/**
 * Generate random creative material idea
 */
export async function randomMaterialIdea(): Promise<MaterialSuggestion | null> {
  const ideas = [
    'an ancient volcanic glass from deep ocean vents',
    'a bioluminescent crystal found in underwater caves',
    'a frozen meteor fragment with aurora-like internal glow',
    'a synthetic quantum crystal with shifting colors',
    'a petrified lightning strike preserved in sand',
    'a crystallized dragon scale with fire-like internal glow',
  ];
  
  const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
  return suggestMaterial(randomIdea);
}

// Export service object
export const GeminiService = {
  checkAvailability,
  getRateLimitCooldown,
  suggestMaterial,
  suggestShaderEffect,
  explainMaterial,
  randomMaterialIdea,
  generateContent,
};

export default GeminiService;
