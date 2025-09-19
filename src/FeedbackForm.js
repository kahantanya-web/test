import { useState } from 'react';
import { parseQuestionsFromText } from './utils/textParser';
import { processBothExcelFiles } from './utils/excelProcessor';
import { validateForm, createFeedbackObject } from './utils/validation';
import FileInput from './components/FileInput';
import TextInput from './components/TextInput';

function FeedbackForm({ onFeedback }) {
  const [newcomerFeedbackFile, setNewcomerFeedbackFile] = useState(null);
  const [specialistFeedbackFile, setSpecialistFeedbackFile] = useState(null);
  const [questionsFile, setQuestionsFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState({ specialist: [], newcomer: [] });
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({ newcomerFile: '', specialistFile: '', name: '', questionsFile: '' });
  const [touched, setTouched] = useState({ newcomerFile: false, specialistFile: false, name: false, questionsFile: false });

  const clearFieldError = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    setError('');
  };

  const handleNewcomerFileChange = (e) => {
    setNewcomerFeedbackFile(e.target.files[0]);
    clearFieldError('newcomerFile');
  };

  const handleSpecialistFileChange = (e) => {
    setSpecialistFeedbackFile(e.target.files[0]);
    clearFieldError('specialistFile');
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
    clearFieldError('name');
  };

  const handleQuestionsFileChange = (e) => {
    const file = e.target.files[0];
    setQuestionsFile(file);
    clearFieldError('questionsFile');

    console.log("Selected questions file:", file);
    
    if (file) {
      processQuestionsFile(file);
    }
  };

  const processQuestionsFile = (file) => {
    // Check if file is a plain text file
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        console.log("Text file content detected");
        const extractedQuestions = parseQuestionsFromText(content);
        setParsedQuestions(extractedQuestions);
        
        if (extractedQuestions.specialist.length === 0 && extractedQuestions.newcomer.length === 0) {
          setValidationErrors(prev => ({ 
            ...prev, 
            questionsFile: 'No questions could be extracted from the file.' 
          }));
          setTouched(prev => ({ ...prev, questionsFile: true }));
        }
      };
      reader.readAsText(file);
    } else {
      // For non-text files, display a message
      const errorMessage = 'Please use a plain text (.txt) file. Other document formats like .odt, .doc, or .docx cannot be processed directly.';
      setValidationErrors(prev => ({ 
        ...prev, 
        questionsFile: errorMessage
      }));
      setTouched(prev => ({ ...prev, questionsFile: true }));
      
      console.error("Unsupported file format:", file.type);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
      newcomerFeedbackFile,
      specialistFeedbackFile,
      questionsFile,
      userName
    };
    
    const { validationErrors: errors, isValid } = validateForm(formData, parsedQuestions);
    
    setValidationErrors(errors);
    setTouched({ newcomerFile: true, specialistFile: true, name: true, questionsFile: true });
    
    if (!isValid) return;

    try {
      const [newcomerData, specialistData] = await processBothExcelFiles(
        newcomerFeedbackFile,
        specialistFeedbackFile,
        userName
      );
      
      const feedback = createFeedbackObject(userName, parsedQuestions, newcomerData, specialistData);
      
      setError('');
      onFeedback(feedback, '', false);
    } catch (err) {
      setError(err.message);
      onFeedback(null, err.message);
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
          error={validationErrors.newcomerFile}
          showError={touched.newcomerFile}
        />

        <FileInput
          id="specialist-feedback-file"
          label="Feedback from the onboarding specialist (.xlsx)"
          accept=".xlsx"
          onChange={handleSpecialistFileChange}
          error={validationErrors.specialistFile}
          showError={touched.specialistFile}
        />

        <FileInput
          id="questions-file"
          label="Questions file (.txt) *"
          accept=".txt"
          onChange={handleQuestionsFileChange}
          error={validationErrors.questionsFile}
          showError={touched.questionsFile}
        />

        <TextInput
          id="user-name"
          label="User name"
          placeholder="Enter user name as in Excel"
          value={userName}
          onChange={handleUserNameChange}
          error={validationErrors.name}
          showError={touched.name}
        />
        
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition duration-150">
          Get feedback
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </form>
    </div>
  );
}

export default FeedbackForm;
