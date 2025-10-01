import { useState } from 'react';
import FeedbackSection from './FeedbackSection';
import CopyButton from './CopyButton';


import { Answer, Feedback } from "./types/feedback";

interface FeedbackDisplayProps {
  feedback?: Feedback;
}

function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
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

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
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
