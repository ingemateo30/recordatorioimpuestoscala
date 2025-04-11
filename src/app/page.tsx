"use client";
import { useState, useRef } from "react";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileIcon, 
  AlertCircle, 
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  Shield
} from "lucide-react";

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
        setStatusMessage(data.message || "Archivo subido y procesado correctamente");
        if (data.errores?.length || data.duplicados?.length) {
          setResultDetails({
            importados: data.results?.length || 0,
            errores: data.errores || [],
            duplicados: data.duplicados || []
          });
        }
      } else {
        setStatusMessage(data.error || "Error al procesar el archivo, no se subió al sistema");
      }

      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setStatusMessage("Error de conexión al servidor y la base de datos");
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
      const url = testMode ? "/api/cron?test=true" : "/api/cron";
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setStatus("success");

      setResultDetails(data.resultados);

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
      return <FileSpreadsheet className="w-12 h-12 text-emerald-600" />;
    }

    return <FileIcon className="w-12 h-12 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sistema de Recordatorios</h1>
              <p className="mt-1 opacity-90">Cala asociados SAS</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <span className="px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-200">
              <div className="flex items-center">
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Formato unico soportado: Excel (.xlsx)
              </div>
            </span>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <span className="text-sm text-gray-700">Modo prueba</span>
              <button
                onClick={() => setTestMode(!testMode)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${testMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-sm ${testMode ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-2xl transition-all ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } ${status === "success" ? "border-emerald-500 bg-emerald-50" : ""} 
            ${status === "error" ? "border-red-500 bg-red-50" : ""}
            hover:border-blue-400 hover:bg-blue-50`}
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
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
              {!file ? (
                <>
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 shadow-inner">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-lg">Arrastra tu archivo Excel aquí</p>
                    <p className="text-gray-500 text-sm mb-3">o</p>
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      Seleccionar archivo
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4 w-full bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
                  {getFileTypeIcon()}
                  <div className="flex-1 truncate">
                    <p className="font-medium text-gray-900 truncate text-lg">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`py-4 px-6 rounded-xl font-medium text-white transition-all transform focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 ${
                !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
              } ${loading ? "animate-pulse" : ""}`}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span className="text-lg">{loading ? "Procesando..." : "Subir Archivo"}</span>
              </div>
            </button>
            
            <button
              onClick={ejecutarCron}
              className={`py-4 px-6 rounded-xl font-medium text-white transition-all transform focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50 ${
                loading ? "bg-emerald-500 animate-pulse" : "bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl"
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                <span className="text-lg">
                  {loading ? "Ejecutando..." : `Ejecutar Recordatorios ${testMode ? "(Prueba)" : ""}`}
                </span>
              </div>
            </button>
          </div>

          {status === "success" && statusMessage && !resultDetails && (
            <div className="flex items-center space-x-3 text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 mt-6 shadow-sm">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}
          
          {status === "error" && statusMessage && (
            <div className="flex items-center space-x-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 mt-6 shadow-sm">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}

          {status === "success" && resultDetails && (
            <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                Resumen de operación
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Total impuestos:</span>
                    <span className="text-lg font-bold text-blue-900">{resultDetails.total}</span>
                  </div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-medium">Notificaciones:</span>
                    <span className="text-lg font-bold text-emerald-900">{resultDetails.enviados}</span>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-800 font-medium">Email:</span>
                    <span className="text-lg font-bold text-indigo-900">{resultDetails.notificaciones?.email || 0}</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-800 font-medium">WhatsApp:</span>
                    <span className="text-lg font-bold text-purple-900">{resultDetails.notificaciones?.whatsapp || 0}</span>
                  </div>
                </div>
                
                {resultDetails.errores > 0 && (
                  <div className="col-span-2 bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-red-800 font-medium">Errores:</span>
                      <span className="text-lg font-bold text-red-900">{resultDetails.errores}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
              Sistema de recordatorios cala asociados • v1.2.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
