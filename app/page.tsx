"use client";
import PdfEditor from "@/components/shared/PdfEditor";
import PdfUploader from "@/components/shared/PdfUploader";
import { useState } from "react";

const Home = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
  };

  const handlePdfUpdate = (updatedFile: Blob) => {
    const updatedUrl = URL.createObjectURL(updatedFile);
    setPdfUrl(updatedUrl);
  };
  console.log(pdfUrl, "data of the pdf url");
  return (
    <div className=" lg:p-6 xl:p-10 p-2  ">
      <h1 className="text-2xl font-bold mb-4">PDF Editor</h1>
      <div className="min-h-screen bg-neutral-800/60 rounded-lg p-2 flex flex-col gap-2  ">
        <PdfUploader onFileUpload={handleFileUpload} />
        {pdfFile && <PdfEditor file={pdfFile} onUpdate={handlePdfUpdate} />}
      </div>
    </div>
  );
};

export default Home;
