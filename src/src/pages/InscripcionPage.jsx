import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Download, CheckCircle,
  User, Users, FileText, BookOpen, Heart, ChevronRight, AlertCircle, Upload, X
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../config"; 
import api from "../api/axios";

// ESTADO INICIAL
const initialData = {
  fotoEstudiante: null, fotoMadre: null, fotoPadre: null, fotoRepresentante: null,
  nombres: "", apellidos: "", sexo: "M", ciudadNac: "", municipioNac: "", estadoNac: "", nacionalidad: "",
  fechaNac: "", cedula: "V-", edad: "", estatura: "", peso: "",
  direccion: "", telefonoFijo: "", telefonoCelular: "", correo: "", gradoCursar: "", gradoNombre: "",
  
  madreVive: "si", madreNombres: "", madreApellidos: "", madreCedula: "V-",
  madreTelFijo: "", madreCelular: "", madreCorreo: "", madreDireccion: "", madreGradoInstruccion: "", madreProfesion: "",
  madreEjerce: "si", madreDirOficina: "", madreTelOficina: "",
  
  padreVive: "si", padreNombres: "", padreApellidos: "", padreCedula: "V-",
  padreTelFijo: "", padreCelular: "", padreCorreo: "", padreDireccion: "", padreGradoInstruccion: "", padreProfesion: "",
  padreEjerce: "si", padreDirOficina: "", padreTelOficina: "", situacionPadres: "casados",
  
  viveConPadres: true, viveConMadre: false, viveConPadre: false, viveConFamiliar: false, viveConAmigos: false, viveSolo: false,
  
  representanteEs: "padre", repNombres: "", repApellidos: "", repCI: "V-", repDireccion: "",
  repTelFijo: "", repCelular: "", repCorreo: "", repParentesco: "", repGradoInstruccion: "", repProfesion: "",
  repEjerce: "si", repDirOficina: "", repTelOficina: "",
  
  nuevoIngreso: "si", llegaSolo: true, llegaRepresentante: false, llegaTransporte: false,
  retiraSolo: true, retiraRepresentante: false, retiraTransporte: false, transportistaRetira: "", transportistaTelefono: "",
  anosEnLiceo: "", planteProcedencia: "", anosEnPlantel: "", motivoEgreso: "", otrosPlanteles: "",
  actividadExtracurricular: "no", actividadCual: "", religion: "", actividadCultural: "no", actividadCulturalCual: "",
  instrumento: "no", instrumentoCual: "", deporte: "no", deporteCual: "",
  
  factorRH: "", grupoSanguineo: "", usaLentes: "no", implementoOrtopedico: "no",
  discapacidadAuditiva: false, discapacidadVisual: false, discapacidadMotriz: false, alergico: "no", alergicoCuales: "",
  
  vacBCG: "no", vacPolio: "no", vacDifteria: "no", vacTetano: "no", vacTosferina: "no", vacHemofilos: "no", vacMeningococo: "no",
  vacNeumococo: "no", vacRubeola: "no", vacSarampion: "no", vacParotidilis: "no", vacVaricela: "no", vacAntigripal: "no",
  vacAntiamarilica: "no", vacHepatitisA: "no", vacHepatitisB: "no",
  
  asma: "no", renitis: "no", otrasResp: "", cardiopatia: "no", cardiopatiaCual: "",
  alergiaMedicamento: "no", alergiaMedicamentoCual: "", alergiaAlimento: "no", alergiaAlimentoCual: "",
  epilepsia: "no", otrosNeurologicos: "", cirugia: "no", cirugiaCual: "",
  actividadRestringida: "no", actividadRestringidaCual: "", medicado: "no", medicamentos: "",
  emergenciaNombre: "", emergenciaTelefono: "",
};

const STEPS = [
  { id: 1, label: "Estudiante", icon: User },
  { id: 2, label: "Padres", icon: Users },
  { id: 3, label: "Representante", icon: FileText },
  { id: 4, label: "Complementarios", icon: BookOpen },
  { id: 5, label: "Salud", icon: Heart },
];

// COMPONENTES UI Y MÁSCARAS 

const Field = ({ label, children, className = "", required = false }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, ...props }) => (
  <input
    value={value}
    onChange={onChange}
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition disabled:bg-gray-100"
    {...props}
  />
);

// MÁSCARA 1: Cédula
const CedulaInput = ({ value, onChange, disabled }) => {
  const tipo = value ? value.split("-")[0] : "V";
  const numero = value ? value.split("-")[1] : "";

  const handleNumeroChange = (e) => {
    // REGEX que elimina todo lo que no sea número
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8); 
    onChange(`${tipo}-${soloNumeros}`);
  };

  return (
    <div className="flex gap-2">
      <select 
        value={tipo} 
        onChange={(e) => onChange(`${e.target.value}-${numero}`)}
        disabled={disabled}
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 disabled:bg-gray-100"
      >
        <option value="V">V</option>
        <option value="E">E</option>
      </select>
      <input
        type="text"
        value={numero}
        onChange={handleNumeroChange}
        disabled={disabled}
        placeholder="12345678"
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition disabled:bg-gray-100"
      />
    </div>
  );
};

// MÁSCARA 2: Teléfono (Auto formato)
const TelefonoInput = ({ value, onChange, disabled, placeholder }) => {
  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 11); // Solo números, max 11
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `(${raw.slice(0,4)}) ${raw.slice(4)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0,4)}) ${raw.slice(4,7)}-${raw.slice(7)}`;
    }
    onChange(formatted);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder || "(0000) 000-0000"}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition disabled:bg-gray-100"
    />
  );
};

