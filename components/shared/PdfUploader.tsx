"use client";
import { useState } from "react";

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
    <div className="p-4">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {selectedFile && <p className="mt-2">Uploaded: {selectedFile.name}</p>}
    </div>
  );
};

export default PdfUploader;
