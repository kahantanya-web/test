// Text parsing utilities for extracting questions from text files

// Constants for better maintainability
const BINARY_FILE_MARKERS = ['PK', '%PDF'];
const ENCODING_ISSUE_CHAR = '�';
const BOM_CHAR = '\ufeff';
const QUESTION_REGEX = /\d+\s*\.?\s*([^\d\n]+)/g;
const PROXIMITY_THRESHOLD = 20;

/**
 * Checks if content is binary and cannot be parsed as text
 * @param {string} text - The text content to check
 * @returns {boolean} - True if binary content is detected
 */
export const isBinaryContent = (text) => {
  return BINARY_FILE_MARKERS.some(marker => text.indexOf(marker) === 0) || 
         /[\x00-\x08\x0E-\x1F]/.test(text.substring(0, 100));
};

/**
 * Normalizes text content by removing BOM, normalizing line endings, and cleaning encoding issues
 * @param {string} text - Raw text content
 * @returns {string} - Normalized text
 */
export const normalizeText = (text) => {
  return text
    .replace(new RegExp(BOM_CHAR, 'g'), '') // Remove BOM
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(new RegExp(ENCODING_ISSUE_CHAR, 'g'), ' '); // Replace encoding issue characters
};

/**
 * Finds section indices in the text for specialist and newcomer sections
 * @param {string} simplifiedText - Lowercase, simplified text for searching
 * @returns {Object} - Object with specialistIndex and newcomerIndex
 */
export const findSectionIndices = (simplifiedText) => {
  const SPECIALIST_HEADER = "feedback after onboarding from the onboarding specialist";
  const NEWCOMER_HEADER = "newcomer's feedback after onboarding";
  
  let specialistIndex = simplifiedText.indexOf(SPECIALIST_HEADER);
  let newcomerIndex = simplifiedText.indexOf(NEWCOMER_HEADER);
  
  // Fallback search for newcomer section using proximity matching
  if (newcomerIndex === -1) {
    const newcomerKeywordPos = simplifiedText.indexOf("newcomer");
    const feedbackKeywordPos = simplifiedText.indexOf("feedback", newcomerKeywordPos);
    
    if (newcomerKeywordPos !== -1 && feedbackKeywordPos !== -1 && 
        (feedbackKeywordPos - newcomerKeywordPos) < PROXIMITY_THRESHOLD) {
      newcomerIndex = newcomerKeywordPos;
    }
  }
  
  // Fallback search for specialist section using proximity matching
  if (specialistIndex === -1) {
    const specialistKeywordPos = simplifiedText.indexOf("specialist");
    const feedbackKeywordPos = simplifiedText.indexOf("feedback", specialistKeywordPos - 10);
    
    if (specialistKeywordPos !== -1 && feedbackKeywordPos !== -1 && 
        Math.abs(feedbackKeywordPos - specialistKeywordPos) < PROXIMITY_THRESHOLD) {
      specialistIndex = Math.min(specialistKeywordPos, feedbackKeywordPos);
    }
  }
  
  return { specialistIndex, newcomerIndex };
};

/**
 * Extracts questions from a text section using regex
 * @param {string} sectionText - Text section to extract questions from
 * @returns {Array} - Array of extracted question strings
 */
export const extractQuestionsFromSection = (sectionText) => {
  const questions = [];
  let match;
  
  while ((match = QUESTION_REGEX.exec(sectionText)) !== null) {
    const questionText = match[1]
      .replace(new RegExp(ENCODING_ISSUE_CHAR, 'g'), ' ')
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
 * @param {string} text - Raw text content
 * @returns {Object} - Object with specialist and newcomer question arrays
 */
export const parseQuestionsFromText = (text) => {
  // Check for binary content
  if (isBinaryContent(text)) {
    console.error("Binary file content detected - cannot parse as text");
    return { specialist: [], newcomer: [] };
  }
  
  console.log("Full text content (first 500 chars):", text.substring(0, 500));
  
  const normalizedText = normalizeText(text);
  const simplifiedText = normalizedText.toLowerCase().replace(/\s+/g, ' ');
  
  console.log("Normalized text (first 200 chars):", simplifiedText.substring(0, 200));
  
  const { specialistIndex, newcomerIndex } = findSectionIndices(simplifiedText);
  
  // Log findings
  if (specialistIndex !== -1) {
    console.log(`Found specialist section at index ${specialistIndex}`);
  }
  if (newcomerIndex !== -1) {
    console.log(`Found newcomer section at index ${newcomerIndex}`);
  }
  
  const specialistQuestions = [];
  const newcomerQuestions = [];
  
  // Extract specialist questions
  if (specialistIndex !== -1) {
    let specialistSection;
    if (newcomerIndex !== -1 && newcomerIndex > specialistIndex) {
      specialistSection = normalizedText.substring(specialistIndex, newcomerIndex);
    } else {
      specialistSection = normalizedText.substring(specialistIndex);
    }
    
    console.log("Specialist section (first 200 chars):", specialistSection.substring(0, 200));
    specialistQuestions.push(...extractQuestionsFromSection(specialistSection));
  }
  
  // Extract newcomer questions
  if (newcomerIndex !== -1) {
    const newcomerSection = normalizedText.substring(newcomerIndex);
    console.log("Newcomer section (first 200 chars):", newcomerSection.substring(0, 200));
    newcomerQuestions.push(...extractQuestionsFromSection(newcomerSection));
  }
  
  return {
    specialist: specialistQuestions,
    newcomer: newcomerQuestions
  };
};