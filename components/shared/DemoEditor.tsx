"use client";

import { PDFDocument, rgb } from "pdf-lib";
import { useState } from "react";
import { Button } from "../ui/button";
import { BiPlus } from "react-icons/bi";

const PdfEditor = ({
  file,
  onUpdate,
}: {
  file: File;
  onUpdate: (updatedFile: Blob) => void;
}) => {
  const [editingMode, setEditingMode] = useState<
    "blur" | "erase" | "add" | null
  >(null);
  const [text, setText] = useState("");
  const [coordinates, setCoordinates] = useState({ x: 50, y: 500 }); // Default coordinates

  // Load the PDF document from the uploaded file
  const loadPdf = async () => {
    const arrayBuffer = await file.arrayBuffer();
    return await PDFDocument.load(arrayBuffer);
  };

  // Handle Add Text feature
  const handleAddText = async () => {
    const pdfDoc = await loadPdf();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text at the specified coordinates
    firstPage.drawText(text, {
      x: coordinates.x,
      y: coordinates.y,
      size: 24,
      color: rgb(0, 0, 0), // Black color
    });

    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));
  };

  // Handle Blur Text feature (by overlaying a semi-transparent rectangle)
  const handleBlurText = async () => {
    const pdfDoc = await loadPdf();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Create a semi-transparent rectangle (blur effect) over the specified area
    firstPage.drawRectangle({
      x: coordinates.x,
      y: coordinates.y - 20, // Adjusting for text height
      width: 200,
      height: 30,
      color: rgb(0.5, 0.5, 0.5), // Gray rectangle
      opacity: 0.5, // Semi-transparent
    });

    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));
  };

  // Handle Erase Text feature (by overlaying a white rectangle to "erase" the text)
  const handleEraseText = async () => {
    const pdfDoc = await loadPdf();
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Draw a white rectangle over the specified area to "erase" text
    firstPage.drawRectangle({
      x: coordinates.x,
      y: coordinates.y - 20, // Adjusting for text height
      width: 200,
      height: 30,
      color: rgb(1, 1, 1), // White rectangle (effectively erasing content)
    });

    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));
  };

  // Handle input changes for text
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  // Handle changes in coordinates (for demo purposes; could be set dynamically through UI)
  const handleCoordinateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    axis: "x" | "y"
  ) => {
    setCoordinates((prev) => ({ ...prev, [axis]: Number(event.target.value) }));
  };

  return (
    <div className="p-4">
      <div className=" flex items-start gap-x-3  bg-muted-foreground p-3">
        <Button
          className="bg-blue-500 text-white px-4 py-2 mr-2"
          onClick={() => setEditingMode("add")}
        >
          <BiPlus size={20} />
          Add Text
        </Button>
        <Button
          className="bg-yellow-500 text-white px-4 py-2 mr-2"
          onClick={() => setEditingMode("blur")}
        >
          Blur Text
        </Button>
        <Button
          className="bg-red-500 text-white px-4 py-2"
          onClick={() => setEditingMode("erase")}
        >
          Erase Text
        </Button>
      </div>

      {editingMode === "add" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter text to add"
            value={text}
            onChange={handleTextChange}
            className="border p-2 mb-2"
          />
          <div>
            <label>
              X:
              <input
                type="number"
                value={coordinates.x}
                onChange={(e) => handleCoordinateChange(e, "x")}
                className="border bgbl p-1 mx-2"
              />
            </label>
            <label>
              Y:
              <input
                type="number"
                value={coordinates.y}
                onChange={(e) => handleCoordinateChange(e, "y")}
                className="border bg-black p-1 mx-2"
              />
            </label>
          </div>
          <button
            className="bg-green-500 text-white px-4 py-2 mt-2"
            onClick={handleAddText}
          >
            Apply Text
          </button>
        </div>
      )}

      {editingMode === "blur" && (
        <div className="mb-4">
          <label>
            X:
            <input
              type="number"
              value={coordinates.x}
              onChange={(e) => handleCoordinateChange(e, "x")}
              className="border  bg-black p-1 mx-2"
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              value={coordinates.y}
              onChange={(e) => handleCoordinateChange(e, "y")}
              className="border bg-black p-1 mx-2"
            />
          </label>
          <button
            className="bg-green-500 text-white px-4 py-2 mt-2"
            onClick={handleBlurText}
          >
            Apply Blur
          </button>
        </div>
      )}

      {editingMode === "erase" && (
        <div className="mb-4">
          <label>
            X:
            <input
              type="text"
              value={coordinates.x}
              onChange={(e) => handleCoordinateChange(e, "x")}
              className="border p-1 mx-2 bg-black"
            />
          </label>
          <label>
            Y:
            <input
              type="text"
              value={coordinates.y}
              onChange={(e) => handleCoordinateChange(e, "y")}
              className="border p-1 mx-2 bg-black"
            />
          </label>
          <button
            className="bg-green-500 text-white px-4 py-2 mt-2"
            onClick={handleEraseText}
          >
            Apply Erase
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfEditor;
