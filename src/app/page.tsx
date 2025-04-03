"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return setStatus("error");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(res.ok ? "success" : "error");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarCron = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert("Error al ejecutar el cron");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setStatus("idle");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg transform transition-all hover:shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Subir Archivo de Impuestos</h1>
          <p className="mt-2 text-gray-500">Formato soportado: Excel (.xlsx)</p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } ${status === "success" ? "border-green-500 bg-green-50" : ""} ${
            status === "error" ? "border-red-500 bg-red-50" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file" 
            onChange={handleFileChange}
            className="hidden"
            accept=".xlsx,.xls"
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            {!file ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <div className="text-center">
                  <p className="text-gray-600">Arrastra tu archivo aquí o</p>
                  <button 
                    type="button"
                    onClick={handleButtonClick}
                    className="mt-2 text-blue-500 hover:text-blue-700 font-medium"
                  >
                    selecciona un archivo
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 w-full">
                <Upload className="w-8 h-8 text-blue-500" />
                <div className="flex-1 truncate">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } ${loading ? "animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>{loading ? "Subiendo..." : "Subir Archivo"}</span>
            </div>
          </button>

          {status === "success" && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
              <CheckCircle className="w-5 h-5" />
              <span>¡Archivo subido correctamente!</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
              <XCircle className="w-5 h-5" />
              <span>Error al subir el archivo. Inténtalo de nuevo.</span>
            </div>
          )}

          {/* Botón para ejecutar el cron manualmente */}
          <button
            onClick={ejecutarCron}
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Clock className="w-5 h-5" />
              )}
              <span>{loading ? "Ejecutando..." : "Ejecutar Recordatorios"}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