const Select = ({ value, onChange, children, ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition disabled:bg-gray-100"
    {...props}
  >
    {children}
  </select>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-serif font-bold text-[#1B3A57] border-b-2 border-[#C62828] pb-2 mb-5 flex items-center gap-2">
    <span className="w-1 h-5 bg-[#C62828] rounded-full inline-block"></span>
    {children}
  </h3>
);

const YesNoRow = ({ label, value, onChange }) => {
  const uniqueName = React.useId(); 
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-gray-700 min-w-[120px]">{label}</span>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="radio" name={uniqueName} value="si" checked={value === "si"} onChange={() => onChange("si")} className="accent-[#1B3A57]" />
        <span className="text-sm">Sí</span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="radio" name={uniqueName} value="no" checked={value === "no"} onChange={() => onChange("no")} className="accent-[#1B3A57]" />
        <span className="text-sm">No</span>
      </label>
    </div>
  );
};

const ImageUpload = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-24 h-32 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(null)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition shadow"><X size={12} strokeWidth={3} /></button>
          </div>
        ) : (
          <label className="w-24 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#1B3A57]/5 hover:border-[#1B3A57]/40 transition group">
            <Upload size={20} className="text-gray-400 group-hover:text-[#1B3A57] mb-2" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-center px-2 group-hover:text-[#1B3A57]">Subir<br/>Foto</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};


// PASOS DEL FORMULARIO

const StepEstudiante = ({ data, set, venezuelaData, gradosDisponibles, availableMunicipios, availableCiudades, handleEstadoChange }) => (
  <div className="space-y-6">
    <SectionTitle>1. Datos del Estudiante</SectionTitle>
    
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <ImageUpload label="Foto (Opcional)" value={data.fotoEstudiante} onChange={v => set("fotoEstudiante", v)} />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Field label="Nombres" required><Input value={data.nombres} onChange={e => set("nombres", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} placeholder="Nombres completos" /></Field>
        <Field label="Apellidos" required><Input value={data.apellidos} onChange={e => set("apellidos", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} placeholder="Apellidos completos" /></Field>
        <Field label="Cédula de Identidad" required>
          <CedulaInput value={data.cedula} onChange={v => set("cedula", v)} />
        </Field>
        <Field label="Sexo">
          <Select value={data.sexo} onChange={e => set("sexo", e.target.value)}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </Select>
        </Field>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
      <Field label="Estado de Nacimiento" required>
        <Select value={data.estadoNac} onChange={e => handleEstadoChange(e.target.value)}>
          <option value="">— Seleccione Estado —</option>
          {venezuelaData.map(est => (
            <option key={est.estado} value={est.estado}>{est.estado}</option>
          ))}
        </Select>
      </Field>
      
      <Field label="Municipio de Nacimiento" required>
        <Select value={data.municipioNac} onChange={e => set("municipioNac", e.target.value)} disabled={!data.estadoNac}>
          <option value="">— Seleccione Municipio —</option>
          {availableMunicipios.map(mun => (
            <option key={mun} value={mun}>{mun}</option>
          ))}
        </Select>
      </Field>

      <Field label="Ciudad de Nacimiento" required>
        <Select value={data.ciudadNac} onChange={e => set("ciudadNac", e.target.value)} disabled={!data.estadoNac}>
          <option value="">— Seleccione Ciudad —</option>
          {availableCiudades.map(ciu => (
            <option key={ciu} value={ciu}>{ciu}</option>
          ))}
        </Select>
      </Field>
    </div>
    {/* ========================================================= */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <Field label="Nacionalidad"><Input value={data.nacionalidad} onChange={e => set("nacionalidad", e.target.value)} placeholder="Ej: Venezolano" /></Field>
      <Field label="Fecha de Nacimiento" required><Input type="date" value={data.fechaNac} onChange={e => set("fechaNac", e.target.value)} max={new Date().toISOString().split("T")[0]} /></Field>
      <Field label="Edad (años)" required><Input type="number" min="5" max="30" value={data.edad} onChange={e => set("edad", e.target.value)} placeholder="Ej: 14" /></Field>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      <Field label="Estatura (mts)"><Input type="number" step="0.01" value={data.estatura} onChange={e => set("estatura", e.target.value)} placeholder="1.65" /></Field>
      <Field label="Peso (kg)"><Input type="number" value={data.peso} onChange={e => set("peso", e.target.value)} placeholder="60" /></Field>
    </div>
    <Field label="Dirección de Residencia" required>
      <Input value={data.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Dirección completa" />
    </Field>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Teléfono Fijo"><TelefonoInput value={data.telefonoFijo} onChange={v => set("telefonoFijo", v)} /></Field>
      <Field label="Teléfono Celular"><TelefonoInput value={data.telefonoCelular} onChange={v => set("telefonoCelular", v)} /></Field>
      <Field label="Correo Electrónico"><Input type="email" value={data.correo} onChange={e => set("correo", e.target.value)} placeholder="correo@ejemplo.com" /></Field>
    </div>
    <Field label="Grado a Cursar" className="md:w-1/3" required>
      <Select 
        value={data.gradoCursar} 
        onChange={e => {
          const id = e.target.value;
          set("gradoCursar", id); // Guarda el ID (1, 2, 3...) para el backend
          
          // Busca el nombre del grado para que el PDF se imprima bonito
          const gradoSeleccionado = gradosDisponibles.find(g => g.id.toString() === id);
          set("gradoNombre", gradoSeleccionado ? gradoSeleccionado.nombre : "");
        }}
      >
        <option value="">— Seleccione —</option>
        {gradosDisponibles.map(grado => (
          <option key={grado.id} value={grado.id}>{grado.nombre}</option>
        ))}
      </Select>
    </Field>
  </div>
);

const StepPadres = ({ data, set }) => (
  <div className="space-y-8">
    {/* MADRE */}
    <div>
      <SectionTitle>2.1 Datos de la Madre</SectionTitle>
      <div className="flex gap-6 mb-4">
        <YesNoRow label="¿Vive?" value={data.madreVive} onChange={v => set("madreVive", v)} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
        {data.madreVive === "si" && <ImageUpload label="Foto" value={data.fotoMadre} onChange={v => set("fotoMadre", v)} />}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Field label="Nombres" required={data.madreVive === "si"}><Input value={data.madreNombres} onChange={e => set("madreNombres", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} disabled={data.madreVive === "no"} /></Field>
          <Field label="Apellidos" required={data.madreVive === "si"}><Input value={data.madreApellidos} onChange={e => set("madreApellidos", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} disabled={data.madreVive === "no"} /></Field>
          <Field label="Cédula" required={data.madreVive === "si"} className="md:col-span-2">
            <CedulaInput value={data.madreCedula} onChange={v => set("madreCedula", v)} disabled={data.madreVive === "no"} />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Teléfono Fijo"><TelefonoInput value={data.madreTelFijo} onChange={v => set("madreTelFijo", v)} disabled={data.madreVive === "no"} /></Field>
        <Field label="Teléfono Celular"><TelefonoInput value={data.madreCelular} onChange={v => set("madreCelular", v)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Correo Electrónico"><Input type="email" value={data.madreCorreo} onChange={e => set("madreCorreo", e.target.value)} disabled={data.madreVive === "no"} /></Field>
        <Field label="Dirección"><Input value={data.madreDireccion} onChange={e => set("madreDireccion", e.target.value)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Grado Instrucción"><Input value={data.madreGradoInstruccion} onChange={e => set("madreGradoInstruccion", e.target.value)} disabled={data.madreVive === "no"} /></Field>
        <Field label="Profesión"><Input value={data.madreProfesion} onChange={e => set("madreProfesion", e.target.value)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-4 mt-6"><YesNoRow label="¿Ejerce?" value={data.madreEjerce} onChange={v => set("madreEjerce", v)} /></div>
        <Field label="Dir. Oficina"><Input value={data.madreDirOficina} onChange={e => set("madreDirOficina", e.target.value)} disabled={data.madreVive === "no" || data.madreEjerce === "no"} /></Field>
      </div>
    </div>

    {/* PADRE */}
    <div>
      <SectionTitle>2.2 Datos del Padre</SectionTitle>
      <div className="flex gap-6 mb-4">
        <YesNoRow label="¿Vive?" value={data.padreVive} onChange={v => set("padreVive", v)} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
        {data.padreVive === "si" && <ImageUpload label="Foto" value={data.fotoPadre} onChange={v => set("fotoPadre", v)} />}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Field label="Nombres" required={data.padreVive === "si"}><Input value={data.padreNombres} onChange={e => set("padreNombres", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} disabled={data.padreVive === "no"} /></Field>
          <Field label="Apellidos" required={data.padreVive === "si"}><Input value={data.padreApellidos} onChange={e => set("padreApellidos", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} disabled={data.padreVive === "no"} /></Field>
          <Field label="Cédula" required={data.padreVive === "si"} className="md:col-span-2">
             <CedulaInput value={data.padreCedula} onChange={v => set("padreCedula", v)} disabled={data.padreVive === "no"} />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Teléfono Fijo"><TelefonoInput value={data.padreTelFijo} onChange={v => set("padreTelFijo", v)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Teléfono Celular"><TelefonoInput value={data.padreCelular} onChange={v => set("padreCelular", v)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Correo Electrónico"><Input type="email" value={data.padreCorreo} onChange={e => set("padreCorreo", e.target.value)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Dirección"><Input value={data.padreDireccion} onChange={e => set("padreDireccion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Grado Instrucción"><Input value={data.padreGradoInstruccion} onChange={e => set("padreGradoInstruccion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Profesión"><Input value={data.padreProfesion} onChange={e => set("padreProfesion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-4 mt-6"><YesNoRow label="¿Ejerce?" value={data.padreEjerce} onChange={v => set("padreEjerce", v)} /></div>
        <Field label="Dir. Oficina"><Input value={data.padreDirOficina} onChange={e => set("padreDirOficina", e.target.value)} disabled={data.padreVive === "no" || data.padreEjerce === "no"} /></Field>
      </div>
    </div>

    {/* SITUACIÓN */}
    <div>
      <SectionTitle>2.3 Situación Familiar</SectionTitle>
      <Field label="Estado Civil">
        <Select value={data.situacionPadres} onChange={e => set("situacionPadres", e.target.value)}>
          <option value="casados">Casados</option><option value="separados">Separados</option>
          <option value="viudo">Viudo/a</option><option value="divorciado">Divorciado/a</option>
          <option value="soltero">Soltero/a</option><option value="otros">Otros</option>
        </Select>
      </Field>
      <div className="mt-4">
        <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider block mb-2">El estudiante vive con:</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ["viveConPadres", "Sus Padres"], ["viveConMadre", "Su Madre"], ["viveConPadre", "Su Padre"],
            ["viveConFamiliar", "Un Familiar"], ["viveConAmigos", "Amigos"], ["viveSolo", "Solo/a"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition">
              <input type="checkbox" checked={data[key]} onChange={e => set(key, e.target.checked)} className="accent-[#1B3A57] w-4 h-4" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StepRepresentante = ({ data, set }) => (
  <div className="space-y-8">
    <div>
      <SectionTitle>3. Representante Legal</SectionTitle>
      <Field label="El representante es:">
        <Select value={data.representanteEs} onChange={e => set("representanteEs", e.target.value)}>
          <option value="padre">Padre</option>
          <option value="madre">Madre</option>
          <option value="representante">Representante Legal (Familiar/Tercero)</option>
          <option value="otro">Otro</option>
        </Select>
      </Field>
      
      {(data.representanteEs === "representante" || data.representanteEs === "otro") && (
        <div className="mt-6 space-y-4 p-5 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <ImageUpload label="Foto" value={data.fotoRepresentante} onChange={v => set("fotoRepresentante", v)} />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Field label="Nombres" required><Input value={data.repNombres} onChange={e => set("repNombres", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} /></Field>
              <Field label="Apellidos" required><Input value={data.repApellidos} onChange={e => set("repApellidos", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} /></Field>
              <Field label="Cédula" required><CedulaInput value={data.repCI} onChange={v => set("repCI", v)} /></Field>
              <Field label="Parentesco" required><Input value={data.repParentesco} onChange={e => set("repParentesco", e.target.value)} /></Field>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Celular" required><TelefonoInput value={data.repCelular} onChange={v => set("repCelular", v)} /></Field>
            <Field label="Tel. Fijo"><TelefonoInput value={data.repTelFijo} onChange={v => set("repTelFijo", v)} /></Field>
            <Field label="Correo"><Input type="email" value={data.repCorreo} onChange={e => set("repCorreo", e.target.value)} /></Field>
          </div>
          <Field label="Dirección" required><Input value={data.repDireccion} onChange={e => set("repDireccion", e.target.value)} /></Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Instrucción"><Input value={data.repGradoInstruccion} onChange={e => set("repGradoInstruccion", e.target.value)} /></Field>
            <Field label="Profesión"><Input value={data.repProfesion} onChange={e => set("repProfesion", e.target.value)} /></Field>
          </div>
        </div>
      )}
    </div>
  </div>
);

const StepComplementarios = ({ data, set }) => (
  <div className="space-y-8">
    <div>
      <SectionTitle>4.1 Del Liceo</SectionTitle>
      
      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <YesNoRow label="¿Es Nuevo Ingreso?" value={data.nuevoIngreso} onChange={v => set("nuevoIngreso", v)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider block mb-2">Llega al Liceo:</label>
          {[["llegaSolo","Solo/a"],["llegaRepresentante","Con representante"],["llegaTransporte","Con transporte"]].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer mb-2 hover:bg-slate-50 p-1 rounded transition">
              <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57] w-4 h-4" />
              <span className="text-sm text-gray-700 font-medium">{l}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider block mb-2">Se retira del Liceo:</label>
          {[["retiraSolo","Solo/a"],["retiraRepresentante","Con representante"],["retiraTransporte","Con transporte"]].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer mb-2 hover:bg-slate-50 p-1 rounded transition">
              <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57] w-4 h-4" />
              <span className="text-sm text-gray-700 font-medium">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {(data.retiraTransporte || data.llegaTransporte) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <Field label="Nombre del transportista" required><Input value={data.transportistaRetira} onChange={e => set("transportistaRetira", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} /></Field>
          <Field label="Teléfono" required><TelefonoInput value={data.transportistaTelefono} onChange={v => set("transportistaTelefono", v)} /></Field>
        </div>
      )}

      {data.nuevoIngreso === "si" && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Años en el Liceo"><Input type="number" min="0" value={data.anosEnLiceo} onChange={e => set("anosEnLiceo", e.target.value)} /></Field>
            <Field label="Plantel de Procedencia"><Input value={data.planteProcedencia} onChange={e => set("planteProcedencia", e.target.value)} /></Field>
            <Field label="Años en ese Plantel"><Input type="number" min="0" value={data.anosEnPlantel} onChange={e => set("anosEnPlantel", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Motivo de Egreso"><Input value={data.motivoEgreso} onChange={e => set("motivoEgreso", e.target.value)} /></Field>
            <Field label="Otros Planteles donde ha estudiado"><Input value={data.otrosPlanteles} onChange={e => set("otrosPlanteles", e.target.value)} /></Field>
          </div>
        </div>
      )}
    </div>

    <div>
      <SectionTitle>4.2 Tiempo Libre</SectionTitle>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <YesNoRow label="Actividad extracurricular" value={data.actividadExtracurricular} onChange={v => set("actividadExtracurricular", v)} />
            {data.actividadExtracurricular === "si" && <Input value={data.actividadCual} onChange={e => set("actividadCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
          <Field label="Religión que profesa"><Input value={data.religion} onChange={e => set("religion", e.target.value)} /></Field>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <YesNoRow label="Actividad cultural/artística" value={data.actividadCultural} onChange={v => set("actividadCultural", v)} />
            {data.actividadCultural === "si" && <Input value={data.actividadCulturalCual} onChange={e => set("actividadCulturalCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
          <div className="space-y-2">
            <YesNoRow label="Toca instrumento musical" value={data.instrumento} onChange={v => set("instrumento", v)} />
            {data.instrumento === "si" && <Input value={data.instrumentoCual} onChange={e => set("instrumentoCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
        </div>
        
        <div className="space-y-2">
          <YesNoRow label="Practica algún deporte" value={data.deporte} onChange={v => set("deporte", v)} />
          {data.deporte === "si" && <Input value={data.deporteCual} onChange={e => set("deporteCual", e.target.value)} placeholder="¿Cuál?" className="md:w-1/2" />}
        </div>
      </div>
    </div>
  </div>
);

const StepSalud = ({ data, set }) => {
  const vacunas = [
    ["vacBCG","BCG"],["vacPolio","Polio"],["vacDifteria","Difteria"],["vacTetano","Tétano"],
    ["vacTosferina","Tosferina"],["vacHemofilos","Antihemofilos"],["vacMeningococo","Antimeningococo"],
    ["vacNeumococo","Antineumococo"],["vacRubeola","Rubéola"],["vacSarampion","Sarampión"],
    ["vacParotidilis","Parotiditis"],["vacVaricela","Varicela"],["vacAntigripal","Antigripal"],
    ["vacAntiamarilica","Antiamarílica"],["vacHepatitisA","Hepatitis A"],["vacHepatitisB","Hepatitis B"],
  ];
  
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>5. Salud del Alumno</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Factor RH">
            <Select value={data.factorRH} onChange={e => set("factorRH", e.target.value)}>
              <option value="">—</option><option value="+">Positivo (+)</option><option value="-">Negativo (-)</option>
            </Select>
          </Field>
          <Field label="Grupo Sanguíneo">
            <Select value={data.grupoSanguineo} onChange={e => set("grupoSanguineo", e.target.value)}>
              <option value="">—</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
            </Select>
          </Field>
        </div>
        <div className="mt-6 space-y-4">
          <YesNoRow label="Usa lentes correctivos" value={data.usaLentes} onChange={v => set("usaLentes", v)} />
          <YesNoRow label="Usa implemento ortopédico" value={data.implementoOrtopedico} onChange={v => set("implementoOrtopedico", v)} />
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-sm font-semibold text-gray-700 min-w-[120px]">Discapacidad:</span>
            <div className="flex flex-wrap gap-4">
              {[["discapacidadAuditiva","Auditiva"],["discapacidadVisual","Visual"],["discapacidadMotriz","Motriz"]].map(([k,l]) => (
                <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57] w-4 h-4" />
                  <span className="text-sm text-gray-700">{l}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <YesNoRow label="Es alérgico (animal/vegetal/mineral)" value={data.alergico} onChange={v => set("alergico", v)} />
            {data.alergico === "si" && <Input value={data.alergicoCuales} onChange={e => set("alergicoCuales", e.target.value)} placeholder="¿A cuáles?" />}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>5.1 Inmunizaciones (Vacunas)</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vacunas.map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${data[key] === "si" ? "bg-green-50 border-green-400 shadow-sm" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
              <input type="checkbox" checked={data[key] === "si"} onChange={e => set(key, e.target.checked ? "si" : "no")} className="accent-green-600 w-4 h-4" />
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>5.2 Antecedentes Personales</SectionTitle>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold uppercase text-[#1B3A57] mb-3">Enfermedades Respiratorias</p>
            <div className="space-y-3">
              <YesNoRow label="Sufre de Asma" value={data.asma} onChange={v => set("asma", v)} />
              <YesNoRow label="Sufre de Rinitis" value={data.renitis} onChange={v => set("renitis", v)} />
              <Field label="Otras (Especifique)"><Input value={data.otrasResp} onChange={e => set("otrasResp", e.target.value)} /></Field>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <YesNoRow label="Cardiopatía congénita" value={data.cardiopatia} onChange={v => set("cardiopatia", v)} />
              {data.cardiopatia === "si" && <Input value={data.cardiopatiaCual} onChange={e => set("cardiopatiaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-2">
              <YesNoRow label="Alergia a medicamentos" value={data.alergiaMedicamento} onChange={v => set("alergiaMedicamento", v)} />
              {data.alergiaMedicamento === "si" && <Input value={data.alergiaMedicamentoCual} onChange={e => set("alergiaMedicamentoCual", e.target.value)} placeholder="¿Cuáles?" />}
            </div>
            <div className="space-y-2">
              <YesNoRow label="Alergia a alimentos" value={data.alergiaAlimento} onChange={v => set("alergiaAlimento", v)} />
              {data.alergiaAlimento === "si" && <Input value={data.alergiaAlimentoCual} onChange={e => set("alergiaAlimentoCual", e.target.value)} placeholder="¿Cuáles?" />}
            </div>
            
            <YesNoRow label="Epilepsia / Convulsiones" value={data.epilepsia} onChange={v => set("epilepsia", v)} />
            
            <div className="space-y-2">
              <YesNoRow label="Intervención quirúrgica" value={data.cirugia} onChange={v => set("cirugia", v)} />
              {data.cirugia === "si" && <Input value={data.cirugiaCual} onChange={e => set("cirugiaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-2">
              <YesNoRow label="Actividad restringida por médico" value={data.actividadRestringida} onChange={v => set("actividadRestringida", v)} />
              {data.actividadRestringida === "si" && <Input value={data.actividadRestringidaCual} onChange={e => set("actividadRestringidaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-2">
              <YesNoRow label="Está medicado actualmente" value={data.medicado} onChange={v => set("medicado", v)} />
              {data.medicado === "si" && <Input value={data.medicamentos} onChange={e => set("medicamentos", e.target.value)} placeholder="Indique los medicamentos" />}
            </div>
          </div>
          
          {/* EMERGENCIA (Validado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-5 bg-red-50 rounded-xl border-2 border-red-200">
            <h4 className="md:col-span-2 text-red-800 font-bold uppercase text-sm mb-1">En caso de emergencia llamar a:</h4>
            <Field label="Nombre del Contacto" required><Input value={data.emergenciaNombre} onChange={e => set("emergenciaNombre", e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} placeholder="Nombre completo" /></Field>
            <Field label="Teléfono de Emergencia" required><TelefonoInput value={data.emergenciaTelefono} onChange={v => set("emergenciaTelefono", v)} /></Field>
          </div>
        </div>
      </div>
    </div>
  );
};

// TEMPLATE DE PDF 
const PdfTemplate = React.forwardRef(({ data }, ref) => {
  const sn = (val) => val === "si" ? "✓ Sí  ☐ No" : "☐ Sí  ✓ No";
  const check = (val) => val ? "☑" : "☐";
  const vacunas = [ ["vacBCG","BCG"],["vacPolio","Polio"],["vacDifteria","Difteria"],["vacTetano","Tétano"], ["vacTosferina","Tosferina"],["vacHemofilos","Antihemofilos"],["vacMeningococo","Antimeningococo"], ["vacNeumococo","Antineumococo"],["vacRubeola","Rubéola"],["vacSarampion","Sarampión"], ["vacParotidilis","Parotiditis"],["vacVaricela","Varicela"],["vacAntigripal","Antigripal"], ["vacAntiamarilica","Antiamarílica"],["vacHepatitisA","Hepatitis A"],["vacHepatitisB","Hepatitis B"]];
  const Section = ({ title, children }) => (<div style={{ marginBottom: 12 }}><div style={{ background: "#f1f5f9", border: "1px solid #000", color: "#000", padding: "4px 8px", fontWeight: "bold", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>{title}</div>{children}</div>);
  const Row = ({ label, value }) => (<div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "baseline" }}><span style={{ fontSize: 10, color: "#000", minWidth: 110, fontWeight: "bold" }}>{label}:</span><span style={{ fontSize: 11, borderBottom: "1px solid #000", color: "#000", flex: 1, paddingBottom: 4 }}>{value || ""}</span></div>);
  const fotoRepAMostrar = data.representanteEs === "madre" ? data.fotoMadre : data.representanteEs === "padre" ? data.fotoPadre : data.fotoRepresentante;

  return (
    <div ref={ref} style={{ width: "210mm", height: "auto", background: "white", padding: "12mm 15mm", fontFamily: "Arial, sans-serif", fontSize: 10, color: "#000", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <img src="https://i.imgur.com/yoiUI2Z.png" alt="Logo" style={{ width: 65, height: 65, objectFit: "contain" }} crossOrigin="anonymous" />
          <div style={{ textAlign: "center", lineHeight: 1.2 }}>
            <div style={{ fontSize: 10, fontWeight: "bold", color: "#000" }}>REPUBLICA BOLIVARIANA DE VENEZUELA<br/>MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN<br/>LICEO JOSE ANGEL ALAMO<br/>LA CANDELARIA-EDO. MIRANDA</div>
            <div style={{ fontSize: 15, fontWeight: "900", color: "#000", letterSpacing: 0.5, marginTop: 6 }}>FICHA DE INSCRIPCIÓN</div>
            <div style={{ fontSize: 10, marginTop: 4, color: "#000" }}><strong>Año Escolar:</strong> {new Date().getFullYear() + "-" + (new Date().getFullYear() + 1)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Fecha:</strong> {new Date().toLocaleDateString("es-VE")}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 60, height: 75, border: "1px dashed #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, textAlign: "center", color: "#000", whiteSpace: "pre-wrap", overflow: "hidden" }}>{data.fotoEstudiante ? <img src={data.fotoEstudiante} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="Estudiante" /> : "Foto\nEstudiante"}</div>
          <div style={{ width: 60, height: 75, border: "1px dashed #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, textAlign: "center", color: "#000", whiteSpace: "pre-wrap", overflow: "hidden" }}>{fotoRepAMostrar ? <img src={fotoRepAMostrar} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="Representante" /> : "Foto\nRepresentante"}</div>
        </div>
      </div>
      <Section title="1. DATOS DEL ESTUDIANTE">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
          <Row label="Nombres" value={data.nombres} /><Row label="Apellidos" value={data.apellidos} /><Row label="Sexo" value={data.sexo === "M" ? "Masculino" : "Femenino"} /><Row label="Lugar Nac." value={`${data.ciudadNac} ${data.estadoNac ? '- ' + data.estadoNac : ''}`} /><Row label="Fecha Nac." value={data.fechaNac} /><Row label="Nacionalidad" value={data.nacionalidad} /><Row label="Cédula" value={data.cedula} /><Row label="Edad" value={data.edad ? `${data.edad} años` : ""} /><Row label="Est/Peso" value={`${data.estatura ? data.estatura + " mts" : ""} / ${data.peso ? data.peso + " kg" : ""}`} />
          <Row label="Grado a Cursar" value={data.gradoNombre || data.gradoCursar} />
        </div>
        <Row label="Dirección Residencia" value={data.direccion} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 10px" }}><Row label="Tel. Fijo" value={data.telefonoFijo} /><Row label="Celular" value={data.telefonoCelular} /><Row label="Correo" value={data.correo} /></div>
      </Section>
      <Section title="2. DATOS DE LOS PADRES">
        <div style={{ marginBottom: 8 }}><div style={{ borderBottom: "1px solid #000", marginBottom: 4, paddingBottom: 2 }}><strong style={{ fontSize: 10, color: "#000" }}>2.1 MADRE — Vive: {sn(data.madreVive)}</strong></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}><Row label="Nombres y Apellidos" value={`${data.madreNombres} ${data.madreApellidos}`} /><Row label="Cédula" value={data.madreCedula} /><Row label="Teléfonos" value={`${data.madreTelFijo} / ${data.madreCelular}`} /><Row label="Profesión" value={data.madreProfesion} /></div><Row label="Dirección" value={data.madreDireccion} /></div>
        <div style={{ marginBottom: 8 }}><div style={{ borderBottom: "1px solid #000", marginBottom: 4, paddingBottom: 2 }}><strong style={{ fontSize: 10, color: "#000" }}>2.2 PADRE — Vive: {sn(data.padreVive)}</strong></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}><Row label="Nombres y Apellidos" value={`${data.padreNombres} ${data.padreApellidos}`} /><Row label="Cédula" value={data.padreCedula} /><Row label="Teléfonos" value={`${data.padreTelFijo} / ${data.padreCelular}`} /><Row label="Profesión" value={data.padreProfesion} /></div><Row label="Dirección" value={data.padreDireccion} /></div>
        <div style={{ fontSize: 10, color: "#000", padding: "6px", border: "1px solid #000" }}><strong>Estado Civil: </strong><span style={{ textTransform: "capitalize" }}>{data.situacionPadres}</span>&nbsp;&nbsp;|&nbsp;&nbsp;<strong>El estudiante vive con: </strong>{[data.viveConPadres && "padres", data.viveConMadre && "madre", data.viveConPadre && "padre", data.viveConFamiliar && "familiar", data.viveConAmigos && "amigos", data.viveSolo && "solo"].filter(Boolean).join(", ") || "—"}</div>
      </Section>
      {(data.representanteEs === "representante" || data.representanteEs === "otro") && (
        <Section title="3. DATOS DEL REPRESENTANTE LEGAL">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}><Row label="Nombres y Apellidos" value={`${data.repNombres} ${data.repApellidos}`} /><Row label="Cédula" value={data.repCI} /><Row label="Parentesco" value={data.repParentesco} /><Row label="Teléfonos" value={`${data.repTelFijo} / ${data.repCelular}`} /><Row label="Profesión" value={data.repProfesion} /></div><Row label="Dirección" value={data.repDireccion} />
        </Section>
      )}
      <Section title="4. DATOS COMPLEMENTARIOS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px", marginBottom: data.nuevoIngreso === "si" ? 6 : 0 }}>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Llega:</strong> {[data.llegaSolo && "Solo", data.llegaRepresentante && "Con Representante", data.llegaTransporte && "Con Transporte"].filter(Boolean).join(", ") || "—"}</div>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Se retira:</strong> {[data.retiraSolo && "Solo", data.retiraRepresentante && "Con Representante", data.retiraTransporte && "Con Transporte"].filter(Boolean).join(", ") || "—"}</div>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Nuevo Ingreso:</strong> {data.nuevoIngreso === "si" ? "Sí" : "No"}</div>
        </div>
        {data.nuevoIngreso === "si" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}><Row label="Plantel Procedencia" value={data.planteProcedencia} /><Row label="Años en Plantel" value={data.anosEnPlantel} /><Row label="Años Liceo" value={data.anosEnLiceo} /><Row label="Motivo Egreso" value={data.motivoEgreso} /><Row label="Otros Planteles" value={data.otrosPlanteles} /></div>
        )}
      </Section>
      <Section title="5. DATOS DE SALUD">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 10px", marginBottom: 8 }}><Row label="Factor RH" value={data.factorRH} /><Row label="G. Sanguíneo" value={data.grupoSanguineo} /><div style={{ fontSize: 10, color: "#000" }}><strong>Usa lentes:</strong> {sn(data.usaLentes)}</div><div style={{ fontSize: 10, color: "#000" }}><strong>Ortopédico:</strong> {sn(data.implementoOrtopedico)}</div></div>
        <div style={{ fontSize: 10, color: "#000", marginBottom: 8 }}><strong>Discapacidad:</strong> {check(data.discapacidadAuditiva)} Auditiva &nbsp; {check(data.discapacidadVisual)} Visual &nbsp; {check(data.discapacidadMotriz)} Motriz</div>
        <div style={{ borderTop: "1px dashed #000", paddingTop: 6, marginBottom: 6 }}><strong style={{ fontSize: 10, color: "#000" }}>Inmunizaciones:</strong><div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px 10px", marginTop: 4 }}>{vacunas.map(([key, label]) => (<div key={key} style={{ fontSize: 10, color: "#000" }}>{check(data[key] === "si")} {label}</div>))}</div></div>
        <div style={{ borderTop: "1px dashed #000", paddingTop: 6 }}><strong style={{ fontSize: 10, color: "#000" }}>Antecedentes:</strong><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 12px", marginTop: 4 }}><div style={{ fontSize: 10, color: "#000" }}>Asma: {sn(data.asma)}</div><div style={{ fontSize: 10, color: "#000" }}>Rinitis: {sn(data.renitis)}</div><div style={{ fontSize: 10, color: "#000" }}>Epilepsia: {sn(data.epilepsia)}</div><div style={{ fontSize: 10, color: "#000" }}>Alergias: {sn(data.alergiaMedicamento === "si" || data.alergiaAlimento === "si")}</div><div style={{ fontSize: 10, color: "#000" }}>Cirugía: {sn(data.cirugia)}</div><div style={{ fontSize: 10, color: "#000" }}>Medicado: {sn(data.medicado)}</div></div></div>
        <div style={{ marginTop: 10, fontSize: 10, color: "#000", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px", padding: "8px", border: "1px solid #000" }}><strong style={{ gridColumn: "span 2", marginBottom: 4, color: "#000" }}>EN CASO DE EMERGENCIA LLAMAR A:</strong><Row label="Nombre Completo" value={data.emergenciaNombre} /><Row label="Teléfono" value={data.emergenciaTelefono} /></div>
      </Section>
      <div style={{ marginTop: 15, fontSize: 9.5, color: "#000", textAlign: "justify", lineHeight: 1.4, padding: "10px", border: "1px solid #000" }}><strong>ACTA DE COMPROMISO:</strong><br/>ME COMPROMETO MEDIANTE LA PRESENTE A CUMPLIR CABALMENTE TODAS AQUELLAS DISPOSICIONES Y REGLAMENTOS EMANADAS EN MATERIA EDUCATIVA... ASI LOS ACEPTO Y FIRMO:</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 25, borderTop: "2px solid #000", paddingTop: 20 }}>{["Firma del Representante Legal","Sello y Firma del Director/a"].map(label => (<div key={label} style={{ textAlign: "center" }}><div style={{ borderBottom: "1px solid #000", marginBottom: 6, height: 25, width: "70%", margin: "0 auto" }}></div><div style={{ fontSize: 10, color: "#000", fontWeight: "bold" }}>{label}</div></div>))}</div>
    </div>
  );
});
PdfTemplate.displayName = "PdfTemplate";

// VISTA PRINCIPAL
const InscripcionPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const pdfRef = useRef(null);

  //  NUEVOS ESTADOS PARA VENEZUELA 
  const [venezuelaData, setVenezuelaData] = useState([]);
  const [availableMunicipios, setAvailableMunicipios] = useState([]);
  const [availableCiudades, setAvailableCiudades] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([])

  // Descarga el JSON de Venezuela cuando la página carga por primera vez
  React.useEffect(() => {
    fetch("https://raw.githubusercontent.com/zokeber/venezuela-json/master/venezuela.json")
      .then(res => res.json())
      .then(json => setVenezuelaData(json))
      .catch(err => console.error("Error al cargar datos de Venezuela:", err));
    api.get('grados/')
      .then(res => setGradosDisponibles(res.data))
      .catch(err => console.error("Error cargando grados:", err));
    }, []);

// Función inteligente que reacciona cuando eligen un Estado 
  const handleEstadoChange = (estadoSeleccionado) => {
    // Guardar el estado elegido y limpiamos municipio y ciudad anteriores
    set("estadoNac", estadoSeleccionado);
    set("municipioNac", "");
    set("ciudadNac", "");

    // Buscar en el JSON los datos de ese estado
    const estadoInfo = venezuelaData.find(e => e.estado === estadoSeleccionado);
    
    if (estadoInfo) {
      //  Extraer municipios de forma segura (por si acaso también falta el array)
      const municipios = (estadoInfo.municipios || [])
        .map(m => m.municipio)
        .sort();
      setAvailableMunicipios(municipios);

      // Tomar las ciudades (si no existen, usamos un arreglo vacío [])
      let listaCiudades = estadoInfo.ciudades || []; 
      
      // Agregamos obligatoriamente la Capital del Estado a las opciones de Ciudad
      if (estadoInfo.capital) {
        listaCiudades.push(estadoInfo.capital);
      }

      // Eliminar duplicados 
      const ciudadesUnicas = [...new Set(listaCiudades)].sort();
      
      setAvailableCiudades(ciudadesUnicas);
    } else {
      setAvailableMunicipios([]);
      setAvailableCiudades([]);
    }
  };
  // ------------------------------------

  const set = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrorMsg(""); 
  };

  // VALIDACIONES (Regex)
  const validateStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentStep === 1) {
      if (!data.nombres || !data.apellidos || !data.fechaNac || !data.cedula || !data.edad || !data.direccion || !data.gradoCursar) {
        return "Por favor, completa los campos obligatorios del estudiante.";
      }
      if (data.cedula.length < 9) return "La cédula del estudiante está incompleta.";
      if (data.correo && !emailRegex.test(data.correo)) return "El correo del estudiante no es válido.";
    }
    if (currentStep === 2) {
      if (data.madreVive === "si") {
        if (!data.madreNombres || !data.madreApellidos || !data.madreCedula) return "Faltan datos obligatorios de la madre.";
        if (data.madreCedula.length < 9) return "La cédula de la madre está incompleta.";
        if (data.madreCorreo && !emailRegex.test(data.madreCorreo)) return "El correo de la madre no es válido.";
      }
      if (data.padreVive === "si") {
        if (!data.padreNombres || !data.padreApellidos || !data.padreCedula) return "Faltan datos obligatorios del padre.";
        if (data.padreCedula.length < 9) return "La cédula del padre está incompleta.";
        if (data.padreCorreo && !emailRegex.test(data.padreCorreo)) return "El correo del padre no es válido.";
      }
    }
    if (currentStep === 3) {
      if ((data.representanteEs === "representante" || data.representanteEs === "otro")) {
        if (!data.repNombres || !data.repApellidos || !data.repCI || !data.repCelular || !data.repParentesco || !data.repDireccion) {
          return "Por favor, completa los campos obligatorios del representante.";
        }
        if (data.repCI.length < 9) return "La cédula del representante está incompleta.";
        if (data.repCelular.length < 15) return "El teléfono celular del representante está incompleto.";
        if (data.repCorreo && !emailRegex.test(data.repCorreo)) return "El correo del representante no es válido.";
      }
    }
    if (currentStep === 4) {
      if ((data.llegaTransporte || data.retiraTransporte)) {
        if (!data.transportistaRetira || !data.transportistaTelefono) return "Debe indicar los datos del transportista.";
        if (data.transportistaTelefono.length < 15) return "El teléfono del transportista está incompleto.";
      }
    }
    if (currentStep === 5) {
      if (!data.emergenciaNombre || !data.emergenciaTelefono) {
        return "Los datos de contacto de emergencia son obligatorios.";
      }
      if (data.emergenciaTelefono.length < 15) return "El teléfono de emergencia está incompleto.";
    }
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");
    setCurrentStep(s => Math.min(STEPS.length, s + 1));
  };

  const handleGeneratePDF = async () => {
    const err = validateStep();
    if (err) { setErrorMsg(err); return; }

    setIsGenerating(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pageWidth;
      let imgHeight = (canvas.height * pageWidth) / canvas.width;
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgWidth * (pageHeight / imgHeight);
      }
      pdf.addImage(imgData, "JPEG", (pageWidth - imgWidth) / 2, 0, imgWidth, imgHeight);

      const nombre = `Ficha_Inscripcion_${data.apellidos}_${data.nombres}.pdf`;
      pdf.save(nombre);
      
      const formData = new FormData();
      formData.append("archivo_pdf", pdf.output("blob"), nombre);
      formData.append("nombre", data.nombres);
      formData.append("apellido", data.apellidos);
      formData.append("cedula", data.cedula);
      formData.append("grado_cursar", data.gradoCursar);

      await api.post('registro-inscripciones/', formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

      setDone(true);
    } catch (err) {
console.error("Error detallado:", err.response?.data || err);
      alert("Hubo un error al procesar o guardar el PDF en el servidor.")
    } finally {
      setIsGenerating(false);
    }
  };

  const stepComponents = [
    <StepEstudiante 
      key="step1" 
      data={data} 
      set={set} 
      venezuelaData={venezuelaData}
      availableMunicipios={availableMunicipios}
      availableCiudades={availableCiudades}
      handleEstadoChange={handleEstadoChange}
      gradosDisponibles={gradosDisponibles}
    />,
    <StepPadres key="step2" data={data} set={set} />,
    <StepRepresentante key="step3" data={data} set={set} />,
    <StepComplementarios key="step4" data={data} set={set} />,
    <StepSalud key="step5" data={data} set={set} />,
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <div className="bg-[#1B3A57] text-white pt-24 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "16px 16px" }}></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Formulario de Inscripción</h1>
          <p className="text-gray-300 text-sm">Complete todos los campos obligatorios (*) y descargue su ficha en PDF al finalizar.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0">
              <div className="h-full bg-[#C62828] transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
            </div>
            {STEPS.map(step => (
              <div key={step.id} className="flex flex-col items-center gap-2 z-10" onClick={() => currentStep > step.id && setCurrentStep(step.id)} style={{ cursor: currentStep > step.id ? "pointer" : "default" }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${currentStep > step.id ? "bg-[#C62828] border-[#C62828] text-white" : currentStep === step.id ? "bg-[#1B3A57] border-[#1B3A57] text-white shadow-lg scale-110" : "bg-white border-gray-300 text-gray-400"}`}>
                  {currentStep > step.id ? <CheckCircle size={18} /> : <step.icon size={16} />}
                </div>
                <span className={`text-xs font-semibold hidden md:block ${currentStep === step.id ? "text-[#1B3A57]" : "text-gray-400"}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold border border-red-200 animate-pulse"><AlertCircle size={18} /> {errorMsg}</div>}
          {stepComponents[currentStep - 1]}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => { setErrorMsg(""); setCurrentStep(s => Math.max(1, s - 1)); }} disabled={currentStep === 1} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"><ArrowLeft size={16} /> Anterior</button>
          {currentStep < STEPS.length ? (
            <button onClick={handleNextStep} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A57] text-white text-sm font-bold hover:bg-[#16304a] transition shadow-md">Siguiente <ChevronRight size={16} /></button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button onClick={handleGeneratePDF} disabled={isGenerating} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#C62828] text-white text-sm font-bold hover:bg-[#B71C1C] disabled:opacity-60 transition shadow-lg">
                {isGenerating ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span> Generando...</> : <><Download size={16} /> Descargar PDF</>}
              </button>
              {done && <p className="text-green-600 text-xs font-semibold animate-pulse">✓ ¡PDF guardado!</p>}
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}><PdfTemplate ref={pdfRef} data={data} /></div>
      <Footer />
    </div>
  );
};

export default InscripcionPage;