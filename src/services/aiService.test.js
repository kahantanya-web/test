import { analyzeFeedbackService } from './aiService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock setTimeout and clearTimeout for timeout functionality
global.setTimeout = jest.fn((cb) => cb());
global.clearTimeout = jest.fn();

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('analyzeFeedbackService', () => {
    const mockSuccessResponse = {
      analysis: 'Test analysis result'
    };

    const createMockResponse = (data, ok = true, status = 200) => ({
      ok,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data)
    });

    describe('successful requests', () => {
      test('makes request with correct parameters', async () => {
        const prompt = 'Test feedback prompt';
        const mockResponse = createMockResponse(mockSuccessResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        await analyzeFeedbackService(prompt);

        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/ai-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: expect.any(AbortSignal),
          body: JSON.stringify({ prompt })
        });
      });

      test('returns parsed response data', async () => {
        const mockResponse = createMockResponse(mockSuccessResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        const result = await analyzeFeedbackService('Test prompt');

        expect(result).toEqual(mockSuccessResponse);
      });

      test('trims whitespace from prompt', async () => {
        const prompt = '  Test prompt with spaces  ';
        const mockResponse = createMockResponse(mockSuccessResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        await analyzeFeedbackService(prompt);

        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/ai-analyze', 
          expect.objectContaining({
            body: JSON.stringify({ prompt: 'Test prompt with spaces' })
          })
        );
      });
    });

    describe('input validation', () => {
      test('rejects empty prompt', async () => {
        await expect(analyzeFeedbackService('')).rejects.toThrow(
          'Prompt is required and must be a non-empty string'
        );
        expect(fetch).not.toHaveBeenCalled();
      });

      test('rejects null prompt', async () => {
        await expect(analyzeFeedbackService(null)).rejects.toThrow(
          'Prompt is required and must be a non-empty string'
        );
        expect(fetch).not.toHaveBeenCalled();
      });

      test('rejects undefined prompt', async () => {
        await expect(analyzeFeedbackService(undefined)).rejects.toThrow(
          'Prompt is required and must be a non-empty string'
        );
        expect(fetch).not.toHaveBeenCalled();
      });

      test('rejects non-string prompt', async () => {
        await expect(analyzeFeedbackService(123)).rejects.toThrow(
          'Prompt is required and must be a non-empty string'
        );
        expect(fetch).not.toHaveBeenCalled();
      });

      test('rejects whitespace-only prompt', async () => {
        await expect(analyzeFeedbackService('   ')).rejects.toThrow(
          'Prompt is required and must be a non-empty string'
        );
        expect(fetch).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      test('handles HTTP error responses with error field', async () => {
        const errorResponse = { error: 'Server error message' };
        const mockResponse = createMockResponse(errorResponse, false, 500);
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Server error message'
        );
      });

      test('handles HTTP error responses with message field', async () => {
        const errorResponse = { message: 'Custom error message' };
        const mockResponse = createMockResponse(errorResponse, false, 400);
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Custom error message'
        );
      });

      test('handles HTTP error responses without error details', async () => {
        const errorResponse = {};
        const mockResponse = createMockResponse(errorResponse, false, 404);
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'API error: 404'
        );
      });

      test('handles network errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Network error'
        );
      });

      test('handles invalid JSON response', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: async () => { throw new SyntaxError('Invalid JSON'); },
          text: async () => 'Invalid JSON response'
        };
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Invalid JSON'
        );
      });

      test('handles null response data', async () => {
        const invalidResponse = null;
        const mockResponse = createMockResponse(invalidResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Invalid response format from API'
        );
      });
    });

    describe('timeout handling', () => {
      test('handles request timeout', async () => {
        // Mock AbortController
        const mockAbort = jest.fn();
        global.AbortController = jest.fn(() => ({
          abort: mockAbort,
          signal: { aborted: false }
        }));

        // Mock fetch to reject with timeout error
        fetch.mockRejectedValueOnce(new Error('Request timed out. Please try again.'));

        await expect(analyzeFeedbackService('Test prompt')).rejects.toThrow(
          'Request timed out. Please try again.'
        );
      });
    });

    describe('environment configuration', () => {
      const originalEnv = process.env;

      beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
      });

      afterEach(() => {
        process.env = originalEnv;
      });

      test('uses environment variable for base URL when set', async () => {
        process.env.REACT_APP_API_BASE_URL = 'https://api.example.com';
        
        // Re-import to get updated config
        const { analyzeFeedbackService: serviceWithEnv } = require('./aiService');
        
        const mockResponse = createMockResponse(mockSuccessResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        await serviceWithEnv('Test prompt');

        expect(fetch).toHaveBeenCalledWith(
          'https://api.example.com/api/ai-analyze',
          expect.any(Object)
        );
      });

      test('uses localhost URL when no environment variable is set', async () => {
        delete process.env.REACT_APP_API_BASE_URL;
        
        const { analyzeFeedbackService: serviceWithoutEnv } = require('./aiService');
        
        const mockResponse = createMockResponse(mockSuccessResponse);
        fetch.mockResolvedValueOnce(mockResponse);

        await serviceWithoutEnv('Test prompt');

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/ai-analyze',
          expect.any(Object)
        );
      });
    });
  });
});