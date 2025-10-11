"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Circle, Download, Edit3, Eraser, Square, Trash2, Type, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

type Point = {
  x: number
  y: number
}

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "line" | "text"

const colors = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFFFFF", // White
]

const ColorPicker = ({ onColorChange }: { onColorChange: (color: string) => void }) => {
  const [pickerColor, setPickerColor] = useState("#000000")

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setPickerColor(newColor)
    onColorChange(newColor)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={pickerColor}
        onChange={handleColorChange}
        className="h-8 w-8 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-transparent p-0"
        aria-label="Custom color picker"
      />
      <span className="text-xs font-medium">Custom</span>
    </div>
  )
}

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tempCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState([5])
  const [tool, setTool] = useState<Tool>("pen")
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [tempCtx, setTempCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const tempCanvas = tempCanvasRef.current
    if (!canvas || !tempCanvas) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        const width = container.clientWidth
        const height = 500

        canvas.width = width
        canvas.height = height
        tempCanvas.width = width
        tempCanvas.height = height

        // Restore context settings after resize
        const context = canvas.getContext("2d")
        const tempContext = tempCanvas.getContext("2d")

        if (context) {
          context.lineCap = "round"
          context.lineJoin = "round"
          context.strokeStyle = color
          context.lineWidth = brushSize[0]

          // Set white background
          context.fillStyle = "#ffffff"
          context.fillRect(0, 0, width, height)
        }

        if (tempContext) {
          tempContext.lineCap = "round"
          tempContext.lineJoin = "round"
          tempContext.strokeStyle = color
          tempContext.lineWidth = brushSize[0]
        }
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Get context
    const context = canvas.getContext("2d")
    const tempContext = tempCanvas.getContext("2d")

    if (context) {
      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = color
      context.lineWidth = brushSize[0]
      setCtx(context)

      // Set white background
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    if (tempContext) {
      tempContext.lineCap = "round"
      tempContext.lineJoin = "round"
      tempContext.strokeStyle = color
      tempContext.lineWidth = brushSize[0]
      setTempCtx(tempContext)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Update brush properties when they change
  useEffect(() => {
    if (!ctx || !tempCtx) return

    const currentColor = tool === "eraser" ? "#ffffff" : color

    ctx.strokeStyle = currentColor
    ctx.fillStyle = currentColor
    ctx.lineWidth = brushSize[0]

    tempCtx.strokeStyle = currentColor
    tempCtx.fillStyle = currentColor
    tempCtx.lineWidth = brushSize[0]
  }, [color, brushSize, tool, ctx, tempCtx])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(e)
    setStartPoint(point)
    setIsDrawing(true)

    if (!ctx || !tempCtx) return

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    } else if (tool === "text") {
      setTextPosition(point)
      setShowTextInput(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !tempCtx || !startPoint) return

    const currentPoint = getCoordinates(e)

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(currentPoint.x, currentPoint.y)
      ctx.stroke()
    } else if (["rectangle", "circle", "line"].includes(tool)) {
      // Clear the temporary canvas
      tempCtx.clearRect(0, 0, tempCanvasRef.current!.width, tempCanvasRef.current!.height)

      tempCtx.beginPath()

      if (tool === "rectangle") {
        const width = currentPoint.x - startPoint.x
        const height = currentPoint.y - startPoint.y
        tempCtx.rect(startPoint.x, startPoint.y, width, height)
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2),
        )
        tempCtx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
      } else if (tool === "line") {
        tempCtx.moveTo(startPoint.x, startPoint.y)
        tempCtx.lineTo(currentPoint.x, currentPoint.y)
      }

      tempCtx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || !ctx || !tempCtx || !canvasRef.current || !tempCanvasRef.current) {
      setIsDrawing(false)
      return
    }

    if (["rectangle", "circle", "line"].includes(tool)) {
      // Transfer the shape from temp canvas to main canvas
      ctx.drawImage(tempCanvasRef.current, 0, 0)
      // Clear the temporary canvas
      tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height)
    }

    setIsDrawing(false)
    if (tool === "pen" || tool === "eraser") {
      ctx.closePath()
    }
  }

  const addText = () => {
    if (!ctx || !textPosition || textInput.trim() === "") return

    ctx.font = "16px Arial"
    ctx.fillStyle = color
    ctx.fillText(textInput, textPosition.x, textPosition.y)

    setTextInput("")
    setShowTextInput(false)
    setTextPosition(null)
  }

  const floodFill = (x: number, y: number, fillColor: string) => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = ctx

    // Get the pixel data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Get the color at the clicked position
    const targetColor = getColorAtPixel(imageData, x, y)
    const fillColorRgb = hexToRgb(fillColor)

    // Don't fill if the target color is the same as the fill color
    if (
      targetColor[0] === fillColorRgb[0] &&
      targetColor[1] === fillColorRgb[1] &&
      targetColor[2] === fillColorRgb[2]
    ) {
      return
    }

    // Queue for flood fill algorithm
    const queue: [number, number][] = [[x, y]]
    const width = canvas.width
    const height = canvas.height

    while (queue.length > 0) {
      const [currentX, currentY] = queue.shift()!
      const currentPos = (currentY * width + currentX) * 4

      // Check if this pixel has the target color
      if (
        data[currentPos] === targetColor[0] &&
        data[currentPos + 1] === targetColor[1] &&
        data[currentPos + 2] === targetColor[2]
      ) {
        // Set the color
        data[currentPos] = fillColorRgb[0]
        data[currentPos + 1] = fillColorRgb[1]
        data[currentPos + 2] = fillColorRgb[2]

        // Add adjacent pixels to the queue
        if (currentX > 0) queue.push([currentX - 1, currentY])
        if (currentX < width - 1) queue.push([currentX + 1, currentY])
        if (currentY > 0) queue.push([currentX, currentY - 1])
        if (currentY < height - 1) queue.push([currentX, currentY + 1])
      }
    }

    // Put the modified image data back
    context.putImageData(imageData, 0, 0)
  }

  const getColorAtPixel = (imageData: ImageData, x: number, y: number): [number, number, number] => {
    const { width, data } = imageData
    const pos = (y * width + x) * 4
    return [data[pos], data[pos + 1], data[pos + 2]]
  }

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const saveDrawing = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "drawing.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-lg border bg-card p-4 shadow-sm">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair rounded-md border border-gray-300 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <canvas
          ref={tempCanvasRef}
          className="absolute left-4 top-4 cursor-crosshair rounded-md touch-none"
          style={{ pointerEvents: "none" }}
        />

        {showTextInput && (
          <div
            className="absolute rounded-md border bg-white p-2 shadow-md"
            style={{
              left: textPosition?.x || 0,
              top: (textPosition?.y || 0) + 30,
            }}
          >
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Enter text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-48"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTextInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={addText}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "pen" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("pen")}
                  aria-label="Pen"
                >
                  <Edit3 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("eraser")}
                  aria-label="Eraser"
                >
                  <Eraser className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "line" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("line")}
                  aria-label="Line"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Line</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("rectangle")}
                  aria-label="Rectangle"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rectangle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "circle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("circle")}
                  aria-label="Circle"
                >
                  <Circle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Circle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "text" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("text")}
                  aria-label="Text"
                >
                  <Type className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`h-8 w-8 rounded-full border-2 ${
                color === c && tool !== "eraser" ? "border-black dark:border-white" : "border-gray-300"
              }`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c)
                if (tool === "eraser") setTool("pen")
              }}
              aria-label={`Select ${c} color`}
            />
          ))}
          <ColorPicker
            onColorChange={(newColor) => {
              setColor(newColor)
              if (tool === "eraser") setTool("pen")
            }}
          />
        </div>

        <div className="flex flex-1 items-center gap-2">
          <span className="text-sm font-medium">Size:</span>
          <Slider value={brushSize} min={1} max={30} step={1} onValueChange={setBrushSize} className="w-24 md:w-40" />
          <span className="text-sm">{brushSize[0]}px</span>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={clearCanvas} aria-label="Clear canvas">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={saveDrawing} aria-label="Save drawing">
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save drawing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
