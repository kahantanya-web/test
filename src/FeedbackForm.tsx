import  { useState } from 'react';
import * as XLSX from 'xlsx';



import { Answer, Feedback } from "./types/feedback";

interface FeedbackFormProps {
  onFeedback: (result: Feedback | null, errMsg: string) => void;
}

interface ParsedQuestions {
  specialist: string[];
  newcomer: string[];
}

interface ValidationState {
  newcomerFile: string;
  specialistFile: string;
  name: string;
  questionsFile: string;
}

interface TouchedState {
  newcomerFile: boolean;
  specialistFile: boolean;
  name: boolean;
  questionsFile: boolean;
}

function FeedbackForm({ onFeedback }: FeedbackFormProps) {
  const [newcomerFeedbackFile, setNewcomerFeedbackFile] = useState<File | null>(null);
  const [specialistFeedbackFile, setSpecialistFeedbackFile] = useState<File | null>(null);
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestions>({ specialist: [], newcomer: [] });
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [validation, setValidation] = useState<ValidationState>({ newcomerFile: '', specialistFile: '', name: '', questionsFile: '' });
  const [touched, setTouched] = useState<TouchedState>({ newcomerFile: false, specialistFile: false, name: false, questionsFile: false });

  const handleNewcomerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewcomerFeedbackFile(e.target.files[0]);
    }
    setTouched(t => ({ ...t, newcomerFile: true }));
    setValidation(v => ({ ...v, newcomerFile: '' }));
    setError('');
  };

  const handleSpecialistFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSpecialistFeedbackFile(e.target.files[0]);
    }
    setTouched(t => ({ ...t, specialistFile: true }));
    setValidation(v => ({ ...v, specialistFile: '' }));
    setError('');
  };

  const handleQuestionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setQuestionsFile(file);
    setTouched(t => ({ ...t, questionsFile: true }));
    setValidation(v => ({ ...v, questionsFile: '' }));
    setError('');

    console.log("Selected questions file:", file);
    
    if (file) {
      // Check if file is a plain text file or not
      if (file.type === 'text/plain') {
        // Handle plain text files
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
          const content = evt.target && typeof evt.target.result === 'string' ? evt.target.result : '';
          console.log("Text file content detected");
          const extractedQuestions = parseQuestionsFromText(content);
          setParsedQuestions(extractedQuestions);
          
          if (extractedQuestions.specialist.length === 0 && extractedQuestions.newcomer.length === 0) {
            setValidation(v => ({ 
              ...v, 
              questionsFile: 'No questions could be extracted from the file.' 
            }));
            setTouched(t => ({ ...t, questionsFile: true }));
          }
        };
        reader.readAsText(file);
      } else {
        // For non-text files (.odt, .doc, .docx, etc.), display a message
        setValidation(v => ({ 
          ...v, 
          questionsFile: 'Please use a plain text (.txt) file. Other document formats like .odt, .doc, or .docx cannot be processed directly.' 
        }));
        setTouched(t => ({ ...t, questionsFile: true }));
        
        // We could use libraries like mammoth.js for .docx or similar for .odt,
        // but for simplicity, let's just ask the user to provide a .txt file
        console.error("Unsupported file format:", file.type);
      }
    }
  };
  
  const parseQuestionsFromText = (text: string): ParsedQuestions => {
    // Additional check to detect binary content
    if (text.indexOf('PK') === 0 || text.indexOf('%PDF') === 0 || /[\x00-\x08\x0E-\x1F]/.test(text.substring(0, 100))) {
      console.error("Binary file content detected - cannot parse as text");
      return { specialist: [], newcomer: [] };
    }
    
    console.log("Full text content (first 500 chars):", text.substring(0, 500));
    
    // Normalize the text - replace special characters and normalize line endings
    let normalizedText = text.replace(/^\ufeff/, '').replace(/\r\n/g, '\n');
    
    // Replace the � characters that appear due to encoding issues
    normalizedText = normalizedText.replace(/�/g, ' ');
    
    // Simplify the text for search by removing extra spaces and making it lowercase
    const simplifiedText = normalizedText.toLowerCase().replace(/\s+/g, ' ');
    
    console.log("Normalized text (first 200 chars):", simplifiedText.substring(0, 200));
    
    // Define headers for both sections with flexible matching
    const specialistHeaders = "feedback after onboarding from the onboarding specialist";
    const newcomerHeaders = "newcomer's feedback after onboarding";

    
    // Find specialist section
    let specialistSectionIndex = simplifiedText.indexOf(specialistHeaders);
    if (specialistSectionIndex !== -1) {
      console.log(`Found specialist header: "${specialistHeaders}" at index ${specialistSectionIndex}`);
    }
    
    // Find newcomer section
    let newcomerSectionIndex = simplifiedText.indexOf(newcomerHeaders);
    if (newcomerSectionIndex !== -1) {
      console.log(`Found newcomer header: "${newcomerHeaders}" at index ${newcomerSectionIndex}`);
    }
    
    // Fallback for newcomer section
    if (newcomerSectionIndex === -1) {
      const newcomerIndex = simplifiedText.indexOf("newcomer");
      const feedbackIndex = simplifiedText.indexOf("feedback", newcomerIndex);
      
      if (newcomerIndex !== -1 && feedbackIndex !== -1 && 
          (feedbackIndex - newcomerIndex) < 20) {
        newcomerSectionIndex = newcomerIndex;
        console.log(`Found "newcomer" and "feedback" nearby at index ${newcomerIndex}`);
      }
    }
    
    // Fallback for specialist section
    if (specialistSectionIndex === -1) {
      const specialistIndex = simplifiedText.indexOf("specialist");
      const feedbackIndex = simplifiedText.indexOf("feedback", specialistIndex - 10);
      
      if (specialistIndex !== -1 && feedbackIndex !== -1 && 
          Math.abs(feedbackIndex - specialistIndex) < 20) {
        specialistSectionIndex = Math.min(specialistIndex, feedbackIndex);
        console.log(`Found "specialist" and "feedback" nearby at index ${specialistSectionIndex}`);
      }
    }
    
    // Extract questions from both sections
    const specialistQuestions = [];
    const newcomerQuestions = [];
    
    // Extract specialist questions if section was found
    if (specialistSectionIndex !== -1) {
      // If we have both sections, extract text between them
      let specialistSection;
      if (newcomerSectionIndex !== -1 && newcomerSectionIndex > specialistSectionIndex) {
        specialistSection = normalizedText.substring(specialistSectionIndex, newcomerSectionIndex);
      } else {
        specialistSection = normalizedText.substring(specialistSectionIndex);
      }
      
      console.log("Specialist section (first 200 chars):", specialistSection.substring(0, 200));
      
      // Extract questions using regex
      const questionRegex = /\d+\s*\.?\s*([^\d\n]+)/g;
      let match;
      
      while ((match = questionRegex.exec(specialistSection)) !== null) {
        const questionText = match[1].replace(/�/g, ' ').replace(/\s+/g, ' ').trim();
        if (questionText) {
          specialistQuestions.push(questionText);
        }
      }
    }
    
    // Extract newcomer questions if section was found
    if (newcomerSectionIndex !== -1) {
      const newcomerSection = normalizedText.substring(newcomerSectionIndex);
      console.log("Newcomer section (first 200 chars):", newcomerSection.substring(0, 200));
      
      const questionRegex = /\d+\s*\.?\s*([^\d\n]+)/g;
      let match;
      
      while ((match = questionRegex.exec(newcomerSection)) !== null) {
        const questionText = match[1].replace(/�/g, ' ').replace(/\s+/g, ' ').trim();
        if (questionText) {
          newcomerQuestions.push(questionText);
        }
      }
    }
    
    return {
      specialist: specialistQuestions,
      newcomer: newcomerQuestions
    };
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setTouched(t => ({ ...t, name: true }));
    setValidation(v => ({ ...v, name: '' }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;
    let v = { newcomerFile: '', specialistFile: '', name: '', questionsFile: '' };
    
    if (!newcomerFeedbackFile) {
      v.newcomerFile = 'Newcomer feedback file is required.';
      valid = false;
    }
    
    if (!specialistFeedbackFile) {
      v.specialistFile = 'Specialist feedback file is required.';
      valid = false;
    }
    
    if (!questionsFile) {
      v.questionsFile = 'Questions file is required.';
      valid = false;
    }
    
    // Check if any questions were extracted
    if (parsedQuestions.specialist.length === 0 && parsedQuestions.newcomer.length === 0) {
      v.questionsFile = 'No questions could be extracted from the file.';
      valid = false;
    }
    
    if (!userName.trim()) {
      v.name = 'User name is required.';
      valid = false;
    }
    
    setValidation(v);
    setTouched({ newcomerFile: true, specialistFile: true, name: true, questionsFile: true });
    if (!valid) return;

  const processExcelFile = (file: File | null, options: { sheet: string; userNameColumn: string }, fileType: string): Promise<Record<string, string>> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
          try {
            if (!evt.target || !(evt.target.result instanceof ArrayBuffer)) {
              reject(`Error reading ${fileType} feedback file: invalid result type.`);
              return;
            }
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            let sheetName = options.sheet;
            const worksheet = workbook.Sheets[sheetName];

            if (!sheetName || !workbook.Sheets[sheetName]) {
              reject(`Could not find the required sheet in the ${fileType} feedback file.`);
              return;
            }

            const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: '' });

            if (jsonData.length === 0) {
              reject(`The sheet in the ${fileType} feedback file is empty.`);
              return;
            }

            let userNameColumn = options.userNameColumn;
            const headers = Object.keys(jsonData[0]);

            const row = jsonData.find(r =>
              typeof r[userNameColumn] === 'string' &&
              (r[userNameColumn] || '').trim().toLowerCase() === userName.trim().toLowerCase()
            );

            if (!row) {
              reject(`User not found in ${fileType} feedback file.`);
              return;
            }

            resolve(row);
          } catch (error) {
            if (error instanceof Error) {
              reject(`Error processing ${fileType} feedback file: ${error.message}`);
            } else {
              reject(`Error processing ${fileType} feedback file: unknown error`);
            }
          }
        };
  reader.onerror = () => reject(`Error reading ${fileType} feedback file`);
        if (file) {
          reader.readAsArrayBuffer(file);
        } else {
          reject(`No file provided for ${fileType} feedback file.`);
        }
      });
    };

    // Process both Excel files
    const processNewcomerFile = processExcelFile(
      newcomerFeedbackFile,
      { sheet: 'Form1', userNameColumn: 'Name' },
      'newcomer'
    );

    const processSpecialistFile = processExcelFile(
      specialistFeedbackFile,
      { 
        sheet: 'Form1',
        userNameColumn: "Please, fill the name of newcommer:" 
      },
      'specialist'
    );

    // Process both files and combine results
    Promise.all([processNewcomerFile, processSpecialistFile])
      .then(([newcomerData, specialistData]) => {
        // Process both sets of questions
        const specialistAnswers = parsedQuestions.specialist.map(question => ({
          question,
          answer: (specialistData as Record<string, string>)[question] || ''
        }));

        const newcomerAnswers = parsedQuestions.newcomer.map(question => ({
          question,
          answer: (newcomerData as Record<string, string>)[question] || ''
        }));

        // Create the feedback structure with section titles
        const feedback: Feedback = {
          userName,
          specialistTitle: "Feedback after onboarding from the onboarding specialist:",
          specialistAnswers,
          newcomerTitle: "Newcomer's feedback after onboarding:",
          newcomerAnswers
        };

        setError('');
        onFeedback(feedback, '');
      })
      .catch(err => {
        setError(err.toString());
        onFeedback(null, err.toString());
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Newcomer's feedback (.xlsx)</label>
          <input
            id="newcomer-feedback-file"
            type="file"
            accept=".xlsx"
            onChange={handleNewcomerFileChange}
            className="block w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {touched.newcomerFile && validation.newcomerFile && (
            <div className="text-red-500 text-sm mt-1">{validation.newcomerFile}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Feedback from the onboarding specialist (.xlsx)</label>
          <input
            id="specialist-feedback-file"
            type="file"
            accept=".xlsx"
            onChange={handleSpecialistFileChange}
            className="block w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {touched.specialistFile && validation.specialistFile && (
            <div className="text-red-500 text-sm mt-1">{validation.specialistFile}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Questions file (.txt) *</label>
          <input
            id="questions-file"
            type="file"
            accept=".txt"
            onChange={handleQuestionsFileChange}
            className="block w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4  file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {touched.questionsFile && validation.questionsFile && (
            <div className="text-red-500 text-sm mt-1">{validation.questionsFile}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">User name</label>
          <input
            id="user-name"
            type="text"
            placeholder="Enter user name as in Excel"
            value={userName}
            onChange={handleUserNameChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {touched.name && validation.name && (
            <div className="text-red-500 text-sm mt-1">{validation.name}</div>
          )}
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition duration-150">
          Get feedback
        </button>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </form>
    </div>
  );
}

export default FeedbackForm;
