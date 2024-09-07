"use client";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
const PdfViewer = ({ fileUrl }: { fileUrl: string }) => (
  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
    <div className=" h-full  md:h-[500px]">
      <Viewer defaultScale={SpecialZoomLevel.PageFit} fileUrl={fileUrl} />
    </div>
  </Worker>
);

export default PdfViewer;
