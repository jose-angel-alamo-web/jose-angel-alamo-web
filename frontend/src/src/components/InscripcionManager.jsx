import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  User,
  BookOpen,
  Calendar,
  Trash2,
  Filter,
  Search 
} from "lucide-react";

import { API_URL } from "../config"; 
import api from '../api/axios';

const InscripcionesManager = ({ token }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los filtros
  const [filtroTiempo, setFiltroTiempo] = useState("all");
  const [filtroAno, setFiltroAno] = useState("all");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('registro-inscripciones/');
      setInscripciones(response.data);
    } catch (error) {
      console.error("Error obteniendo las planillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.")) {
      try {
        await api.delete(`registro-inscripciones/${id}/`);
        fetchInscripciones(); 
      } catch (error) {
        console.error("Error al eliminar la planilla:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
      }
    }
  };

  // Extrae los años únicos de los registros para el Select Dinámico
  const añosDisponibles = [...new Set(inscripciones.map(registro => 
    new Date(registro.fecha_subida).getFullYear()
  ))].sort((a, b) => b - a); // Ordenamos del más reciente al más antiguo

  //Lógica maestra de filtrado 
  const inscripcionesFiltradas = inscripciones.filter((registro) => {
    const estudiante = registro.estudiante_info || {};
    const fechaRegistro = new Date(registro.fecha_subida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // FILTRO DE BÚSQUEDA  
    if (busqueda.trim() !== "") {
      const termino = busqueda.toLowerCase();
      const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellido || ''} ${estudiante.cedula || ''}`.toLowerCase();
      
      if (!nombreCompleto.includes(termino)) {
        return false; // Si no coincide, lo sacamos de la lista
      }
    }

    // FILTRO DE AÑO 
    if (filtroAno !== "all" && fechaRegistro.getFullYear().toString() !== filtroAno) {
      return false;
    }

    // FILTRO DE TIEMPO (Día, Semana, Mes) 
    if (filtroTiempo !== "all") {
      if (filtroTiempo === "day" && fechaRegistro < hoy) return false;
      
      if (filtroTiempo === "week") {
        const haceUnaSemana = new Date(hoy);
        haceUnaSemana.setDate(hoy.getDate() - 7);
        if (fechaRegistro < haceUnaSemana) return false;
      }
      
      if (filtroTiempo === "month") {
        const haceUnMes = new Date(hoy);
        haceUnMes.setMonth(hoy.getMonth() - 1);
        if (fechaRegistro < haceUnMes) return false;
      }
    }

    return true; // Si sobrevive a todos los filtros, se muestra
  });

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#1B3A57]" size={40} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* CABECERA Y CONTROLES */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-gray-200 pb-4 gap-4">
        
        <div className="mb-2 xl:mb-0">
          <h3 className="text-xl font-bold text-[#1B3A57]">Planillas Recibidas</h3>
          <p className="text-sm text-gray-500">Historial de registros llenados desde la web.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* 1. Buscador de Texto */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-grow xl:flex-none xl:w-64 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar estudiante o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none w-full"
            />
          </div>

          {/* 2. Filtro de Año */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-grow sm:flex-none">
            <Calendar size={16} className="text-gray-500" />
            <select 
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="all">Cualquier Año</option>
              {añosDisponibles.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
          </div>

          {/* 3. Filtro de Tiempo Reciente */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-grow sm:flex-none">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={filtroTiempo}
              onChange={(e) => setFiltroTiempo(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="all">Todo el tiempo</option>
              <option value="day">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>

          {/* Total */}
          <div className="text-sm font-bold bg-blue-50 text-[#1B3A57] px-4 py-2 rounded-lg border border-blue-100 flex-grow sm:flex-none text-center">
            Total: {inscripcionesFiltradas.length}
          </div>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE TARJETAS */}
      {inscripcionesFiltradas.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Search size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No se encontraron resultados</p>
          <p className="text-sm">Intenta ajustar los filtros o el término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscripcionesFiltradas.map((registro) => {
            const estudiante = registro.estudiante_info || {};
            const nombre = estudiante.nombre || 'Desconocido';
            const apellido = estudiante.apellido || 'Desconocido';
            const cedula = estudiante.cedula || 'Sin Cédula';
            const grado = registro.grado_nombre || 'Sin Asignar';

            return (
              <div key={registro.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="bg-[#1B3A57] px-4 py-3 flex justify-between items-center">
                  <h4 className="font-bold text-white uppercase text-sm truncate pr-2">
                    {apellido}, {nombre}
                  </h4>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span className="font-bold">Cédula:</span> {cedula}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen size={16} className="text-gray-400" />
                    <span className="font-bold">Grado:</span> {grado}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InscripcionesManager;