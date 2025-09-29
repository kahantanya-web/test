const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS Configuration
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

app.use(corsMiddleware);

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

// Validate required environment variables
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}


/**
 * Validates request body for AI analysis endpoint
 */
const validateAnalysisRequest = (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Prompt is required and must be a non-empty string.' 
    });
  }
  
  next();
};

/**
 * Creates OpenAI API request payload
 */
const createOpenAIPayload = (prompt) => ({
  model: DEFAULT_MODEL,
  messages: [
    { 
      role: 'system', 
      content: 'You are an AI assistant that analyzes onboarding feedback and provides structured insights.' 
    },
    { role: 'user', content: prompt }
  ],
  max_tokens: 500,
  temperature: 0.3
});

/**
 * Handles OpenAI API errors
 */
const handleOpenAIError = async (response) => {
  const errorText = await response.text();
  console.error('OpenAI API Error:', {
    status: response.status,
    statusText: response.statusText,
    body: errorText
  });
  
  return {
    error: 'AI service error',
    details: `OpenAI API returned ${response.status}: ${response.statusText}`,
    message: 'Unable to analyze feedback at this time. Please try again later.'
  };
};

/**
 * AI Analysis endpoint
 */
app.post('/api/ai-analyze', validateAnalysisRequest, async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const payload = createOpenAIPayload(prompt);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorResponse = await handleOpenAIError(response);
      return res.status(500).json(errorResponse);
    }
    
    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || 'No analysis available.';
    
    res.json({ analysis });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: 'Server error',
      message: err.message || 'An unexpected error occurred'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Server configuration
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Analysis: http://localhost:${PORT}/api/ai-analyze`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;