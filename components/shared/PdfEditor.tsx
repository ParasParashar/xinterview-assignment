"use client";
import { useState, useRef, useCallback } from "react";
import { degrees, PDFDocument, rgb } from "pdf-lib";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button } from "../ui/button";
import { BiDownload, BiPlus } from "react-icons/bi";
import { FaArrowsRotate, FaEraser } from "react-icons/fa6";
import { hexToRgb, simulateBlurColor } from "@/lib/helperFunction";
import PdfViewer from "./PdfViewer";
import { RxCross2 } from "react-icons/rx";
import { MdBlurOn } from "react-icons/md";

const PdfEditor = ({
  file,
  onUpdate,
}: {
  file: File;
  onUpdate: (updatedFile: Blob) => void;
}) => {
  const [editingMode, setEditingMode] = useState<
    "add" | "erase" | "blur" | null
  >(null);
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
  const [eraseAreas, setEraseAreas] = useState<
    {
      x: number;
      y: number;
      width: number;
      height: number;
      isEditing: boolean;
      type: "erase" | "blur";
    }[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const [eraseSize, setEraseSize] = useState({ width: 200, height: 30 });
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const handlePdfClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (editingMode && viewerRef.current) {
        const rect = viewerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (editingMode === "add") {
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
        } else if (editingMode === "blur") {
          setEraseAreas([
            ...eraseAreas,
            {
              x,
              y,
              width: eraseSize.width,
              height: eraseSize.height,
              type: "blur",
              isEditing: true,
            },
          ]);
        } else if (editingMode === "erase") {
          setEraseAreas([
            ...eraseAreas,
            {
              x,
              y,
              width: eraseSize.width,
              height: eraseSize.height,
              type: "erase",
              isEditing: true,
            },
          ]);
        }

        setEditingMode(null);
      }
    },
    [
      editingMode,
      text,
      textAreas,
      eraseAreas,
      selectedColor,
      selectedSize,
      eraseSize,
    ]
  );

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    newText: string
  ) => {
    e.preventDefault();
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
        y: pageHeight - absoluteY,
        size: selectedSize,
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

  const handleRotateText = (
    e: React.ChangeEvent<HTMLDivElement>,
    index: number
  ) => {
    e.stopPropagation();
    setTextAreas((prev) =>
      prev.map((area, i) =>
        i === index ? { ...area, rotation: (area.rotation + 25) % 360 } : area
      )
    );
  };

  const handleEditing = (
    e: React.ChangeEvent<HTMLDivElement>,
    index: number
  ) => {
    e.stopPropagation();
    setEditingMode("add");
    setTextAreas((prev) =>
      prev.map((area, i) => (i === index ? { ...area, isEditing: true } : area))
    );
  };

  const handleEraseOrBlurText = async () => {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get page dimensions
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // Iterate over each erase area and erase content by drawing a white rectangle
    eraseAreas.forEach(({ x, y, width, height }) => {
      const offSetWidth = viewerRef.current?.offsetWidth as number;
      const offSetHeight = viewerRef.current?.offsetHeight as number;
      const absoluteX = (x / offSetWidth) * pageWidth;
      const absoluteY = (y / offSetHeight) * pageHeight;

      firstPage.drawRectangle({
        x: absoluteX,
        y: pageHeight - absoluteY - height, // Adjust y for rectangle height
        width: (width / offSetWidth) * pageWidth,
        height: (height / offSetHeight) * pageHeight,
        color: rgb(1, 1, 1), // White to "erase" content
      });
    });

    const pdfBytes = await pdfDoc.save();
    onUpdate(new Blob([pdfBytes], { type: "application/pdf" }));
    setEraseAreas((prev) =>
      prev.map((item) => ({ ...item, isEditing: false }))
    );
    setEditingMode(null);
  };

  const handleEraseOrBlurDelete = (
    e: React.ChangeEvent<HTMLDivElement>,
    index: number
  ) => {
    e.stopPropagation();
    const updateEraseList = eraseAreas.filter((item, i) => i !== index);
    setEraseAreas(updateEraseList);
    setEraseAreas((prev) =>
      prev.map((item) => ({ ...item, isEditing: false }))
    );
    setEditingMode(null);
  };
  const handleTextAreaDelete = (
    e: React.ChangeEvent<HTMLDivElement>,
    index: number
  ) => {
    e.stopPropagation();
    const updateEraseList = textAreas.filter((item, i) => i !== index);
    setTextAreas(updateEraseList);
    setTextAreas((prev) => prev.map((item) => ({ ...item, isEditing: false })));
    setEditingMode(null);
  };
  const handleEditEnable = (
    e: React.ChangeEvent<HTMLDivElement>,
    type: "erase" | "blur",
    index: number
  ) => {
    e.stopPropagation();
    setEditingMode(type);
    setEraseAreas((prev) =>
      prev.map((area, i) => (i === index ? { ...area, isEditing: true } : area))
    );
  };

  // function to download the pdf
  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Get page dimensions for coordinate conversion
      const pageWidth = firstPage.getWidth();
      const pageHeight = firstPage.getHeight();

      // Apply text areas to the PDF
      textAreas.forEach(({ x, y, text, rotation, color, size }) => {
        const offSetWidth = viewerRef.current?.offsetWidth as number;
        const offSetHeight = viewerRef.current?.offsetHeight as number;
        const absoluteX = (x / offSetWidth) * pageWidth;
        const absoluteY = (y / offSetHeight) * pageHeight;

        firstPage.drawText(text, {
          x: absoluteX,
          y: pageHeight - absoluteY,
          size: size,
          color: hexToRgb(color),
          rotate: degrees(rotation),
        });
      });

      // Apply erase or blur areas to the PDF
      eraseAreas.forEach(({ x, y, width, height, type }) => {
        const offSetWidth = viewerRef.current?.offsetWidth as number;
        const offSetHeight = viewerRef.current?.offsetHeight as number;
        const absoluteX = (x / offSetWidth) * pageWidth;
        const absoluteY = (y / offSetHeight) * pageHeight;
        const rectWidth = (width / offSetWidth) * pageWidth;
        const rectHeight = (height / offSetHeight) * pageHeight;

        const blurColor = simulateBlurColor("#ffffff", 0.8);
        const normalColor = hexToRgb("#ffffff");

        // Draw white rectangles for erasing or semi-transparent ones for blurring
        firstPage.drawRectangle({
          x: absoluteX,
          y: pageHeight - absoluteY - rectHeight,
          width: rectWidth,
          height: rectHeight,
          color: type === "blur" ? blurColor : normalColor, // Set blur color conditionally
        });
      });

      // Save the updated PDF
      const pdfBytes = await pdfDoc.save();
      const updatedPdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      // Trigger the file download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(updatedPdfBlob);
      downloadLink.download = "edited_pdf.pdf";
      downloadLink.click();

      // Clean up the object URL
      URL.revokeObjectURL(downloadLink.href);
    } catch (err: any) {
      console.log("Error in downloading the pdf: " + err.message);
    }
  };
  console.log(textAreas, eraseAreas);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-4 md:gap-8 w-full h-full items-start p-4  bg-neutral-700/60 rounded-lg shadow-lg">
        {/* Top button section */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 items-center gap-x-4 w-full justify-between">
          <Button
            className="bg-blue-600 text-white px-4 py-2 mr-2 flex items-center rounded-lg shadow hover:bg-blue-700 transition-colors"
            onClick={() => setEditingMode("add")}
          >
            <BiPlus size={20} className="mr-2" />
            Add Text
          </Button>

          <Button
            variant={"secondary"}
            className="bg-green-600 text-white px-4 py-2 mr-2 flex items-center rounded-lg transition-colors"
            onClick={() => setEditingMode("erase")}
          >
            <FaEraser size={20} />
            Erase Area
          </Button>
          <Button
            className="bg-red-600 text-white px-4 py-2 mr-2 flex items-center rounded-lg shadow hover:bg-red-700 transition-colors"
            onClick={() => setEditingMode("blur")}
          >
            <MdBlurOn size={20} />
            Blur Area
          </Button>

          {textAreas.length > 0 && textAreas.some((area) => area.isEditing) && (
            <Button
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors"
              onClick={handleAddText}
            >
              Apply Text Changes
            </Button>
          )}
          {eraseAreas.length > 0 &&
            eraseAreas.some((area) => area.isEditing) && (
              <Button
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors"
                onClick={handleEraseOrBlurText}
              >
                Apply {editingMode}
              </Button>
            )}

          {[...textAreas, ...eraseAreas].length > 0 &&
            [...textAreas, ...eraseAreas].every((area) => !area.isEditing) &&
            editingMode === null && (
              <Button
                variant={"secondary"}
                className=" px-4 py-2 rounded-lg flex items-center hover:bg-gray-300 transition-colors shadow"
                onClick={(e) => handleDownloadPdf(e)}
              >
                <BiDownload size={20} className="mr-2" />
                Download PDF
              </Button>
            )}
        </div>

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

        {/* Erase Size Picker */}
        {editingMode !== "add" && editingMode !== null && (
          <div className="flex flex-col gap-y-2 w-full">
            <label htmlFor="eraseSizePicker" className="text-gray-200">
              Set {editingMode.charAt(0).toUpperCase() + editingMode.slice(1)}
              &nbsp;Area Size (width x height):
            </label>
            <div className="flex items-center justify-start gap-x-3">
              <input
                type="text"
                id="eraseWidthPicker"
                placeholder="Width"
                value={eraseSize.width}
                onChange={(e) =>
                  setEraseSize((prev) => ({
                    ...prev,
                    width: parseInt(e.target.value),
                  }))
                }
                className="h-10 w-28 bg-black rounded-md shadow"
              />
              <input
                type="text"
                id="eraseHeightPicker"
                placeholder="Height"
                value={eraseSize.height}
                onChange={(e) =>
                  setEraseSize((prev) => ({
                    ...prev,
                    height: parseInt(e.target.value),
                  }))
                }
                className="h-10 w-28 bg-black rounded-md shadow"
              />
            </div>
          </div>
        )}
        <div className="text-center w-full flex flex-col justify-center items-center h-full  transition-all duration-300 ease-in md:p-3 ">
          <p className="text-xl md:text-3xl animate-pulse  w-full text-muted ">
            Select on a pdf to apply the change
          </p>
          <p className="text-md md:text-2xl  w-full animate-pulse text-muted-foreground  ">
            You can also delete or update the changes, what you made Just select
            a change on a PDF
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="relative border border-gray-300 rounded-lg overflow-hidden h-[90vh]"
        ref={viewerRef}
        onClick={handlePdfClick}
      >
        <PdfViewer fileUrl={file} />

        {/* Text input fields rendered dynamically */}
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
              fontSize: `${area.size}px`,
              zIndex: 2,
            }}
          >
            {area.isEditing ? (
              <div className="relative w-full h-full hover:border group group-hover:border-black">
                <textarea
                  value={area.text}
                  autoFocus
                  onChange={(e) => handleTextChange(e, index, e.target.value)}
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
                  onClick={(e) => handleRotateText(e, index)}
                  className="rounded-full  hidden items-center justify-center absolute bottom-[-2]  size-8 left-1/2  group-hover:flex"
                >
                  <FaArrowsRotate size={14} />
                </Button>
                <Button
                  onClick={(e) => handleTextAreaDelete(e, index)}
                  size={"icon"}
                  variant={"secondary"}
                  className="rounded-full size-6 absolute top-0 right-0"
                >
                  <RxCross2 size={14} />
                </Button>
              </div>
            ) : (
              <span onClick={(e) => handleEditing(e, index)}>{area.text}</span>
            )}
          </div>
        ))}

        {/* Erase or Blur area dynamically  */}
        {eraseAreas.map((area, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${area.x}px`,
              top: `${area.y}px`,
              width: area.width,
              height: area.height,
              borderRadius: "10px",
              zIndex: area.type === "blur" ? "1" : "1.9",
            }}
            className="p-1  "
          >
            {area.isEditing === true ? (
              <div className="relative z-30">
                <div
                  style={{
                    backgroundColor:
                      area.type === "blur" ? "#ffffff99" : "#ffffff",
                    color: "gray",
                    height: area.height,
                    width: area.width,
                    border: "1px solid rgb(47, 45, 45)",
                    textAlign: "center",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Apply {area.type}
                </div>
                <Button
                  onClick={(e) => handleEraseOrBlurDelete(e, index)}
                  size={"icon"}
                  className="rounded-full size-6 absolute top-0 right-0"
                >
                  <RxCross2 size={14} />
                </Button>
              </div>
            ) : (
              <div
                style={{
                  minHeight: "20px",
                  color: "black",
                  zIndex: 2,
                  backgroundColor:
                    area.type === "blur"
                      ? "rgba(255, 255, 255, 0.6)"
                      : "#ffffff",
                  height: area.height,
                  width: area.width,
                  borderRadius: "10px",
                }}
                onClick={(e) => handleEditEnable(e, area.type, index)}
                className="hover:bg-blue-50"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfEditor;
