import * as XLSX from 'xlsx';

/**
 * Configuration for different file types
 */
export const FILE_CONFIG = {
  newcomer: {
    sheet: 'Form1',
    userNameColumn: 'Name'
  },
  specialist: {
    sheet: 'Form1',
    userNameColumn: "Please, fill the name of newcommer:"
  }
};

/**
 * Process an Excel file and extract user data
 * @param {File} file - Excel file to process
 * @param {object} options - Configuration options (sheet name, user column)
 * @param {string} fileType - Type of file ('newcomer' or 'specialist')
 * @param {string} userName - Name to search for in the file
 * @returns {Promise<object>} - Promise resolving to user data row
 */
export const processExcelFile = (file, options, fileType, userName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = options.sheet;
        const worksheet = workbook.Sheets[sheetName];
        
        if (!sheetName || !workbook.Sheets[sheetName]) {
          reject(`Could not find the required sheet in the ${fileType} feedback file.`);
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          reject(`The sheet in the ${fileType} feedback file is empty.`);
          return;
        }

        const userNameColumn = options.userNameColumn;
        
        const row = jsonData.find(r => 
          (r[userNameColumn] || '').trim().toLowerCase() === userName.trim().toLowerCase()
        );

        if (!row) {
          reject(`User not found in ${fileType} feedback file.`);
          return;
        }
        
        resolve(row);
      } catch (error) {
        reject(`Error processing ${fileType} feedback file: ${error.message}`);
      }
    };
    
    reader.onerror = () => reject(`Error reading ${fileType} feedback file`);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Process both Excel files and combine results
 * @param {File} newcomerFile - Newcomer feedback Excel file
 * @param {File} specialistFile - Specialist feedback Excel file
 * @param {string} userName - User name to search for
 * @param {object} parsedQuestions - Parsed questions from text file
 * @returns {Promise<object>} - Promise resolving to combined feedback data
 */
export const processFeedbackFiles = async (newcomerFile, specialistFile, userName, parsedQuestions) => {
  const processNewcomerFile = processExcelFile(
    newcomerFile,
    FILE_CONFIG.newcomer,
    'newcomer',
    userName
  );

  const processSpecialistFile = processExcelFile(
    specialistFile,
    FILE_CONFIG.specialist,
    'specialist',
    userName
  );

  try {
    const [newcomerData, specialistData] = await Promise.all([
      processNewcomerFile,
      processSpecialistFile
    ]);

    // Process both sets of questions
    const specialistAnswers = parsedQuestions.specialist.map(question => ({
      question,
      answer: specialistData[question] || ''
    }));

    const newcomerAnswers = parsedQuestions.newcomer.map(question => ({
      question,
      answer: newcomerData[question] || ''
    }));

    // Create the feedback structure
    const feedback = {
      userName,
      specialistTitle: "Feedback after onboarding from the onboarding specialist:",
      specialistAnswers,
      newcomerTitle: "Newcomer's feedback after onboarding:",
      newcomerAnswers,
      answers: [
        ...specialistAnswers,
        ...newcomerAnswers
      ]
    };

    return feedback;
  } catch (error) {
    throw new Error(error.toString());
  }
};