import { useState } from 'react';
import { parseQuestionsFromText } from '../utils/questionParser';
import { processFeedbackFiles } from '../utils/excelProcessor';
import { useFormValidation } from '../hooks/useFormValidation';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import FileInput from '../components/FileInput';
import TextInput from '../components/TextInput';
import AIAnalysisPanel from '../components/AIAnalysisPanel';

/**
 * Main feedback form component - refactored for better maintainability
 */
function FeedbackForm({ onFeedback }) {
  // Form state
  const [feedbackData, setFeedbackData] = useState(null);
  const [newcomerFeedbackFile, setNewcomerFeedbackFile] = useState(null);
  const [specialistFeedbackFile, setSpecialistFeedbackFile] = useState(null);
  const [questionsFile, setQuestionsFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState({ specialist: [], newcomer: [] });
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  // Custom hooks
  const {
    validation,
    touched,
    clearValidation,
    setFieldTouched,
    setFieldValidation,
    validateForm
  } = useFormValidation();

  const {
    isAnalyzing,
    aiAnalysis,
    structuredAnalysis,
    analysisError,
    analyzeFeedback,
    resetAnalysis
  } = useAIAnalysis();

  // File change handlers
  const handleNewcomerFileChange = (e) => {
    setNewcomerFeedbackFile(e.target.files[0]);
    setFieldTouched('newcomerFile');
    clearValidation('newcomerFile');
    setError('');
  };

  const handleSpecialistFileChange = (e) => {
    setSpecialistFeedbackFile(e.target.files[0]);
    setFieldTouched('specialistFile');
    clearValidation('specialistFile');
    setError('');
  };

  const handleQuestionsFileChange = (e) => {
    const file = e.target.files[0];
    setQuestionsFile(file);
    setFieldTouched('questionsFile');
    clearValidation('questionsFile');
    setError('');
    
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target.result;
          const extractedQuestions = parseQuestionsFromText(content);
          setParsedQuestions(extractedQuestions);
          
          if (extractedQuestions.specialist.length === 0 && extractedQuestions.newcomer.length === 0) {
            setFieldValidation('questionsFile', 'No questions could be extracted from the file.');
            setFieldTouched('questionsFile');
          }
        };
        reader.readAsText(file);
      } else {
        setFieldValidation(
          'questionsFile', 
          'Please use a plain text (.txt) file. Other document formats like .odt, .doc, or .docx cannot be processed directly.'
        );
        setFieldTouched('questionsFile');
      }
    }
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
    setFieldTouched('name');
    clearValidation('name');
    setError('');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
      newcomerFeedbackFile,
      specialistFeedbackFile,
      questionsFile,
      parsedQuestions,
      userName
    };

    if (!validateForm(formData)) return;

    try {
      const feedback = await processFeedbackFiles(
        newcomerFeedbackFile,
        specialistFeedbackFile,
        userName,
        parsedQuestions
      );
      
      setError('');
      setFeedbackData(feedback);
      resetAnalysis(); // Clear any previous analysis
      onFeedback(feedback, '', false);
    } catch (err) {
      setError(err.message);
      onFeedback(null, err.message);
    }
  };

  // AI Analysis handler
  const handleAIAnalysis = () => {
    if (feedbackData) {
      analyzeFeedback(feedbackData);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <FileInput
          id="newcomer-feedback-file"
          label="Newcomer's feedback (.xlsx)"
          accept=".xlsx"
          onChange={handleNewcomerFileChange}
          touched={touched.newcomerFile}
          validation={validation.newcomerFile}
          required
        />

        <FileInput
          id="specialist-feedback-file"
          label="Feedback from the onboarding specialist (.xlsx)"
          accept=".xlsx"
          onChange={handleSpecialistFileChange}
          touched={touched.specialistFile}
          validation={validation.specialistFile}
          required
        />

        <FileInput
          id="questions-file"
          label="Questions file (.txt)"
          accept=".txt"
          onChange={handleQuestionsFileChange}
          touched={touched.questionsFile}
          validation={validation.questionsFile}
          required
        />

        <TextInput
          id="user-name"
          label="User name"
          placeholder="Enter user name as in Excel"
          value={userName}
          onChange={handleUserNameChange}
          touched={touched.name}
          validation={validation.name}
          required
        />

        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition duration-150"
        >
          Get feedback
        </button>
        
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </form>

      <AIAnalysisPanel
        feedbackData={feedbackData}
        isAnalyzing={isAnalyzing}
        aiAnalysis={aiAnalysis}
        structuredAnalysis={structuredAnalysis}
        analysisError={analysisError}
        onAnalyze={handleAIAnalysis}
      />
    </div>
  );
}

export default FeedbackForm;