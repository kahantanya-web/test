import { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import FeedbackDisplay from './FeedbackDisplay';
import ErrorAlert from './ErrorAlert';


function App() {
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const handleFeedback = (result, errMsg) => {
    setFeedback(result);
    setError(errMsg);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Onboarding Feedback Finder</h2>
        <FeedbackForm onFeedback={handleFeedback} />
        <ErrorAlert message={error} />
        <FeedbackDisplay feedback={feedback} />
      </div>
    </div>
  );
}

export default App;
