import * as XLSX from 'xlsx';

/**
 * Configuration for different file types
 */
export const FILE_CONFIGS = {
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
 * Processes an Excel file and extracts user data
 * @param {File} file - The Excel file to process
 * @param {Object} config - Configuration object with sheet and userNameColumn
 * @param {string} userName - The user name to search for
 * @param {string} fileType - Type of file (for error messages)
 * @returns {Promise<Object>} - Promise resolving to user data object
 */
export const processExcelFile = (file, config, userName, fileType) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const { sheet: sheetName, userNameColumn } = config;
        const worksheet = workbook.Sheets[sheetName];
        
        if (!sheetName || !worksheet) {
          reject(new Error(`Could not find the required sheet in the ${fileType} feedback file.`));
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          reject(new Error(`The sheet in the ${fileType} feedback file is empty.`));
          return;
        }

        const userRow = jsonData.find(row => 
          (row[userNameColumn] || '').trim().toLowerCase() === userName.trim().toLowerCase()
        );

        if (!userRow) {
          reject(new Error(`User not found in ${fileType} feedback file.`));
          return;
        }
        
        resolve(userRow);
      } catch (error) {
        reject(new Error(`Error processing ${fileType} feedback file: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error(`Error reading ${fileType} feedback file`));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes both newcomer and specialist Excel files
 * @param {File} newcomerFile - Newcomer feedback Excel file
 * @param {File} specialistFile - Specialist feedback Excel file
 * @param {string} userName - User name to search for
 * @returns {Promise<Array>} - Promise resolving to [newcomerData, specialistData]
 */
export const processBothExcelFiles = async (newcomerFile, specialistFile, userName) => {
  const newcomerProcess = processExcelFile(
    newcomerFile,
    FILE_CONFIGS.newcomer,
    userName,
    'newcomer'
  );

  const specialistProcess = processExcelFile(
    specialistFile,
    FILE_CONFIGS.specialist,
    userName,
    'specialist'
  );

  return Promise.all([newcomerProcess, specialistProcess]);
};