"use client";
import PdfEditor from "@/components/shared/PdfEditor";
import PdfUploader from "@/components/shared/PdfUploader";
import PdfViewer from "@/components/shared/PdfViewer";
import { useState } from "react";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const handleUpload = (file: File) => {
    setFile(file);
    setFileUrl(URL.createObjectURL(file));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Editor</h1>
      <PdfUploader onUpload={handleUpload} />
      {fileUrl && (
        <>
          <PdfViewer fileUrl={fileUrl} />
          <PdfEditor />
        </>
      )}
    </div>
  );
};

export default Home;
