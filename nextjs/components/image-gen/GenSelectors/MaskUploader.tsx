import React, { useState } from "react";

interface MaskUploaderProps {
  maskFileRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setMaskFile: (file: File | null) => void; // ✅ Allow clearing the mask file
}

function MaskUploader({ maskFileRef, handleFileChange, setMaskFile }: MaskUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event);
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  const clearFile = () => {
    if (maskFileRef.current) {
      maskFileRef.current.value = ""; // ✅ Reset file input
    }
    setMaskFile(null);
    setFileName(null);
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-300 rounded-lg w-full">
      <label htmlFor="mask-upload" className="text-gray-700 mb-2 font-semibold">
        Upload Mask File
      </label>
      {!fileName && <div className="flex items-center">
      <input
        type="file"
        id="mask-upload"
        accept="image/png, image/jpeg, image/webp"
        ref={maskFileRef as React.RefObject<HTMLInputElement>}
        onChange={handleFileSelection}
        className="cursor-pointer file:border-none file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-600 transition w-full text-center"
        />

        </div>}
      {/* File Name Display */}
      {fileName && (
        <div className="mt-3 flex items-center space-x-2">
          <p className="text-sm text-gray-600">Selected: {fileName}</p>
          <button
            onClick={clearFile}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-700 transition"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default MaskUploader;
