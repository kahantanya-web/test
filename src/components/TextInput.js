/**
 * Reusable text input component with validation
 */
const TextInput = ({ 
  id, 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  touched, 
  validation, 
  required = false 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {touched && validation && (
        <div className="text-red-500 text-sm mt-1">{validation}</div>
      )}
    </div>
  );
};

export default TextInput;