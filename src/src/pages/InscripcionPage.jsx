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

// Estado inicial
const initialData = {
  // Fotos
  fotoEstudiante: null,
  fotoMadre: null,
  fotoPadre: null,
  fotoRepresentante: null,
  // Paso 1: Estudiante
  nombres: "", apellidos: "", sexo: "M",
  ciudadNac: "", municipioNac: "", estadoNac: "", nacionalidad: "",
  fechaNac: "", cedula: "", edad: "", estatura: "", peso: "",
  direccion: "", telefonoFijo: "", telefonoCelular: "", correo: "",
  gradoCursar: "",
  // Paso 2: Madre
  madreVive: "si",
  madreNombres: "", madreApellidos: "", madreCedula: "",
  madreTelFijo: "", madreCelular: "", madreCorreo: "",
  madreDireccion: "", madreGradoInstruccion: "", madreProfesion: "",
  madreEjerce: "si", madreDirOficina: "", madreTelOficina: "",
  // Paso 2: Padre
  padreVive: "si",
  padreNombres: "", padreApellidos: "", padreCedula: "",
  padreTelFijo: "", padreCelular: "", padreCorreo: "",
  padreDireccion: "", padreGradoInstruccion: "", padreProfesion: "",
  padreEjerce: "si", padreDirOficina: "", padreTelOficina: "",
  situacionPadres: "casados",
  // Paso 2: con quién vive
  viveConPadres: true, viveConMadre: false, viveConPadre: false,
  viveConFamiliar: false, viveConAmigos: false, viveSolo: false,
  // Paso 3: Representante Legal
  representanteEs: "padre",
  repNombres: "", repApellidos: "", repCI: "", repDireccion: "",
  repTelFijo: "", repCelular: "", repCorreo: "",
  repParentesco: "", repGradoInstruccion: "", repProfesion: "",
  repEjerce: "si", repDirOficina: "", repTelOficina: "",
  // Paso 4: Datos complementarios
  nuevoIngreso: "si",
  llegaSolo: true, llegaRepresentante: false, llegaTransporte: false,
  retiraSolo: true, retiraRepresentante: false, retiraTransporte: false,
  transportistaRetira: "", transportistaTelefono: "",
  anosEnLiceo: "", planteProcedencia: "", anosEnPlantel: "", motivoEgreso: "",
  otrosPlanteles: "",
  actividadExtracurricular: "no", actividadCual: "",
  religion: "", actividadCultural: "no", actividadCulturalCual: "",
  instrumento: "no", instrumentoCual: "",
  deporte: "no", deporteCual: "",
  // Paso 5: Salud
  factorRH: "", grupoSanguineo: "",
  usaLentes: "no", implementoOrtopedico: "no",
  discapacidadAuditiva: false, discapacidadVisual: false, discapacidadMotriz: false,
  alergico: "no", alergicoCuales: "",
  // Vacunas
  vacBCG: "no", vacPolio: "no", vacDifteria: "no", vacTetano: "no",
  vacTosferina: "no", vacHemofilos: "no", vacMeningococo: "no",
  vacNeumococo: "no", vacRubeola: "no", vacSarampion: "no",
  vacParotidilis: "no", vacVaricela: "no", vacAntigripal: "no",
  vacAntiamarilica: "no", vacHepatitisA: "no", vacHepatitisB: "no",
  // Antecedentes
  asma: "no", renitis: "no", otrasResp: "",
  cardiopatia: "no", cardiopatiaCual: "",
  alergiaMedicamento: "no", alergiaMedicamentoCual: "",
  alergiaAlimento: "no", alergiaAlimentoCual: "",
  epilepsia: "no", otrosNeurologicos: "",
  cirugia: "no", cirugiaCual: "",
  actividadRestringida: "no", actividadRestringidaCual: "",
  medicado: "no", medicamentos: "",
  emergenciaNombre: "", emergenciaTelefono: "",
};

// PAsos
const STEPS = [
  { id: 1, label: "Estudiante", icon: User },
  { id: 2, label: "Padres", icon: Users },
  { id: 3, label: "Representante", icon: FileText },
  { id: 4, label: "Complementarios", icon: BookOpen },
  { id: 5, label: "Salud", icon: Heart },
];

// Helpers
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
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition"
    {...props}
  />
);

