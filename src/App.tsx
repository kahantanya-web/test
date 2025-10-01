import { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import FeedbackDisplay from './FeedbackDisplay';
import ErrorAlert from './ErrorAlert';


import { Answer, Feedback } from "./types/feedback";

function App() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string>('');

  const handleFeedback = (result: Feedback | null, errMsg: string) => {
    setFeedback(result);
    setError(errMsg);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Onboarding Feedback Finder</h2>
        <FeedbackForm onFeedback={handleFeedback} />
        <ErrorAlert message={error} />
        <FeedbackDisplay feedback={feedback ?? undefined} />
      </div>
    </div>
  );
}

export default App;
