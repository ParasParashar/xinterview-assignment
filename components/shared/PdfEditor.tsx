"use client";
import { useState, useRef, useCallback } from "react";
import { degrees, PDFDocument } from "pdf-lib";
import { SpecialZoomLevel, Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button } from "../ui/button";
import { BiDownload, BiPlus } from "react-icons/bi";
import { FaArrowsRotate } from "react-icons/fa6";
import { hexToRgb } from "@/lib/helperFunction";

const PdfEditor = ({
  file,
  onUpdate,
}: {
  file: File;
  onUpdate: (updatedFile: Blob) => void;
}) => {
  const [editingMode, setEditingMode] = useState<"add" | null>(null);
  const [text, setText] = useState("");
  const [textAreas, setTextAreas] = useState<
    {
      x: number;
      y: number;
      text: string;
      isEditing: boolean;
      rotation: number;
      color: string;
      size: number;
    }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const handlePdfClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editingMode === "add" && viewerRef.current) {
        const rect = viewerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTextAreas([
          ...textAreas,
          {
            x,
            y,
            text,
            isEditing: true,
            rotation: 0,
            color: selectedColor,
            size: selectedSize,
          },
        ]);
        setText("");
        setEditingMode(null);
      }
    },
    [editingMode, text, textAreas, selectedColor, selectedSize]
  );

  const handleTextChange = (index: number, newText: string) => {
    const updatedTextAreas = textAreas
      .map((area, i) =>
        i === index
          ? { ...area, text: newText, color: selectedColor, size: selectedSize }
          : area
      )
      .filter((area) => area.text.trim() !== "");
    setTextAreas(updatedTextAreas);
  };

  const handleAddText = async () => {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get page width and height
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // Iterate over each text area and add text based on percentage coordinates
    textAreas.forEach(({ x, y, text, rotation, color, size }) => {
      const offSetWidth = viewerRef.current?.offsetWidth as number;
      const offSetHeight = viewerRef.current?.offsetHeight as number;
      const absoluteX = (x / offSetWidth) * pageWidth;
      const absoluteY = (y / offSetHeight) * pageHeight;

      // Add text to the PDF
      firstPage.drawText(text, {
        x: absoluteX,
        y: pageHeight - absoluteY, // In PDF-lib, y=0 is at the bottom, so invert the y-coordinate
        size,
        color: hexToRgb(color),
        rotate: degrees(rotation),
      });
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));

    // Set all text areas to non-editing mode after saving
    setTextAreas((prev) => prev.map((area) => ({ ...area, isEditing: false })));
    setEditingMode(null);
  };

  const handleRotateText = (index: number) => {
    setTextAreas((prev) =>
      prev.map((area, i) =>
        i === index ? { ...area, rotation: (area.rotation + 25) % 360 } : area
      )
    );
  };

  const handleEditing = (index: number) => {
    setEditingMode("add");
    setTextAreas((prev) =>
      prev.map((area, i) => (i === index ? { ...area, isEditing: true } : area))
    );
  };

  const handleDownloadPdf = async (e: React.FormEvent<SubmitEvent>) => {
    e.preventDefault();
    // Load the original PDF
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    textAreas.forEach(({ x, y, text, rotation, color, size }) => {
      firstPage.drawText(text, {
        x,
        y,
        size,
        color: hexToRgb(color),
        rotate: degrees(rotation),
      });
    });

    // Save the updated PDF and create a Blob
    const pdfBytes = await pdfDoc.save();
    const updatedPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(updatedPdfBlob);
    downloadLink.download = "updated_pdf.pdf";
    downloadLink.click();

    // Clean up the object URL
    URL.revokeObjectURL(downloadLink.href);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-4 md:gap-8 w-full h-full items-start p-4  bg-neutral-700/60 rounded-lg shadow-lg">
        {/* Top button section */}
        <div className="flex items-center gap-x-4 w-full justify-between">
          <Button
            className="bg-blue-600 text-white px-4 py-2 mr-2 flex items-center rounded-lg shadow hover:bg-blue-700 transition-colors"
            onClick={() => setEditingMode("add")}
          >
            <BiPlus size={20} className="mr-2" />
            Add Text
          </Button>

          {textAreas.length > 0 && textAreas.some((area) => area.isEditing) && (
            <Button
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors"
              onClick={handleAddText}
            >
              Apply Text Changes
            </Button>
          )}

          {textAreas.length > 0 &&
            textAreas.some((area) => area.text) &&
            textAreas.every((area) => !area.isEditing) &&
            editingMode === null && (
              <Button
                variant={"secondary"}
                onClick={handleDownloadPdf}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center shadow hover:bg-gray-300 transition-colors"
              >
                <BiDownload size={20} className="mr-2" />
                Download PDF
              </Button>
            )}
        </div>

        {/* Text addition controls */}
        {editingMode === "add" && (
          <div className="flex items-center justify-between w-full p-4 bg-gray-800/80 border-2 border-neutral-800 rounded-lg shadow-lg">
            <div className="flex flex-col space-y-2">
              <label htmlFor="color" className="text-sm font-semibold">
                Select Color
              </label>
              <input
                type="color"
                id="color"
                value={selectedColor}
                className="w-10 h-10 rounded-full border-2 border-neutral-400 cursor-pointer"
                onChange={(e) => setSelectedColor(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="size" className="text-sm font-semibold">
                Text Size
              </label>
              <select
                id="size"
                value={selectedSize}
                className="w-24 px-2 py-1 border border-neutral-300 rounded-lg shadow bg-white text-neutral-700 focus:outline-none"
                onChange={(e) => setSelectedSize(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => i * 3 + 10).map(
                  (size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}

        {/* Text placement guide */}
        {editingMode === "add" && (
          <div className="w-full text-xl md:text-2xl text-center text-gray-500 animate-pulse mt-4">
            Click on the PDF to place your text
          </div>
        )}
      </div>

      <div className="relative" ref={viewerRef} onClick={handlePdfClick}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <div className="h-screen ">
            <Viewer
              defaultScale={SpecialZoomLevel.PageFit}
              fileUrl={URL.createObjectURL(file)}
            />
          </div>
        </Worker>
        {/* Render text areas as input fields */}
        {textAreas.map((area, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${area.x}px`,
              top: `${area.y}px`,
              color: area.color,
              backgroundColor: "transparent",
              transform: `rotate(${area.rotation}deg)`,
              display: "flex",
              alignItems: "center",
              fontSize: `${area.size}px`, // Apply text size
            }}
          >
            {area.isEditing ? (
              <div className="relative w-full h-full hover:border group group-hover:border-black">
                <textarea
                  value={area.text}
                  autoFocus
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    color: area.color,
                    fontSize: `${area.size}px`,
                  }}
                  className="resize-none overflow-hidden border-transparent "
                />
                <Button
                  size="icon"
                  onClick={() => handleRotateText(index)}
                  className="rounded-full  hidden items-center justify-center absolute bottom-[-2]  size-8 left-1/2  group-hover:flex"
                >
                  <FaArrowsRotate size={14} />
                </Button>
              </div>
            ) : (
              <span onClick={() => handleEditing(index)}>{area.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfEditor;
