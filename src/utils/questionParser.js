/**
 * Utility functions for parsing questions from text files
 */

/**
 * Detects if content is binary (non-text) format
 * @param {string} text - Text content to check
 * @returns {boolean} - True if binary content detected
 */
const isBinaryContent = (text) => {
  return text.indexOf('PK') === 0 || 
         text.indexOf('%PDF') === 0 || 
         /[\x00-\x08\x0E-\x1F]/.test(text.substring(0, 100));
};

/**
 * Normalizes text content by removing special characters and normalizing line endings
 * @param {string} text - Raw text content
 * @returns {string} - Normalized text
 */
const normalizeText = (text) => {
  // Remove BOM and normalize line endings
  let normalizedText = text.replace(/^\ufeff/, '').replace(/\r\n/g, '\n');
  
  // Replace encoding issue characters
  normalizedText = normalizedText.replace(/�/g, ' ');
  
  return normalizedText;
};

/**
 * Finds section indices in text based on headers
 * @param {string} text - Normalized text content
 * @returns {object} - Object containing section indices
 */
const findSectionIndices = (text) => {
  const simplifiedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Define headers for both sections
  const specialistHeaders = "feedback after onboarding from the onboarding specialist";
  const newcomerHeaders = "newcomer's feedback after onboarding";
  
  let specialistSectionIndex = simplifiedText.indexOf(specialistHeaders);
  let newcomerSectionIndex = simplifiedText.indexOf(newcomerHeaders);
  
  // Fallback searches
  if (newcomerSectionIndex === -1) {
    const newcomerIndex = simplifiedText.indexOf("newcomer");
    const feedbackIndex = simplifiedText.indexOf("feedback", newcomerIndex);
    
    if (newcomerIndex !== -1 && feedbackIndex !== -1 && 
        (feedbackIndex - newcomerIndex) < 20) {
      newcomerSectionIndex = newcomerIndex;
    }
  }
  
  if (specialistSectionIndex === -1) {
    const specialistIndex = simplifiedText.indexOf("specialist");
    const feedbackIndex = simplifiedText.indexOf("feedback", specialistIndex - 10);
    
    if (specialistIndex !== -1 && feedbackIndex !== -1 && 
        Math.abs(feedbackIndex - specialistIndex) < 20) {
      specialistSectionIndex = Math.min(specialistIndex, feedbackIndex);
    }
  }
  
  return { specialistSectionIndex, newcomerSectionIndex };
};

/**
 * Extracts questions from a text section using regex
 * @param {string} sectionText - Text section to parse
 * @returns {string[]} - Array of extracted questions
 */
const extractQuestionsFromSection = (sectionText) => {
  const questions = [];
  const questionRegex = /\d+\s*\.?\s*([^\d\n]+)/g;
  let match;
  
  while ((match = questionRegex.exec(sectionText)) !== null) {
    const questionText = match[1]
      .replace(/�/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (questionText) {
      questions.push(questionText);
    }
  }
  
  return questions;
};

/**
 * Main function to parse questions from text content
 * @param {string} text - Raw text content from file
 * @returns {object} - Object containing specialist and newcomer questions
 */
export const parseQuestionsFromText = (text) => {
  // Check for binary content
  if (isBinaryContent(text)) {
    console.error("Binary file content detected - cannot parse as text");
    return { specialist: [], newcomer: [] };
  }
  
  // Normalize the text
  const normalizedText = normalizeText(text);
  
  // Find section indices
  const { specialistSectionIndex, newcomerSectionIndex } = findSectionIndices(normalizedText);
  
  const specialistQuestions = [];
  const newcomerQuestions = [];
  
  // Extract specialist questions
  if (specialistSectionIndex !== -1) {
    let specialistSection;
    if (newcomerSectionIndex !== -1 && newcomerSectionIndex > specialistSectionIndex) {
      specialistSection = normalizedText.substring(specialistSectionIndex, newcomerSectionIndex);
    } else {
      specialistSection = normalizedText.substring(specialistSectionIndex);
    }
    
    specialistQuestions.push(...extractQuestionsFromSection(specialistSection));
  }
  
  // Extract newcomer questions
  if (newcomerSectionIndex !== -1) {
    const newcomerSection = normalizedText.substring(newcomerSectionIndex);
    newcomerQuestions.push(...extractQuestionsFromSection(newcomerSection));
  }
  
  return {
    specialist: specialistQuestions,
    newcomer: newcomerQuestions
  };
};