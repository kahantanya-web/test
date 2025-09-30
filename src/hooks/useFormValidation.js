import { useState } from 'react';

/**
 * Custom hook for form validation and state management
 */
export const useFormValidation = () => {
  const [validation, setValidation] = useState({
    newcomerFile: '',
    specialistFile: '',
    name: '',
    questionsFile: ''
  });
  
  const [touched, setTouched] = useState({
    newcomerFile: false,
    specialistFile: false,
    name: false,
    questionsFile: false
  });

  const clearValidation = (field) => {
    setValidation(v => ({ ...v, [field]: '' }));
  };

  const setFieldTouched = (field, value = true) => {
    setTouched(t => ({ ...t, [field]: value }));
  };

  const setFieldValidation = (field, message) => {
    setValidation(v => ({ ...v, [field]: message }));
  };

  const validateForm = (data) => {
    let valid = true;
    const v = { newcomerFile: '', specialistFile: '', name: '', questionsFile: '' };
    
    if (!data.newcomerFeedbackFile) {
      v.newcomerFile = 'Newcomer feedback file is required.';
      valid = false;
    }
    
    if (!data.specialistFeedbackFile) {
      v.specialistFile = 'Specialist feedback file is required.';
      valid = false;
    }
    
    if (!data.questionsFile) {
      v.questionsFile = 'Questions file is required.';
      valid = false;
    }
    
    if (data.parsedQuestions?.specialist.length === 0 && data.parsedQuestions?.newcomer.length === 0) {
      v.questionsFile = 'No questions could be extracted from the file.';
      valid = false;
    }
    
    if (!data.userName?.trim()) {
      v.name = 'User name is required.';
      valid = false;
    }
    
    setValidation(v);
    setTouched({ newcomerFile: true, specialistFile: true, name: true, questionsFile: true });
    
    return valid;
  };

  return {
    validation,
    touched,
    clearValidation,
    setFieldTouched,
    setFieldValidation,
    validateForm
  };
};