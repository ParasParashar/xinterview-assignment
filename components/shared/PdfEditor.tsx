"use client";
import { useState, useRef, useCallback } from "react";
import { degrees, PDFDocument, rgb } from "pdf-lib";
import { SpecialZoomLevel, Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button } from "../ui/button";
import { BiPlus } from "react-icons/bi";
import { FaArrowsRotate } from "react-icons/fa6";

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
      color: string; // Color in RGB format
      size: number;
    }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string>("#000000"); // Default black
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  // Convert hex color string to RGB format
  const hexToRgb = (hex: string) => {
    let r: number = 0,
      g: number = 0,
      b: number = 0;
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return rgb(r / 255, g / 255, b / 255);
  };

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
          }, // Apply selected color and size
        ]);
        setText(""); // Clear the input field after adding
        setEditingMode(null); // Exit editing mode
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

    textAreas.forEach(({ x, y, text, rotation, color, size }) => {
      firstPage.drawText(text, {
        x,
        y,
        size,
        color: hexToRgb(color),
        rotate: degrees(rotation),
      });
    });

    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));
    // Set all text areas to non-editing mode after saving
    setTextAreas((prev) => prev.map((area) => ({ ...area, isEditing: false })));
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

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-x-3 bg-muted-foreground p-3">
        <div>
          <Button
            className="bg-blue-500 text-white px-4 py-2 mr-2 flex items-center"
            onClick={() => setEditingMode("add")}
          >
            <BiPlus size={20} />
            Add Text
          </Button>
          {textAreas.length > 0 && (
            <Button
              className="bg-green-500 text-white px-4 py-2 mt-2"
              onClick={handleAddText}
            >
              Apply Text Changes
            </Button>
          )}
        </div>
        {editingMode === "add" && (
          <div className="flex gap-x-2">
            <div>
              <label htmlFor="color">Select color</label>
              <input
                type="color"
                id="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="size">Select text size</label>
              <select
                id="size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
                <option value={32}>32</option>
                {/* Add more size options as needed */}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={viewerRef} onClick={handlePdfClick}>
        <div className="h-screen">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div className="h-screen md:h-[500px]">
              <Viewer
                defaultScale={SpecialZoomLevel.PageFit}
                fileUrl={URL.createObjectURL(file)}
              />
            </div>
          </Worker>
        </div>
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
              <div className="relative w-full h-full p-3 hover:border group group-hover:border-black">
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
                  className="resize-none overflow-hidden border-transparent group-hover:resize"
                />
                <Button
                  size="icon"
                  onClick={() => handleRotateText(index)}
                  className="rounded-full absolute bottom-0 left-0 hidden group-hover:block"
                >
                  <FaArrowsRotate />
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
