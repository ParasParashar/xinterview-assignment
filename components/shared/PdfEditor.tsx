"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

const PdfEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const newCanvas = new fabric.Canvas(canvasRef.current);
      setCanvas(newCanvas);
    }
  }, [canvasRef.current]);

  const addText = () => {
    const text = new fabric.IText("Add your text", {
      left: 100,
      top: 100,
      fill: "black",
    });
    canvas?.add(text);
  };

  const enableEraseMode = () => {
    if (canvas) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = "white";
      canvas.freeDrawingBrush.width = 20;
    }
  };

  const enableBlurMode = () => {
    // Implement a blur effect using a semi-transparent rectangle
    if (canvas) {
      const blurRect = new fabric.Rect({
        left: 150,
        top: 150,
        fill: "rgba(255, 255, 255, 0.5)",
        width: 100,
        height: 50,
      });
      canvas.add(blurRect);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border"
      ></canvas>
      <div className="flex space-x-4 mt-4">
        <button onClick={addText} className="p-2 bg-blue-500 text-white">
          Add Text
        </button>
        <button onClick={enableEraseMode} className="p-2 bg-red-500 text-white">
          Erase
        </button>
        <button
          onClick={enableBlurMode}
          className="p-2 bg-green-500 text-white"
        >
          Blur
        </button>
      </div>
    </div>
  );
};

export default PdfEditor;
