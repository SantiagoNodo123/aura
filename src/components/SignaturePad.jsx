import { useRef, useEffect, useState } from "react";

export default function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize and resize canvas with high DPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      // Get displayed size of canvas
      const rect = canvas.getBoundingClientRect();
      
      // Support high DPI screens (retina)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale context to display coordinates
      ctx.scale(dpr, dpr);
      
      // Set line style
      ctx.strokeStyle = "#4C1D95"; // PD / Violeta Oscuro
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Refresh canvas background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
      setIsEmpty(true);
    };

    resizeCanvas();
    
    // Add window resize listener
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Touch event
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // Mouse event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Auto-save state
    saveSignature();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    
    // Export signature as base64 image
    const dataUrl = canvas.toDataURL("image/png");
    if (onSave) onSave(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Re-fill with white background
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    setIsEmpty(true);
    if (onClear) onClear();
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        position: "relative",
        width: "100%",
        height: 180,
        background: "#ffffff",
        border: "2px dashed #C4B5FD",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
        cursor: "crosshair",
        touchAction: "none" // Prevent scrolling while drawing
      }}>
        {isEmpty && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#A78BFA",
            fontSize: 12,
            pointerEvents: "none",
            userSelect: "none"
          }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>✍️</span>
            Firma aquí (con el dedo o el mouse)
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 6
      }}>
        <button
          type="button"
          onClick={clear}
          style={{
            background: "none",
            border: "none",
            color: "#6D6880",
            fontSize: 11,
            cursor: "pointer",
            padding: "4px 8px",
            textDecoration: "underline"
          }}
        >
          Borrar firma y reintentar
        </button>
      </div>
    </div>
  );
}
