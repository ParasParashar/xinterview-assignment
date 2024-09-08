"use client";
import Header from "@/components/shared/Header";
import PdfEditor from "@/components/shared/PdfEditor";
import PdfUploader from "@/components/shared/PdfUploader";
import { useState } from "react";

const Home = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileUpload = (file: File) => {
    setPdfFile(file);
    const fileUrl = URL.createObjectURL(file);
  };

  const handlePdfUpdate = (updatedFile: Blob) => {
    const updatedUrl = URL.createObjectURL(updatedFile);
  };
  return (
    <div className=" lg:p-6 xl:p-10 p-2  ">
      <Header />
      <div className="min-h-screen bg-neutral-800/60 rounded-lg p-2 flex flex-col gap-2  ">
        <PdfUploader onFileUpload={handleFileUpload} />
        {pdfFile && <PdfEditor file={pdfFile} onUpdate={handlePdfUpdate} />}
      </div>
    </div>
  );
};

export default Home;
