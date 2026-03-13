import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  User,
  BookOpen,
  Calendar,
  Trash2,
  Filter 
} from "lucide-react";

import { API_URL } from "../config"; 

const InscripcionesManager = ({ token }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroTiempo, setFiltroTiempo] = useState("all");

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      const response = await fetch(`${API_URL}/api/registro-inscripciones/`, {
        headers: {
          'Authorization': `Token ${token}`
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

  // Función para eliminar un registro
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/registro-inscripciones/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        setInscripciones(inscripciones.filter(registro => registro.id !== id));
      } else {
        alert("Hubo un problema al intentar eliminar el registro.");
      }
    } catch (error) {
      console.error("Error eliminando inscripción:", error);
      alert("Error de conexión. Inténtalo de nuevo.");
    }
  };

  // Lógica para filtrar por fecha
  const inscripcionesFiltradas = inscripciones.filter((registro) => {
    if (filtroTiempo === "all") return true;

    const fechaRegistro = new Date(registro.fecha_subida);
    const hoy = new Date();
    
    // Reseteamos las horas de "hoy" a la medianoche para comparaciones exactas de días
    hoy.setHours(0, 0, 0, 0);

    if (filtroTiempo === "day") {
      return fechaRegistro >= hoy;
    } 
    if (filtroTiempo === "week") {
      const haceUnaSemana = new Date(hoy);
      haceUnaSemana.setDate(hoy.getDate() - 7);
      return fechaRegistro >= haceUnaSemana;
    }
    if (filtroTiempo === "month") {
      const haceUnMes = new Date(hoy);
      haceUnMes.setMonth(hoy.getMonth() - 1);
      return fechaRegistro >= haceUnMes;
    }
    
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#1B3A57]" size={40} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#1B3A57]">Planillas Recibidas</h3>
          <p className="text-sm text-gray-500">Historial de registros llenados desde la web.</p>
        </div>
        
        {/* Contador y Filtro */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={filtroTiempo}
              onChange={(e) => setFiltroTiempo(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">Todo el tiempo</option>
              <option value="day">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
          <div className="text-sm font-bold bg-blue-50 text-[#1B3A57] px-4 py-2 rounded-lg border border-blue-100">
            Total: {inscripcionesFiltradas.length}
          </div>
        </div>
      </div>

      {inscripcionesFiltradas.length === 0 ? (
        <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>No se encontraron registros para el período seleccionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscripcionesFiltradas.map((registro) => (
            <div key={registro.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-[#1B3A57] px-4 py-3 flex justify-between items-center">
                <h4 className="font-bold text-white uppercase text-sm truncate pr-2">
                  {registro.apellido}, {registro.nombre}
                </h4>
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
                  <span className="font-bold">Fecha:</span> {new Date(registro.fecha_subida).toLocaleDateString('es-VE')}
                </div>
                
                <div className="pt-4 border-t border-gray-100 mt-2 flex gap-2">
                  <a 
                    href={registro.archivo_pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 flex-1 bg-blue-50 text-[#1B3A57] hover:bg-blue-100 py-2 rounded-lg font-bold text-sm transition"
                  >
                    <FileText size={16} /> Ver PDF
                  </a>
                  
                  {/* Botón de Eliminar */}
                  <button
                    onClick={() => handleDelete(registro.id)}
                    className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition"
                    title="Eliminar registro"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InscripcionesManager;