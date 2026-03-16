import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";

import { API_URL } from "../config"; 
import api from '../api/axios'; 

const theme = {
  primary: "bg-[#1B3A57]",
  primaryText: "text-[#1B3A57]",
  accent: "bg-[#C62828]",
  bgLight: "bg-[#FDFBF7]",
};

const FilesManager = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categorias, setCategorias] = useState([]); 

  const [uploadState, setUploadState] = useState({
    file: null,
    title: "",
    category: "",
    error: null,
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('tipos-archivo/'); 
      setCategorias(response.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('archivos/');
      setFiles(response.data);
    } catch (error) {
      console.error("Error cargando archivos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setUploadState((prev) => ({
        ...prev,
        error: "Solo se permiten archivos PDF.",
      }));
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadState((prev) => ({
        ...prev,
        error: "El archivo es demasiado pesado (Máx 5MB).",
      }));
      return;
    }

    setUploadState({
      file: selectedFile,
      title: selectedFile.name.replace(".pdf", ""),
      category: "",
      error: null,
    });
  };

  const handleCancelUpload = () => {
    setUploadState({ file: null, title: "", category: "", error: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async (e) => {
    e.preventDefault();

    if (!uploadState.title || !uploadState.category) {
      setUploadState((prev) => ({
        ...prev,
        error: "Por favor complete el título y la categoría.",
      }));
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("titulo", uploadState.title);
    formData.append("tipo_archivo", uploadState.category); 
    formData.append("archivo_pdf", uploadState.file); 

    try {
      await api.post('archivos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Archivo subido correctamente"); 
      handleCancelUpload();
      fetchFiles();
      
    } catch (error) {
      console.error("Error subiendo:", error);
      setUploadState((prev) => ({ 
        ...prev, 
        error: error.response?.data?.detail || "Error de conexión o de validación." 
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;

    try {
      await api.delete(`archivos/${id}/`);
      setFiles(files.filter((f) => f.id !== id));
      
    } catch (error) {
      console.error("Error borrando:", error);
      alert("No se pudo eliminar. Verifique su sesión.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-VE");
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full min-h-[600px]">
      {/* SECCIÓN DE SUBIDA */}
      <div className="p-8 border-b border-gray-200 bg-gray-50">
        <h3 className={`text-xl font-serif font-bold ${theme.primaryText} mb-4`}>
          Subir Nueva Planilla o Archivo
        </h3>

        {!uploadState.file ? (
          <div
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-white hover:border-[#1B3A57] hover:bg-blue-50 transition-all cursor-pointer group"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-[#1B3A57]" />
            </div>
            <h4 className="text-lg font-bold text-gray-700">
              Haz clic para seleccionar un archivo PDF
            </h4>
            <p className="text-sm text-gray-500 mt-2">
              Formatos aceptados: .PDF (Máx 5MB)
            </p>
            {uploadState.error && (
              <p className="mt-4 text-red-600 font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {uploadState.error}
              </p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="application/pdf"
              className="hidden"
            />
          </div>
        ) : (
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FileText size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Archivo seleccionado:</p>
                  <p className="font-bold text-gray-800">
                    {uploadState.file.name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelUpload}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleConfirmUpload}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Título público <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadState.title}
                  onChange={(e) =>
                    setUploadState({ ...uploadState, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#1B3A57] outline-none"
                  placeholder="Ej: Planilla 2024"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadState.category}
                  onChange={(e) =>
                    setUploadState({ ...uploadState, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#1B3A57] outline-none bg-white"
                >
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3 mt-2 border-t pt-4">
                {uploadState.error && (
                  <span className="text-red-600 text-sm font-bold mr-auto">
                    {uploadState.error}
                  </span>
                )}

                {uploading ? (
                  <div className="flex items-center gap-2 text-[#1B3A57] font-bold">
                    <Loader2 className="animate-spin" /> Subiendo...
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`${theme.primary} text-white px-6 py-2 rounded shadow hover:opacity-90 flex items-center gap-2`}
                    >
                      <CheckCircle size={18} /> Publicar Archivo
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* LISTA DE ARCHIVOS */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-bold text-gray-800">
            Biblioteca de Archivos
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {files.length} documentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
                <th className="py-3 pl-4 rounded-tl-lg">Documento</th>
                <th className="py-3">Categoría</th>
                <th className="py-3">Fecha</th>
                <th className="py-3 text-right pr-4 rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    Cargando...
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    No hay archivos subidos.
                  </td>
                </tr>
              ) : (
                files.map((file) => {
                  // Fallback por si acaso la información del tipo de archivo no venga completa
                  const nombreCategoria = file.tipo_archivo_nombre || file.categoria || "Sin categoría";

                  return (
                    <tr
                      key={file.id}
                      className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-50 p-2 rounded text-red-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className={`font-bold ${theme.primaryText}`}>
                              {file.titulo}
                            </p>
                            <p className="text-xs text-gray-400">
                              {file.size_formatted || "PDF"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border
                          ${
                            nombreCategoria.toLowerCase().includes("nuevo")
                              ? "bg-green-50 text-green-700 border-green-100"
                              : nombreCategoria.toLowerCase().includes("reingreso")
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                          }
                        `}
                        >
                          {nombreCategoria}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">
                        {formatDate(file.fecha_subida)}
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.archivo_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-[#1B3A57] p-2 hover:bg-blue-50 rounded-full transition"
                            title="Descargar / Ver"
                          >
                            <Download size={18} />
                          </a>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilesManager;