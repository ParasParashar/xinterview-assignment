"use client";
import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi"; // React icon for the upload button
import { AiFillFilePdf } from "react-icons/ai"; // React icon for the uploaded file
import { Button } from "../ui/button"; // Assuming you're using a Button component

const PdfUploader = ({
  onFileUpload,
}: {
  onFileUpload: (file: File) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  bg-neutral-800/60  rounded-lg shadow-md">
      {!selectedFile && (
        <div className="flex flex-col items-center gap-4 p-8">
          <FiUploadCloud size={48} className="text-blue-300" />
          <h2 className="text-lg font-semibold text-blue-300">
            Upload your PDF file
          </h2>
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FiUploadCloud size={20} />
            Choose File
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {selectedFile && (
        <div className="flex flex-col items-center gap-4  p-2">
          <p className="text-gray-300 font-semibold">
            Uploaded: <span className="text-blue-300">{selectedFile.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