const Select = ({ value, onChange, children, ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57] transition"
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

const YesNoRow = ({ label, value, onChange }) => (
  <div className="flex items-center gap-4">
    <span className="text-sm font-semibold text-gray-700 min-w-[120px]">{label}</span>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="radio" name={label} value="si" checked={value === "si"} onChange={() => onChange("si")} className="accent-[#1B3A57]" />
      <span className="text-sm">Sí</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="radio" name={label} value="no" checked={value === "no"} onChange={() => onChange("no")} className="accent-[#1B3A57]" />
      <span className="text-sm">No</span>
    </label>
  </div>
);

const ImageUpload = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
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
            <button 
              type="button" 
              onClick={() => onChange(null)} 
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition shadow"
            >
              <X size={12} strokeWidth={3} />
            </button>
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

// ESTUDIANTE
const StepEstudiante = ({ data, set }) => (
  <div className="space-y-6">
    <SectionTitle>1. Datos del Estudiante</SectionTitle>
    
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <ImageUpload label="Foto (Opcional)" value={data.fotoEstudiante} onChange={v => set("fotoEstudiante", v)} />
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Field label="Nombres" required><Input value={data.nombres} onChange={e => set("nombres", e.target.value)} placeholder="Nombres completos" /></Field>
        <Field label="Apellidos" required><Input value={data.apellidos} onChange={e => set("apellidos", e.target.value)} placeholder="Apellidos completos" /></Field>
        <Field label="Cédula de Identidad" required><Input value={data.cedula} onChange={e => set("cedula", e.target.value)} placeholder="V-00.000.000" /></Field>
        <Field label="Sexo">
          <Select value={data.sexo} onChange={e => set("sexo", e.target.value)}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </Select>
        </Field>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Ciudad de Nacimiento"><Input value={data.ciudadNac} onChange={e => set("ciudadNac", e.target.value)} placeholder="Ciudad" /></Field>
      <Field label="Municipio"><Input value={data.municipioNac} onChange={e => set("municipioNac", e.target.value)} placeholder="Municipio" /></Field>
      <Field label="Estado"><Input value={data.estadoNac} onChange={e => set("estadoNac", e.target.value)} placeholder="Estado" /></Field>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Nacionalidad"><Input value={data.nacionalidad} onChange={e => set("nacionalidad", e.target.value)} placeholder="Venezolano/a" /></Field>
      <Field label="Fecha de Nacimiento" required><Input type="date" value={data.fechaNac} onChange={e => set("fechaNac", e.target.value)} /></Field>
      <Field label="Edad (años)" required><Input type="number" value={data.edad} onChange={e => set("edad", e.target.value)} placeholder="Ej: 14" /></Field>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      <Field label="Estatura (mts)"><Input type="number" step="0.01" value={data.estatura} onChange={e => set("estatura", e.target.value)} placeholder="1.65" /></Field>
      <Field label="Peso (kg)"><Input type="number" value={data.peso} onChange={e => set("peso", e.target.value)} placeholder="60" /></Field>
    </div>
    <Field label="Dirección de Residencia" required>
      <Input value={data.direccion} onChange={e => set("direccion", e.target.value)} placeholder="Dirección completa" />
    </Field>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Teléfono Fijo"><Input value={data.telefonoFijo} onChange={e => set("telefonoFijo", e.target.value)} placeholder="(0212) 000-0000" /></Field>
      <Field label="Teléfono Celular"><Input value={data.telefonoCelular} onChange={e => set("telefonoCelular", e.target.value)} placeholder="(0414) 000-0000" /></Field>
      <Field label="Correo Electrónico"><Input type="email" value={data.correo} onChange={e => set("correo", e.target.value)} placeholder="correo@ejemplo.com" /></Field>
    </div>
    <Field label="Grado a Cursar" className="md:w-1/3" required>
      <Select value={data.gradoCursar} onChange={e => set("gradoCursar", e.target.value)}>
        <option value="">— Seleccione —</option>
        <option>1er Año</option><option>2do Año</option><option>3er Año</option>
        <option>4to Año</option><option>5to Año</option>
        <option>1er Grado</option><option>2do Grado</option><option>3er Grado</option>
        <option>4to Grado</option><option>5to Grado</option><option>6to Grado</option>
      </Select>
    </Field>
  </div>
);

//PADRES 
const StepPadres = ({ data, set }) => (
  <div className="space-y-8">
    {/* MADRE */}
    <div>
      <SectionTitle>2.1 Datos de la Madre</SectionTitle>
      <div className="flex gap-6 mb-4">
        <YesNoRow label="¿Vive?" value={data.madreVive} onChange={v => set("madreVive", v)} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
        {data.madreVive === "si" && (
          <ImageUpload label="Foto (Opcional)" value={data.fotoMadre} onChange={v => set("fotoMadre", v)} />
        )}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Field label="Nombres" required={data.madreVive === "si"}><Input value={data.madreNombres} onChange={e => set("madreNombres", e.target.value)} placeholder="Nombres" disabled={data.madreVive === "no"} /></Field>
          <Field label="Apellidos" required={data.madreVive === "si"}><Input value={data.madreApellidos} onChange={e => set("madreApellidos", e.target.value)} placeholder="Apellidos" disabled={data.madreVive === "no"} /></Field>
          <Field label="Cédula" required={data.madreVive === "si"} className="md:col-span-2"><Input value={data.madreCedula} onChange={e => set("madreCedula", e.target.value)} placeholder="V-00.000.000" disabled={data.madreVive === "no"} /></Field>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Teléfono Fijo"><Input value={data.madreTelFijo} onChange={e => set("madreTelFijo", e.target.value)} disabled={data.madreVive === "no"} /></Field>
        <Field label="Teléfono Celular"><Input value={data.madreCelular} onChange={e => set("madreCelular", e.target.value)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Correo Electrónico"><Input type="email" value={data.madreCorreo} onChange={e => set("madreCorreo", e.target.value)} disabled={data.madreVive === "no"} /></Field>
        <Field label="Dirección"><Input value={data.madreDireccion} onChange={e => set("madreDireccion", e.target.value)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Grado de Instrucción"><Input value={data.madreGradoInstruccion} onChange={e => set("madreGradoInstruccion", e.target.value)} placeholder="Ej: Universitaria" disabled={data.madreVive === "no"} /></Field>
        <Field label="Profesión"><Input value={data.madreProfesion} onChange={e => set("madreProfesion", e.target.value)} disabled={data.madreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-4 mt-6">
          <YesNoRow label="¿Ejerce?" value={data.madreEjerce} onChange={v => set("madreEjerce", v)} />
        </div>
        <Field label="Dir. de Oficina"><Input value={data.madreDirOficina} onChange={e => set("madreDirOficina", e.target.value)} disabled={data.madreVive === "no" || data.madreEjerce === "no"} /></Field>
      </div>
    </div>

    {/* PADRE */}
    <div>
      <SectionTitle>2.2 Datos del Padre</SectionTitle>
      <div className="flex gap-6 mb-4">
        <YesNoRow label="¿Vive?" value={data.padreVive} onChange={v => set("padreVive", v)} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
        {data.padreVive === "si" && (
          <ImageUpload label="Foto (Opcional)" value={data.fotoPadre} onChange={v => set("fotoPadre", v)} />
        )}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Field label="Nombres" required={data.padreVive === "si"}><Input value={data.padreNombres} onChange={e => set("padreNombres", e.target.value)} placeholder="Nombres" disabled={data.padreVive === "no"} /></Field>
          <Field label="Apellidos" required={data.padreVive === "si"}><Input value={data.padreApellidos} onChange={e => set("padreApellidos", e.target.value)} placeholder="Apellidos" disabled={data.padreVive === "no"} /></Field>
          <Field label="Cédula" required={data.padreVive === "si"} className="md:col-span-2"><Input value={data.padreCedula} onChange={e => set("madreCedula", e.target.value)} placeholder="V-00.000.000" disabled={data.padreVive === "no"} /></Field>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Teléfono Fijo"><Input value={data.padreTelFijo} onChange={e => set("padreTelFijo", e.target.value)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Teléfono Celular"><Input value={data.padreCelular} onChange={e => set("padreCelular", e.target.value)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Correo Electrónico"><Input type="email" value={data.padreCorreo} onChange={e => set("padreCorreo", e.target.value)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Dirección"><Input value={data.padreDireccion} onChange={e => set("padreDireccion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Grado de Instrucción"><Input value={data.padreGradoInstruccion} onChange={e => set("padreGradoInstruccion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
        <Field label="Profesión"><Input value={data.padreProfesion} onChange={e => set("padreProfesion", e.target.value)} disabled={data.padreVive === "no"} /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-4 mt-6">
          <YesNoRow label="¿Ejerce?" value={data.padreEjerce} onChange={v => set("padreEjerce", v)} />
        </div>
        <Field label="Dir. de Oficina"><Input value={data.padreDirOficina} onChange={e => set("padreDirOficina", e.target.value)} disabled={data.padreVive === "no" || data.padreEjerce === "no"} /></Field>
      </div>
    </div>

    {/* SITUACIÓN */}
    <div>
      <SectionTitle>2.3 Situación de los Padres</SectionTitle>
      <Field label="Estado Civil">
        <Select value={data.situacionPadres} onChange={e => set("situacionPadres", e.target.value)}>
          <option value="casados">Casados</option>
          <option value="separados">Separados</option>
          <option value="viudo">Viudo/a</option>
          <option value="divorciado">Divorciado/a</option>
          <option value="soltero">Soltero/a</option>
          <option value="otros">Otros</option>
        </Select>
      </Field>
      <div className="mt-4">
        <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider block mb-2">El estudiante vive con:</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ["viveConPadres", "Sus Padres"], ["viveConMadre", "Su Madre"],
            ["viveConPadre", "Su Padre"], ["viveConFamiliar", "Un Familiar"],
            ["viveConAmigos", "Amigos"], ["viveSolo", "Solo/a"],
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

// REPRESENTANTE
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
            <ImageUpload label="Foto (Opcional)" value={data.fotoRepresentante} onChange={v => set("fotoRepresentante", v)} />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Field label="Nombres" required><Input value={data.repNombres} onChange={e => set("repNombres", e.target.value)} /></Field>
              <Field label="Apellidos" required><Input value={data.repApellidos} onChange={e => set("repApellidos", e.target.value)} /></Field>
              <Field label="Cédula" required><Input value={data.repCI} onChange={e => set("repCI", e.target.value)} /></Field>
              <Field label="Parentesco" required><Input value={data.repParentesco} onChange={e => set("repParentesco", e.target.value)} /></Field>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Teléfono Celular" required><Input value={data.repCelular} onChange={e => set("repCelular", e.target.value)} /></Field>
            <Field label="Teléfono Fijo"><Input value={data.repTelFijo} onChange={e => set("repTelFijo", e.target.value)} /></Field>
            <Field label="Correo Electrónico"><Input type="email" value={data.repCorreo} onChange={e => set("repCorreo", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Dirección" required><Input value={data.repDireccion} onChange={e => set("repDireccion", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Grado de Instrucción"><Input value={data.repGradoInstruccion} onChange={e => set("repGradoInstruccion", e.target.value)} /></Field>
            <Field label="Profesión"><Input value={data.repProfesion} onChange={e => set("repProfesion", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 mt-6">
              <YesNoRow label="¿Ejerce?" value={data.repEjerce} onChange={v => set("repEjerce", v)} />
            </div>
            <Field label="Dir. de Oficina"><Input value={data.repDirOficina} onChange={e => set("repDirOficina", e.target.value)} disabled={data.repEjerce === "no"} /></Field>
          </div>
        </div>
      )}
    </div>
  </div>
);

// COMPLEMENTARIOS
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
            <label key={k} className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57]" />
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-[#1B3A57] uppercase tracking-wider block mb-2">Se retira del Liceo:</label>
          {[["retiraSolo","Solo/a"],["retiraRepresentante","Con representante"],["retiraTransporte","Con transporte"]].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57]" />
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
      </div>
      {(data.retiraTransporte || data.llegaTransporte) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
          <Field label="Nombre del transportista" required><Input value={data.transportistaRetira} onChange={e => set("transportistaRetira", e.target.value)} /></Field>
          <Field label="Teléfono" required><Input value={data.transportistaTelefono} onChange={e => set("transportistaTelefono", e.target.value)} /></Field>
        </div>
      )}

      {data.nuevoIngreso === "si" && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Años en el Liceo"><Input type="number" value={data.anosEnLiceo} onChange={e => set("anosEnLiceo", e.target.value)} /></Field>
            <Field label="Plantel de Procedencia"><Input value={data.planteProcedencia} onChange={e => set("planteProcedencia", e.target.value)} /></Field>
            <Field label="Años en ese Plantel"><Input type="number" value={data.anosEnPlantel} onChange={e => set("anosEnPlantel", e.target.value)} /></Field>
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
          <div className="space-y-1">
            <YesNoRow label="Actividad extracurricular" value={data.actividadExtracurricular} onChange={v => set("actividadExtracurricular", v)} />
            {data.actividadExtracurricular === "si" && <Input value={data.actividadCual} onChange={e => set("actividadCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
          <Field label="Religión que profesa"><Input value={data.religion} onChange={e => set("religion", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <YesNoRow label="Actividad cultural/artística" value={data.actividadCultural} onChange={v => set("actividadCultural", v)} />
            {data.actividadCultural === "si" && <Input value={data.actividadCulturalCual} onChange={e => set("actividadCulturalCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
          <div className="space-y-1">
            <YesNoRow label="Toca instrumento musical" value={data.instrumento} onChange={v => set("instrumento", v)} />
            {data.instrumento === "si" && <Input value={data.instrumentoCual} onChange={e => set("instrumentoCual", e.target.value)} placeholder="¿Cuál?" />}
          </div>
        </div>
        <div className="space-y-1">
          <YesNoRow label="Practica algún deporte" value={data.deporte} onChange={v => set("deporte", v)} />
          {data.deporte === "si" && <Input value={data.deporteCual} onChange={e => set("deporteCual", e.target.value)} placeholder="¿Cuál?" className="max-w-xs" />}
        </div>
      </div>
    </div>
  </div>
);

// SALUD
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
          <Field label="Factor RH"><Input value={data.factorRH} onChange={e => set("factorRH", e.target.value)} placeholder="Ej: +" /></Field>
          <Field label="Grupo Sanguíneo"><Input value={data.grupoSanguineo} onChange={e => set("grupoSanguineo", e.target.value)} placeholder="Ej: O" /></Field>
        </div>
        <div className="mt-4 space-y-3">
          <YesNoRow label="Usa lentes correctivos" value={data.usaLentes} onChange={v => set("usaLentes", v)} />
          <YesNoRow label="Usa implemento ortopédico" value={data.implementoOrtopedico} onChange={v => set("implementoOrtopedico", v)} />
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 min-w-[120px]">Discapacidad:</span>
            {[["discapacidadAuditiva","Auditiva"],["discapacidadVisual","Visual"],["discapacidadMotriz","Motriz"]].map(([k,l]) => (
              <label key={k} className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={data[k]} onChange={e => set(k, e.target.checked)} className="accent-[#1B3A57]" />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
          <div className="space-y-1">
            <YesNoRow label="Es alérgico (animal/vegetal/mineral)" value={data.alergico} onChange={v => set("alergico", v)} />
            {data.alergico === "si" && <Input value={data.alergicoCuales} onChange={e => set("alergicoCuales", e.target.value)} placeholder="¿A cuáles?" />}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>5.1 Inmunizaciones</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vacunas.map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${data[key] === "si" ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"}`}>
              <input type="checkbox" checked={data[key] === "si"} onChange={e => set(key, e.target.checked ? "si" : "no")} className="accent-green-600 w-4 h-4" />
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>5.2 Antecedentes Personales</SectionTitle>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold uppercase text-gray-500 mb-3">Enfermedades Respiratorias</p>
            <div className="space-y-2">
              <YesNoRow label="Sufre de Asma" value={data.asma} onChange={v => set("asma", v)} />
              <YesNoRow label="Sufre de Rinitis" value={data.renitis} onChange={v => set("renitis", v)} />
              <Field label="Otras"><Input value={data.otrasResp} onChange={e => set("otrasResp", e.target.value)} /></Field>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <YesNoRow label="Cardiopatía congénita" value={data.cardiopatia} onChange={v => set("cardiopatia", v)} />
              {data.cardiopatia === "si" && <Input value={data.cardiopatiaCual} onChange={e => set("cardiopatiaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-1">
              <YesNoRow label="Alergia a medicamentos" value={data.alergiaMedicamento} onChange={v => set("alergiaMedicamento", v)} />
              {data.alergiaMedicamento === "si" && <Input value={data.alergiaMedicamentoCual} onChange={e => set("alergiaMedicamentoCual", e.target.value)} placeholder="¿Cuáles?" />}
            </div>
            <div className="space-y-1">
              <YesNoRow label="Alergia a alimentos" value={data.alergiaAlimento} onChange={v => set("alergiaAlimento", v)} />
              {data.alergiaAlimento === "si" && <Input value={data.alergiaAlimentoCual} onChange={e => set("alergiaAlimentoCual", e.target.value)} placeholder="¿Cuáles?" />}
            </div>
            <div className="space-y-1">
              <YesNoRow label="Epilepsia / Convulsiones" value={data.epilepsia} onChange={v => set("epilepsia", v)} />
            </div>
            <div className="space-y-1">
              <YesNoRow label="Intervención quirúrgica" value={data.cirugia} onChange={v => set("cirugia", v)} />
              {data.cirugia === "si" && <Input value={data.cirugiaCual} onChange={e => set("cirugiaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-1">
              <YesNoRow label="Actividad restringida por médico" value={data.actividadRestringida} onChange={v => set("actividadRestringida", v)} />
              {data.actividadRestringida === "si" && <Input value={data.actividadRestringidaCual} onChange={e => set("actividadRestringidaCual", e.target.value)} placeholder="¿Cuál?" />}
            </div>
            <div className="space-y-1">
              <YesNoRow label="Está medicado actualmente" value={data.medicado} onChange={v => set("medicado", v)} />
              {data.medicado === "si" && <Input value={data.medicamentos} onChange={e => set("medicamentos", e.target.value)} placeholder="¿Cuáles medicamentos?" />}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-red-50 rounded-xl border border-red-100">
            <Field label="En caso de emergencia, llamar a:" required><Input value={data.emergenciaNombre} onChange={e => set("emergenciaNombre", e.target.value)} placeholder="Nombre completo" /></Field>
            <Field label="Teléfono de emergencia" required><Input value={data.emergenciaTelefono} onChange={e => set("emergenciaTelefono", e.target.value)} placeholder="(0414) 000-0000" /></Field>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF TEMPLATE (esto es para crear el pdf)
const PdfTemplate = React.forwardRef(({ data }, ref) => {
  const sn = (val) => val === "si" ? "✓ Sí  ☐ No" : "☐ Sí  ✓ No";
  const check = (val) => val ? "☑" : "☐";

  const vacunas = [
    ["vacBCG","BCG"],["vacPolio","Polio"],["vacDifteria","Difteria"],["vacTetano","Tétano"],
    ["vacTosferina","Tosferina"],["vacHemofilos","Antihemofilos"],["vacMeningococo","Antimeningococo"],
    ["vacNeumococo","Antineumococo"],["vacRubeola","Rubéola"],["vacSarampion","Sarampión"],
    ["vacParotidilis","Parotiditis"],["vacVaricela","Varicela"],["vacAntigripal","Antigripal"],
    ["vacAntiamarilica","Antiamarílica"],["vacHepatitisA","Hepatitis A"],["vacHepatitisB","Hepatitis B"],
  ];

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ background: "#f1f5f9", border: "1px solid #000", color: "#000", padding: "4px 8px", fontWeight: "bold", fontSize: 11, marginBottom: 6, textTransform: "uppercase" }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "baseline" }}>
      <span style={{ fontSize: 10, color: "#000", minWidth: 110, fontWeight: "bold" }}>{label}:</span>
      <span style={{ fontSize: 11, borderBottom: "1px solid #000", color: "#000", flex: 1, paddingBottom: 4 }}>{value || ""}</span>
    </div>
  );

  // logica para mostrar foto de representante
  const fotoRepAMostrar = data.representanteEs === "madre" ? data.fotoMadre :
                          data.representanteEs === "padre" ? data.fotoPadre :
                          data.fotoRepresentante;

  return (
    <div ref={ref} style={{ width: "210mm", height: "auto", background: "white", padding: "12mm 15mm", fontFamily: "Arial, sans-serif", fontSize: 10, color: "#000", boxSizing: "border-box" }}>
      {/* HEADER CON MEMBRETE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {/* LOGO */}
          <img src="https://i.imgur.com/yoiUI2Z.png" alt="Logo UEN José Ángel Álamo" style={{ width: 65, height: 65, objectFit: "contain" }} crossOrigin="anonymous" />
          
          <div style={{ textAlign: "center", lineHeight: 1.2 }}>
            <div style={{ fontSize: 10, fontWeight: "bold", color: "#000" }}>
              REPUBLICA BOLIVARIANA DE VENEZUELA<br/>
              MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN<br/>
              LICEO JOSE ANGEL ALAMO<br/>
              LA CANDELARIA-EDO. MIRANDA
            </div>
            <div style={{ fontSize: 15, fontWeight: "900", color: "#000", letterSpacing: 0.5, marginTop: 6 }}>FICHA DE INSCRIPCIÓN</div>
            <div style={{ fontSize: 10, marginTop: 4, color: "#000" }}>
              <strong>Año Escolar:</strong> {new Date().getFullYear() + "-" + (new Date().getFullYear() + 1)} &nbsp;&nbsp;|&nbsp;&nbsp; 
              <strong>Fecha:</strong> {new Date().toLocaleDateString("es-VE")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Foto Estudiante PDF */}
          <div style={{ width: 60, height: 75, border: "1px dashed #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, textAlign: "center", color: "#000", whiteSpace: "pre-wrap", overflow: "hidden" }}>
            {data.fotoEstudiante ? <img src={data.fotoEstudiante} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="Estudiante" /> : "Foto\nEstudiante"}
          </div>
          {/* Foto Representante PDF */}
          <div style={{ width: 60, height: 75, border: "1px dashed #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, textAlign: "center", color: "#000", whiteSpace: "pre-wrap", overflow: "hidden" }}>
            {fotoRepAMostrar ? <img src={fotoRepAMostrar} style={{width: "100%", height: "100%", objectFit: "cover"}} alt="Representante" /> : "Foto\nRepresentante"}
          </div>
        </div>
      </div>

      {/* DATOS ESTUDIANTE */}
      <Section title="1. DATOS DEL ESTUDIANTE">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
          <Row label="Nombres" value={data.nombres} />
          <Row label="Apellidos" value={data.apellidos} />
          <Row label="Sexo" value={data.sexo === "M" ? "Masculino" : "Femenino"} />
          <Row label="Lugar Nacimiento" value={`${data.ciudadNac} ${data.estadoNac ? '- ' + data.estadoNac : ''}`} />
          <Row label="Fecha Nacimiento" value={data.fechaNac} />
          <Row label="Nacionalidad" value={data.nacionalidad} />
          <Row label="Cédula" value={data.cedula} />
          <Row label="Edad" value={data.edad ? `${data.edad} años` : ""} />
          <Row label="Estatura / Peso" value={`${data.estatura ? data.estatura + " mts" : ""} / ${data.peso ? data.peso + " kg" : ""}`} />
          <Row label="Grado a Cursar" value={data.gradoCursar} />
        </div>
        <Row label="Dirección Residencia" value={data.direccion} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 10px" }}>
          <Row label="Tel. Fijo" value={data.telefonoFijo} />
          <Row label="Celular" value={data.telefonoCelular} />
          <Row label="Correo" value={data.correo} />
        </div>
      </Section>

      {/* DATOS PADRES */}
      <Section title="2. DATOS DE LOS PADRES">
        <div style={{ marginBottom: 8 }}>
          <div style={{ borderBottom: "1px solid #000", marginBottom: 4, paddingBottom: 2 }}>
             <strong style={{ fontSize: 10, color: "#000" }}>2.1 MADRE — Vive: {sn(data.madreVive)}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
            <Row label="Nombres y Apellidos" value={`${data.madreNombres} ${data.madreApellidos}`} />
            <Row label="Cédula" value={data.madreCedula} />
            <Row label="Teléfonos" value={`${data.madreTelFijo} / ${data.madreCelular}`} />
            <Row label="Profesión" value={data.madreProfesion} />
          </div>
          <Row label="Dirección" value={data.madreDireccion} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ borderBottom: "1px solid #000", marginBottom: 4, paddingBottom: 2 }}>
             <strong style={{ fontSize: 10, color: "#000" }}>2.2 PADRE — Vive: {sn(data.padreVive)}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
            <Row label="Nombres y Apellidos" value={`${data.padreNombres} ${data.padreApellidos}`} />
            <Row label="Cédula" value={data.padreCedula} />
            <Row label="Teléfonos" value={`${data.padreTelFijo} / ${data.padreCelular}`} />
            <Row label="Profesión" value={data.padreProfesion} />
          </div>
          <Row label="Dirección" value={data.padreDireccion} />
        </div>

        <div style={{ fontSize: 10, color: "#000", padding: "6px", border: "1px solid #000" }}>
          <strong>Estado Civil: </strong><span style={{ textTransform: "capitalize" }}>{data.situacionPadres}</span>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <strong>El estudiante vive con: </strong>
          {[data.viveConPadres && "sus padres", data.viveConMadre && "su madre", data.viveConPadre && "su padre", data.viveConFamiliar && "un familiar", data.viveConAmigos && "amigos", data.viveSolo && "solo/a"].filter(Boolean).join(", ") || "—"}
        </div>
      </Section>

      {/* REPRESENTANTE */}
      {(data.representanteEs === "representante" || data.representanteEs === "otro") && (
        <Section title="3. DATOS DEL REPRESENTANTE LEGAL">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
            <Row label="Nombres y Apellidos" value={`${data.repNombres} ${data.repApellidos}`} />
            <Row label="Cédula" value={data.repCI} />
            <Row label="Parentesco" value={data.repParentesco} />
            <Row label="Teléfonos" value={`${data.repTelFijo} / ${data.repCelular}`} />
            <Row label="Profesión" value={data.repProfesion} />
          </div>
          <Row label="Dirección" value={data.repDireccion} />
        </Section>
      )}

      {/* DATOS COMPLEMENTARIOS */}
      <Section title="4. DATOS COMPLEMENTARIOS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px", marginBottom: data.nuevoIngreso === "si" ? 6 : 0 }}>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Llega:</strong> {[data.llegaSolo && "Solo", data.llegaRepresentante && "Con Representante", data.llegaTransporte && "Con Transporte"].filter(Boolean).join(", ") || "—"}</div>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Se retira:</strong> {[data.retiraSolo && "Solo", data.retiraRepresentante && "Con Representante", data.retiraTransporte && "Con Transporte"].filter(Boolean).join(", ") || "—"}</div>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Nuevo Ingreso:</strong> {data.nuevoIngreso === "si" ? "Sí" : "No"}</div>
        </div>
        {data.nuevoIngreso === "si" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px" }}>
            <Row label="Plantel Procedencia" value={data.planteProcedencia} />
            <Row label="Años en Plantel" value={data.anosEnPlantel} />
            <Row label="Años en el Liceo" value={data.anosEnLiceo} />
            <Row label="Motivo de Egreso" value={data.motivoEgreso} />
            <Row label="Otros Planteles" value={data.otrosPlanteles} />
          </div>
        )}
      </Section>

      {/* SALUD */}
      <Section title="5. DATOS DE SALUD">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 10px", marginBottom: 8 }}>
          <Row label="Factor RH" value={data.factorRH} />
          <Row label="G. Sanguíneo" value={data.grupoSanguineo} />
          <div style={{ fontSize: 10, color: "#000" }}><strong>Usa lentes:</strong> {sn(data.usaLentes)}</div>
          <div style={{ fontSize: 10, color: "#000" }}><strong>Ortopédico:</strong> {sn(data.implementoOrtopedico)}</div>
        </div>
        <div style={{ fontSize: 10, color: "#000", marginBottom: 8 }}>
          <strong>Discapacidad:</strong> {check(data.discapacidadAuditiva)} Auditiva &nbsp; {check(data.discapacidadVisual)} Visual &nbsp; {check(data.discapacidadMotriz)} Motriz
        </div>
        
        <div style={{ borderTop: "1px dashed #000", paddingTop: 6, marginBottom: 6 }}>
          <strong style={{ fontSize: 10, color: "#000" }}>Inmunizaciones:</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px 10px", marginTop: 4 }}>
            {vacunas.map(([key, label]) => (
              <div key={key} style={{ fontSize: 10, color: "#000" }}>{check(data[key] === "si")} {label}</div>
            ))}
          </div>
        </div>
        
        <div style={{ borderTop: "1px dashed #000", paddingTop: 6 }}>
          <strong style={{ fontSize: 10, color: "#000" }}>Antecedentes:</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 12px", marginTop: 4 }}>
            <div style={{ fontSize: 10, color: "#000" }}>Asma: {sn(data.asma)}</div>
            <div style={{ fontSize: 10, color: "#000" }}>Rinitis: {sn(data.renitis)}</div>
            <div style={{ fontSize: 10, color: "#000" }}>Epilepsia: {sn(data.epilepsia)}</div>
            <div style={{ fontSize: 10, color: "#000" }}>Alergias: {sn(data.alergiaMedicamento === "si" || data.alergiaAlimento === "si")}</div>
            <div style={{ fontSize: 10, color: "#000" }}>Cirugía: {sn(data.cirugia)}</div>
            <div style={{ fontSize: 10, color: "#000" }}>Medicado: {sn(data.medicado)}</div>
          </div>
        </div>
        
        <div style={{ marginTop: 10, fontSize: 10, color: "#000", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 15px", padding: "8px", border: "1px solid #000" }}>
          <strong style={{ gridColumn: "span 2", marginBottom: 4, color: "#000" }}>EN CASO DE EMERGENCIA LLAMAR A:</strong>
          <Row label="Nombre Completo" value={data.emergenciaNombre} />
          <Row label="Teléfono" value={data.emergenciaTelefono} />
        </div>
      </Section>

      {/* ACTA DE COMPROMISO */}
      <div style={{ marginTop: 15, fontSize: 9.5, color: "#000", textAlign: "justify", lineHeight: 1.4, padding: "10px", border: "1px solid #000" }}>
        <strong>ACTA DE COMPROMISO:</strong><br/>
        ME COMPROMETO MEDIANTE LA PRESENTE A CUMPLIR CABALMENTE TODAS AQUELLAS DISPOSICIONES Y REGLAMENTOS EMANADAS EN MATERIA EDUCATIVA, PARTICIPANDO ACTIVAMENTE EN LAS ACTIVIDADES ESCOLARES EN LAS QUE SE CONVOQUE, POR EL BIEN DE MI REPRESENTADO Y DE LA INSTITUCION. ASI MISMO ME HAGO RESPONSABLE DE LOS DAÑOS Y PERJUCIOS QUE OCASIONE MI REPRESENTADO DENTRO DEL PLANTEL OBLIGANDOME A CANCELAR Y REPARAR LOS DAÑOS.<br/>
        ASI LOS ACEPTO Y FIRMO:
      </div>

      {/* FIRMA */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 25, borderTop: "2px solid #000", paddingTop: 20 }}>
        {["Firma del Representante Legal","Sello y Firma del Director/a"].map(label => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #000", marginBottom: 6, height: 25, width: "70%", margin: "0 auto" }}></div>
            <div style={{ fontSize: 10, color: "#000", fontWeight: "bold" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
PdfTemplate.displayName = "PdfTemplate";

// COMPONENTE PRINCIPAL
const InscripcionPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const pdfRef = useRef(null);

  const set = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrorMsg(""); 
  };

  // VALIDACIONES
  const validateStep = () => {
    if (currentStep === 1) {
      if (!data.nombres || !data.apellidos || !data.fechaNac || !data.cedula || !data.edad || !data.direccion || !data.gradoCursar) {
        return "Por favor, completa los campos obligatorios del estudiante.";
      }
    }
    if (currentStep === 2) {
      if (data.madreVive === "si" && (!data.madreNombres || !data.madreApellidos || !data.madreCedula)) {
        return "Faltan datos obligatorios de la madre.";
      }
      if (data.padreVive === "si" && (!data.padreNombres || !data.padreApellidos || !data.padreCedula)) {
        return "Faltan datos obligatorios del padre.";
      }
    }
    if (currentStep === 3) {
      if ((data.representanteEs === "representante" || data.representanteEs === "otro") && 
          (!data.repNombres || !data.repApellidos || !data.repCI || !data.repCelular || !data.repParentesco || !data.repDireccion)) {
        return "Por favor, completa los campos obligatorios del representante.";
      }
    }
    if (currentStep === 4) {
      if ((data.llegaTransporte || data.retiraTransporte) && (!data.transportistaRetira || !data.transportistaTelefono)) {
        return "Debe indicar los datos del transportista.";
      }
    }
    if (currentStep === 5) {
      if (!data.emergenciaNombre || !data.emergenciaTelefono) {
        return "Los datos de contacto de emergencia son obligatorios.";
      }
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
    if (err) {
      setErrorMsg(err);
      return;
    }

    setIsGenerating(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let imgWidth = pageWidth;
      let imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight > pageHeight) {
        const ratio = pageHeight / imgHeight;
        imgHeight = pageHeight;
        imgWidth = imgWidth * ratio;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, "JPEG", xOffset, 0, imgWidth, imgHeight);

      const nombre = data.apellidos && data.nombres
        ? `Ficha_Inscripcion_${data.apellidos}_${data.nombres}.pdf`
        : "Ficha_de_Inscripcion.pdf";
      
      // 1. Guardar el PDF en el dispositivo
      pdf.save(nombre);
      
      // 2. Preparar el PDF y los datos para enviarlos al servidor
      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("archivo_pdf", pdfBlob, nombre);
      formData.append("nombres", data.nombres);
      formData.append("apellidos", data.apellidos);
      formData.append("cedula", data.cedula);
      formData.append("grado_cursar", data.gradoCursar);

      // 3. Enviar a servidor
      const response = await fetch(`${API_URL}/api/registro-inscripciones/`, {
        method: "POST",
        body: formData, 
      });

      if (!response.ok) {
         console.warn("La planilla se descargó, pero hubo un problema guardándola en el servidor.");
      }

      setDone(true);
    } catch (err) {
      console.error("Error generando/enviando PDF:", err);
      alert("Hubo un error al procesar el PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const stepComponents = [
    <StepEstudiante key="step1" data={data} set={set} />,
    <StepPadres key="step2" data={data} set={set} />,
    <StepRepresentante key="step3" data={data} set={set} />,
    <StepComplementarios key="step4" data={data} set={set} />,
    <StepSalud key="step5" data={data} set={set} />,
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* HEADER */}
      <div className="bg-[#1B3A57] text-white pt-24 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "16px 16px" }}></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Formulario de Inscripción</h1>
          <p className="text-gray-300 text-sm">Complete todos los campos obligatorios (*) y descargue su ficha en PDF al finalizar.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* BARRA DE PROGRESO */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0">
              <div className="h-full bg-[#C62828] transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
            </div>
            {STEPS.map(step => {
              const Icon = step.icon;
              const isComplete = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 z-10" onClick={() => {
                  if (isComplete) setCurrentStep(step.id);
                }} style={{ cursor: isComplete ? "pointer" : "default" }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isComplete ? "bg-[#C62828] border-[#C62828] text-white" : isActive ? "bg-[#1B3A57] border-[#1B3A57] text-white shadow-lg scale-110" : "bg-white border-gray-300 text-gray-400"}`}>
                    {isComplete ? <CheckCircle size={18} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-semibold hidden md:block ${isActive ? "text-[#1B3A57]" : "text-gray-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Paso {currentStep} de {STEPS.length}</span>
          </div>
        </div>

        {/* FORMULARIO TARJETA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold border border-red-200">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
          {stepComponents[currentStep - 1]}
        </div>

        {/* BOTONES DE NAVEGACION */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => {
              setErrorMsg("");
              setCurrentStep(s => Math.max(1, s - 1));
            }}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft size={16} /> Anterior
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B3A57] text-white text-sm font-bold hover:bg-[#16304a] transition shadow-md"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#C62828] text-white text-sm font-bold hover:bg-[#B71C1C] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg"
              >
                {isGenerating ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span> Generando...</>
                ) : (
                  <><Download size={16} /> Descargar Ficha PDF</>
                )}
              </button>
              {done && <p className="text-green-600 text-xs font-semibold animate-pulse">✓ ¡PDF descargado con éxito!</p>}
            </div>
          )}
        </div>
      </div>

      {/* PDF TEMPLATE */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}>
        <PdfTemplate ref={pdfRef} data={data} />
      </div>

      <Footer />
    </div>
  );
};

export default InscripcionPage;