import { CheckIcon, LightningIcon, WarningIcon, ClipboardIcon } from './Icons';

/**
 * Component to render structured AI analysis with icons and styling
 * @param {object} analysis - Structured analysis object with 4 properties
 */
const StructuredAnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-green-500 pl-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
          Overall Sentiment
        </h4>
        <p className="text-gray-700 leading-relaxed">{analysis.overallSentiment}</p>
      </div>

      <div className="border-l-4 border-blue-500 pl-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <LightningIcon className="w-4 h-4 mr-2 text-blue-500" />
          Key Strengths
        </h4>
        <p className="text-gray-700 leading-relaxed">{analysis.keyStrengths}</p>
      </div>

      <div className="border-l-4 border-yellow-500 pl-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <WarningIcon className="w-4 h-4 mr-2 text-yellow-500" />
          Areas for Improvement
        </h4>
        <p className="text-gray-700 leading-relaxed">{analysis.areasForImprovement}</p>
      </div>

      <div className="border-l-4 border-purple-500 pl-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <ClipboardIcon className="w-4 h-4 mr-2 text-purple-500" />
          Action Items
        </h4>
        <p className="text-gray-700 leading-relaxed">{analysis.actionItems}</p>
      </div>
    </div>
  );
};

export default StructuredAnalysisDisplay;