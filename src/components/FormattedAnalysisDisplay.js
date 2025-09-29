/**
 * Component to display formatted AI analysis text (fallback for non-JSON responses)
 * @param {string} analysis - Raw analysis text from AI
 */
const FormattedAnalysisDisplay = ({ analysis }) => {
  if (!analysis) return null;

  const lines = analysis.split('\n').filter(line => line.trim());
  
  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Check if it's a section header (contains colon and starts with capital letter)
        if (trimmed.includes(':') && /^[A-Z]/.test(trimmed)) {
          const [label, ...contentParts] = trimmed.split(':');
          const content = contentParts.join(':').trim();
          
          return (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">{label}:</h4>
              {content && <p className="text-gray-700">{content}</p>}
            </div>
          );
        }
        
        // Regular text
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedAnalysisDisplay;