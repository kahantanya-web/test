/**
 * Clipboard utilities for feedback formatting and copying
 */

/**
 * Formats feedback answers into a text string
 * @param {Array} answers - Array of question/answer objects
 * @returns {string} - Formatted text string
 */
export const formatAnswersToText = (answers) => {
  return answers.map(item => 
    `Q: ${item.question}\nA: ${item.answer || 'No answer provided'}\n`
  ).join('\n');
};

/**
 * Creates the complete feedback text for clipboard
 * @param {Object} feedback - Feedback object
 * @returns {string} - Complete formatted feedback text
 */
export const createFeedbackText = (feedback) => {
  const { userName, specialistTitle, specialistAnswers, newcomerTitle, newcomerAnswers } = feedback;
  
  let feedbackText = `Onboarding Feedback for ${userName}\n\n`;
  
  feedbackText += `${specialistTitle}\n`;
  feedbackText += formatAnswersToText(specialistAnswers);
  
  feedbackText += `\n${newcomerTitle}\n`;
  feedbackText += formatAnswersToText(newcomerAnswers);
  
  return feedbackText.trim();
};

/**
 * Copies text to clipboard and returns a promise
 * @param {string} text - Text to copy
 * @returns {Promise} - Promise that resolves when copy is successful
 */
export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text);
};