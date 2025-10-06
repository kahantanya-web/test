/**
 * Form validation utilities
 */

// Validation error messages
const VALIDATION_MESSAGES = {
  NEWCOMER_FILE_REQUIRED: 'Newcomer feedback file is required.',
  SPECIALIST_FILE_REQUIRED: 'Specialist feedback file is required.',
  QUESTIONS_FILE_REQUIRED: 'Questions file is required.',
  NO_QUESTIONS_EXTRACTED: 'No questions could be extracted from the file.',
  USER_NAME_REQUIRED: 'User name is required.'
};

// Feedback titles
const FEEDBACK_TITLES = {
  SPECIALIST: "Feedback after onboarding from the onboarding specialist:",
  NEWCOMER: "Newcomer's feedback after onboarding:"
};

/**
 * Validates form fields and returns validation errors
 * @param {Object} formData - Form data to validate
 * @param {Object} parsedQuestions - Parsed questions object
 * @returns {Object} - Validation errors object and validity status
 */
export const validateForm = (formData, parsedQuestions) => {
  const { newcomerFeedbackFile, specialistFeedbackFile, questionsFile, userName } = formData;
  
  let isValid = true;
  const validationErrors = {
    newcomerFile: '',
    specialistFile: '',
    name: '',
    questionsFile: ''
  };
  
  if (!newcomerFeedbackFile) {
    validationErrors.newcomerFile = VALIDATION_MESSAGES.NEWCOMER_FILE_REQUIRED;
    isValid = false;
  }
  
  if (!specialistFeedbackFile) {
    validationErrors.specialistFile = VALIDATION_MESSAGES.SPECIALIST_FILE_REQUIRED;
    isValid = false;
  }
  
  if (!questionsFile) {
    validationErrors.questionsFile = VALIDATION_MESSAGES.QUESTIONS_FILE_REQUIRED;
    isValid = false;
  }
  
  // Check if any questions were extracted
  if (parsedQuestions.specialist.length === 0 && parsedQuestions.newcomer.length === 0) {
    validationErrors.questionsFile = VALIDATION_MESSAGES.NO_QUESTIONS_EXTRACTED;
    isValid = false;
  }
  
  if (!userName.trim()) {
    validationErrors.name = VALIDATION_MESSAGES.USER_NAME_REQUIRED;
    isValid = false;
  }
  
  return { validationErrors, isValid };
};

/**
 * Creates a feedback object from processed data
 * @param {string} userName - User name
 * @param {Object} parsedQuestions - Parsed questions object
 * @param {Object} newcomerData - Newcomer Excel data
 * @param {Object} specialistData - Specialist Excel data
 * @returns {Object} - Formatted feedback object
 */
export const createFeedbackObject = (userName, parsedQuestions, newcomerData, specialistData) => {
  const specialistAnswers = parsedQuestions.specialist.map(question => ({
    question,
    answer: specialistData[question] || ''
  }));
  
  const newcomerAnswers = parsedQuestions.newcomer.map(question => ({
    question,
    answer: newcomerData[question] || ''
  }));
  
  return {
    userName,
    specialistTitle: FEEDBACK_TITLES.SPECIALIST,
    specialistAnswers,
    newcomerTitle: FEEDBACK_TITLES.NEWCOMER,
    newcomerAnswers,
    // Keep the answers array for backward compatibility
    answers: [
      ...specialistAnswers,
      ...newcomerAnswers
    ]
  };
};