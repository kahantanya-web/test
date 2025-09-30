import { useState } from 'react';
import FeedbackSection from './FeedbackSection';
import CopyButton from './CopyButton';

function FeedbackDisplay({ feedback }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!feedback) return null;

  const copyToClipboard = () => {
    if (!feedback) return;

    const { userName, specialistTitle, specialistAnswers, newcomerTitle, newcomerAnswers } = feedback;

    let textToCopy = `Onboarding Feedback for ${userName}\n\n`;
    
    textToCopy += `${specialistTitle}\n`;
    specialistAnswers.forEach(item => {
      textToCopy += `Q: ${item.question}\n`;
      textToCopy += `A: ${item.answer || 'No answer provided'}\n\n`;
    });

    textToCopy += `\n${newcomerTitle}\n`;
    newcomerAnswers.forEach(item => {
      textToCopy += `Q: ${item.question}\n`;
      textToCopy += `A: ${item.answer || 'No answer provided'}\n\n`;
    });

    try {
      const writePromise = navigator.clipboard?.writeText(textToCopy.trim());
      
      if (writePromise && typeof writePromise.then === 'function') {
        writePromise
          .then(() => {
            setIsCopied(true);
            const timeoutId = setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
            return timeoutId;
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      } else {
        // Fallback for environments where clipboard API doesn't return a Promise
        setIsCopied(true);
        const timeoutId = setTimeout(() => setIsCopied(false), 2000);
        return timeoutId;
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="relative mb-6 flex items-start justify-between">
        <h2 className="text-2xl font-bold text-center flex-grow pr-4">Onboarding Feedback for <span className="text-blue-600">{feedback.userName}</span></h2>
        <CopyButton
          onClick={copyToClipboard}
          isCopied={isCopied}
          title={isCopied ? 'Copied!' : 'Copy to clipboard'}
        />
      </div>
      
      <div className="mb-8">
        <FeedbackSection 
          title={feedback.specialistTitle} 
          answers={feedback.specialistAnswers} 
          sectionKey="specialist" 
        />
      </div>

      <div>
        <FeedbackSection 
          title={feedback.newcomerTitle} 
          answers={feedback.newcomerAnswers} 
          sectionKey="newcomer" 
        />
      </div>
    </div>
  );
}

export default FeedbackDisplay;
