/**
 * Reusable text input component
 */
function TextInput({ 
  id, 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  showError 
}) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {showError && error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
}

export default TextInput;