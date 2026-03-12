import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Loader2,
  User,
  BookOpen,
  Calendar
} from "lucide-react";

import { API_URL } from "../config"; 

const theme = {
  primary: "bg-[#1B3A57]",
  primaryText: "text-[#1B3A57]",
  accent: "bg-[#C62828]",
  bgLight: "bg-[#FDFBF7]",
};

const InscripcionesManager = ({ token }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inscripciones/`, {
        headers: {
          'Authorization': `Token ${token}` // Requiere autenticación
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInscripciones(data);
      }
    } catch (error) {
      console.error("Error obteniendo inscripciones:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#1B3A57]" size={40} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1B3A57]">Planillas Recibidas</h3>
          <p className="text-sm text-gray-500">Historial de registros llenados desde la web.</p>
        </div>
        <div className="text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          Total: {inscripciones.length}
        </div>
      </div>

      {inscripciones.length === 0 ? (
        <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>Aún no se han recibido planillas de inscripción.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscripciones.map((registro) => (
            <div key={registro.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-[#1B3A57] px-4 py-3">
                <h4 className="font-bold text-white uppercase text-sm">{registro.apellidos}, {registro.nombres}</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-gray-400" />
                  <span className="font-bold">Cédula:</span> {registro.cedula}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="font-bold">Grado:</span> {registro.grado_cursar}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-bold">Fecha:</span> {new Date(registro.fecha_llenado).toLocaleDateString('es-VE')}
                </div>
                
                <div className="pt-4 border-t border-gray-100 mt-2">
                  <a 
                    href={registro.archivo_pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-700 hover:bg-red-100 py-2 rounded-lg font-bold text-sm transition"
                  >
                    <FileText size={16} /> Ver Planilla PDF
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InscripcionesManager