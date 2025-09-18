function FeedbackSection({ title, answers, sectionKey }) {
  if (!answers || answers.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ol className="list-decimal ml-6">
        {answers.map((item, idx) => (
          <li key={`${sectionKey}-${idx}`} className="mb-6">
            <div className="font-medium text-gray-800 mb-1">{item.question}</div>
            <div className="text-gray-700">Answer: {item.answer ? item.answer : <em className="text-gray-400">No answer provided</em>}</div>
          </li>
        ))}
      </ol>
    </>
  );
}

export default FeedbackSection;
