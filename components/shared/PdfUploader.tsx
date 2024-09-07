"use client";
import { useState } from "react";

const PdfUploader = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="p-2 border"
      />
    </div>
  );
};

export default PdfUploader;
