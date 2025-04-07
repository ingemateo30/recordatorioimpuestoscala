"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, Clock, FileIcon, AlertCircle } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragActive, setDragActive] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultDetails, setResultDetails] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return setStatus("error");
    
    setLoading(true);
    setStatusMessage("");
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(res.ok ? "success" : "error");
      
      if (res.ok) {
        setStatusMessage(data.message || "Archivo procesado correctamente");
        
        // Si hay detalles de errores o duplicados, mostrarlos
        if (data.errores?.length || data.duplicados?.length) {
          setResultDetails({
            importados: data.results?.length || 0,
            errores: data.errores || [],
            duplicados: data.duplicados || []
          });
        }
      } else {
        setStatusMessage(data.error || "Error al procesar el archivo");
      }
      
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Error de conexión al servidor");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarCron = async () => {
    setLoading(true);
    setStatusMessage("");
    setResultDetails(null);
    
    try {
      // Usar el modo de prueba si está activado
      const url = testMode ? "/api/cron?test=true" : "/api/cron";
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      
      const data = await res.json();
      setStatus("success");
      
      // Guardamos los detalles completos del resultado
      setResultDetails(data.resultados);
      
      // Crear un mensaje informativo
      const mensaje = `
        ${data.mensaje}
        • Total impuestos: ${data.resultados.total}
        • Notificaciones enviadas: ${data.resultados.enviados}
        • Emails: ${data.resultados.notificaciones.email}
        • WhatsApp: ${data.resultados.notificaciones.whatsapp}
      `.trim();
      
      setStatusMessage(mensaje);
      
    } catch (error) {
      console.error("Error al ejecutar el cron:", error);
      setStatus("error");
      setStatusMessage("Error al ejecutar los recordatorios");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setStatus("idle");
    setStatusMessage("");
    setResultDetails(null);
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
      setStatus("idle");
      setStatusMessage("");
      setResultDetails(null);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileTypeIcon = () => {
    if (!file) return null;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'xlsx' || extension === 'xls') {
      return <FileIcon className="w-10 h-10 text-green-600" />;
    }
    
    return <FileIcon className="w-10 h-10 text-blue-600" />;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl transform transition-all">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Impuestos</h1>
          <p className="mt-3 text-gray-500">Gestiona tus impuestos y recibe recordatorios automáticos</p>
          <div className="flex justify-center mt-4">
            <span className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">Formato soportado: Excel (.xlsx)</span>
          </div>
        </div>
        <div 
          className={`relative border-3 border-dashed rounded-xl p-8 transition-all ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } ${status === "success" ? "border-green-500 bg-green-50" : ""} ${
            status === "error" ? "border-red-500 bg-red-50" : ""
          } hover:border-blue-400 hover:bg-blue-50`}
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
          <div className="flex flex-col items-center justify-center space-y-4">
            {!file ? (
              <>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-lg">Arrastra tu archivo aquí o</p>
                  <button 
                    type="button"
                    onClick={handleButtonClick}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    selecciona un archivo
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 w-full bg-gray-50 p-4 rounded-lg">
                {getFileTypeIcon()}
                <div className="flex-1 truncate">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFile(null)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all transform hover:translate-y-px focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 ${
              !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            } ${loading ? "animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span className="text-lg">{loading ? "Subiendo..." : "Subir Archivo"}</span>
            </div>
          </button>

          {/* Mensajes de estado para carga de archivo */}
          {status === "success" && statusMessage && !resultDetails && (
            <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}
          {status === "error" && statusMessage && (
            <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <XCircle className="w-6 h-6" />
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}
          <div className="flex items-center justify-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-700">Modo de prueba</span>
            <button 
              onClick={() => setTestMode(!testMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${testMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${testMode ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
          <div className="pt-2">
            <button
              onClick={ejecutarCron}
              className="w-full py-4 px-6 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-all transform shadow-lg hover:translate-y-px focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                <span className="text-lg">
                  {loading ? "Ejecutando..." : `Ejecutar Recordatorios ${testMode ? "(Prueba)" : ""}`}
                </span>
              </div>
            </button>
          </div>
          {status === "success" && resultDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Resultados:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black">Total impuestos:</span>
                  <span className="font-medium">{resultDetails.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Notificaciones enviadas:</span>
                  <span className="font-medium">{resultDetails.enviados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Email:</span>
                  <span className="font-medium">{resultDetails.notificaciones?.email || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">WhatsApp:</span>
                  <span className="font-medium">{resultDetails.notificaciones?.whatsapp || 0}</span>
                </div>
                {resultDetails.errores > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Errores:</span>
                    <span className="font-medium">{resultDetails.errores}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500 pt-2">
            Sistema de administración tributaria • v1.2.0
          </div>
        </div>
      </div>
    </div>
  );
}
