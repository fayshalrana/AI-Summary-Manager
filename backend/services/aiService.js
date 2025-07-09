const axios = require('axios');

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Generate summary using Google Gemini API
   * @param {string} text - Text to summarize
   * @param {string} prompt - Custom prompt for summarization
   * @param {string} model - Gemini model to use
   * @returns {Promise<Object>} - Summary result
   */
  async generateGeminiSummary(text, prompt = null, model = 'gemini-1.5-flash-latest') {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const defaultPrompt = 'Summarize the following text in a clear and concise manner, maintaining the key points and main ideas:';
      const finalPrompt = prompt || defaultPrompt;

      const response = await axios.post(
        `${this.geminiBaseUrl}/models/${model}:generateContent`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${finalPrompt}\n\n${text}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            key: this.geminiApiKey
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const summary = response.data.candidates[0].content.parts[0].text.trim();
      
      return {
        success: true,
        summary,
        provider: 'gemini',
        model,
        usage: {
          promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error(`Gemini summarization failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate summary (Gemini only)
   * @param {string} text - Text to summarize
   * @param {string} prompt - Custom prompt for summarization
   * @param {string} model - Model to use
   * @returns {Promise<Object>} - Summary result
   */
  async generateSummary(text, prompt = null, model = null) {
    const startTime = Date.now();
    try {
      const geminiModel = model || 'gemini-1.5-flash-latest';
      const result = await this.generateGeminiSummary(text, prompt, geminiModel);
      const processingTime = Date.now() - startTime;
      return {
        ...result,
        processingTime,
        originalTextLength: text.length,
        summaryLength: result.summary.length
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      throw {
        ...error,
        processingTime,
        provider: 'gemini'
      };
    }
  }

  /**
   * Validate text for summarization
   * @param {string} text - Text to validate
   * @returns {Object} - Validation result
   */
  validateText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text must be a non-empty string' };
    }
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }
    if (trimmedText.length > 50000) {
      return { valid: false, error: 'Text cannot exceed 50,000 characters' };
    }
    const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      return { valid: false, error: 'Text must have at least 10 words for meaningful summarization' };
    }
    return { valid: true, wordCount };
  }

  /**
   * Get available models (Gemini only)
   * @returns {Object} - Available models
   */
  getAvailableModels() {
    return {
      gemini: [
        { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 30720 },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', maxTokens: 30720 }
      ]
    };
  }

  /**
   * Check API configuration (Gemini only)
   * @returns {Object} - Configuration status
   */
  checkConfiguration() {
    return {
      gemini: {
        configured: !!this.geminiApiKey,
        baseUrl: this.geminiBaseUrl
      }
    };
  }
}

module.exports = new AIService(); 