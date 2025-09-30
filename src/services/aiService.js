// API configuration
const API_CONFIG = {
  // Use environment variable or fallback to development server
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  endpoints: {
    aiAnalyze: '/api/ai-analyze'
  },
  timeout: 30000, // 30 seconds
};

// Helper function to create fetch request with timeout
const fetchWithTimeout = async (url, options = {}, timeout = API_CONFIG.timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

// Helper function to handle API errors
const handleApiError = async (response) => {
  let errorMessage = `API error: ${response.status}`;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch {
    // If we can't parse the error response, use the status text
    errorMessage = `API error: ${response.status} ${response.statusText}`;
  }
  
  throw new Error(errorMessage);
};

// Main service function
export async function analyzeFeedbackService(prompt) {
  // Input validation
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt is required and must be a non-empty string');
  }

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.aiAnalyze}`;
  const requestOptions = {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ prompt: prompt.trim() })
  };

  try {
    const response = await fetchWithTimeout(url, requestOptions);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from API');
    }
    
    return data;
    
  } catch (error) {
    // Re-throw the error with context
    throw error;
  }
}