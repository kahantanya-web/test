/**
 * Reusable file input component with validation
 */
const FileInput = ({ 
  id, 
  label, 
  accept, 
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
        type="file"
        accept={accept}
        onChange={onChange}
        className="block w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {touched && validation && (
        <div className="text-red-500 text-sm mt-1">{validation}</div>
      )}
    </div>
  );
};

export default FileInput;