import StructuredAnalysisDisplay from './StructuredAnalysisDisplay';
import FormattedAnalysisDisplay from './FormattedAnalysisDisplay';
import { AnalyticsIcon } from './Icons';

/**
 * Component for displaying AI analysis panel with results
 */
const AIAnalysisPanel = ({ 
  feedbackData, 
  isAnalyzing, 
  aiAnalysis, 
  structuredAnalysis, 
  analysisError, 
  onAnalyze 
}) => {
  if (!feedbackData) return null;

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">AI Feedback Analysis</h2>
      
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`mb-4 ${
          isAnalyzing 
            ? 'bg-gray-400' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white font-semibold py-2 px-6 rounded shadow transition duration-150`}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Feedback with AI'}
      </button>
      
      {analysisError && (
        <div className="text-red-500 mb-4">{analysisError}</div>
      )}
      
      {/* Display structured analysis if available */}
      {structuredAnalysis && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AnalyticsIcon className="w-5 h-5 mr-2 text-blue-600" />
            AI Analysis Results
          </h3>
          <StructuredAnalysisDisplay analysis={structuredAnalysis} />
        </div>
      )}
      
      {/* Fallback to formatted text display */}
      {!structuredAnalysis && aiAnalysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h3>
          <FormattedAnalysisDisplay analysis={aiAnalysis} />
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;