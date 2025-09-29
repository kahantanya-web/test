import { useState } from 'react';
import { analyzeFeedbackService } from '../services/aiService';

/**
 * Custom hook for AI analysis functionality
 */
export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [structuredAnalysis, setStructuredAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  /**
   * Creates AI prompt for feedback analysis
   */
  const createAIPrompt = (feedbackData) => {
    const feedbackText = [
      `User: ${feedbackData.userName}`,
      `\nSpecialist Feedback:`,
      ...feedbackData.specialistAnswers?.map(item => `Q: ${item.question}\nA: ${item.answer}`),
      `\nNewcomer Feedback:`,
      ...feedbackData.newcomerAnswers?.map(item => `Q: ${item.question}\nA: ${item.answer}`)
    ].join('\n');

    return `Analyze the following onboarding feedback and return a JSON response with exactly these 4 properties:

{
  "overallSentiment": "Brief description of whether the feedback is positive, negative, or mixed (1-2 sentences)",
  "keyStrengths": "Main positive aspects and what's working well (2-3 key points)",
  "areasForImprovement": "Specific areas that need attention or enhancement (2-3 key areas)",
  "actionItems": "Concrete, actionable recommendations based on the feedback (2-3 specific suggestions)"
}

Important: 
- Return ONLY valid JSON, no additional text or formatting
- Keep each property value concise but informative
- Ensure the JSON is properly formatted and parseable

Feedback to analyze:
${feedbackText}`;
  };

  /**
   * Processes AI analysis result and determines if it's JSON or text
   */
  const processAnalysisResult = (analysisText) => {
    try {
      const jsonAnalysis = JSON.parse(analysisText);
      
      // Validate that it has the expected properties
      if (jsonAnalysis.overallSentiment && jsonAnalysis.keyStrengths && 
          jsonAnalysis.areasForImprovement && jsonAnalysis.actionItems) {
        setStructuredAnalysis(jsonAnalysis);
        setAiAnalysis('');
        return true;
      } else {
        // If JSON doesn't have expected structure, fall back to raw text
        setAiAnalysis(analysisText);
        setStructuredAnalysis(null);
        return false;
      }
    } catch (parseError) {
      // If JSON parsing fails, use as raw text
      console.log('Failed to parse JSON, using raw text:', parseError.message);
      setAiAnalysis(analysisText);
      setStructuredAnalysis(null);
      return false;
    }
  };

  /**
   * Main function to analyze feedback with AI
   */
  const analyzeFeedback = async (feedbackData) => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    setStructuredAnalysis(null);
    setAnalysisError('');

    try {
      const prompt = createAIPrompt(feedbackData);
      const result = await analyzeFeedbackService(prompt);
      const analysisText = result.analysis || result.choices?.[0]?.message?.content || 'No analysis available.';
      
      processAnalysisResult(analysisText);
    } catch (err) {
      setAnalysisError(err.message || 'Failed to analyze feedback.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAiAnalysis('');
    setStructuredAnalysis(null);
    setAnalysisError('');
  };

  return {
    isAnalyzing,
    aiAnalysis,
    structuredAnalysis,
    analysisError,
    analyzeFeedback,
    resetAnalysis
  };
};