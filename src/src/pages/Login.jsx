import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  LogOut,
  Plus,
  Bell,
  User,
  ArrowLeft,
  Loader2,
  Calendar,
  ExternalLink,
  Users,
  BookOpen,
  CheckCircle
} from "lucide-react";

import NewsManager from "../components/NewsManager";
import FilesManager from "../components/FilesManager";
import InscripcionesManager from "../components/InscripcionManager";
import { API_URL } from "../config";
import api from "../api/axios";

const theme = {
  primary: "bg-[#1B3A57]",
  primaryText: "text-[#1B3A57]",
  bgLight: "bg-[#FDFBF7]",
};

const logoUrl = "https://i.imgur.com/yoiUI2Z.png";

const SchoolAdmin = () => {
  const [token, setToken] = useState(localStorage.getItem("access"));
  const [activeTab, setActiveTab] = useState("dashboard");

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    if (storedToken) setToken(storedToken);
  }, []);

  // Función de Logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setToken(null);
  };

  // Si no hay token, mostrar Login
if (!token) {
    return <AdminLogin onLogin={(newToken) => {
        setToken(newToken);
    }} />;
  }

  // Interfaz de Administrador
  return (
    <div className={`flex h-screen ${theme.bgLight} font-sans`}>
      {/* SIDEBAR */}
      <aside className={`w-64 ${theme.primary} text-white flex flex-col shadow-2xl`}>
        <div className="p-6 flex flex-col items-center border-b border-blue-900/50">
          <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-3 bg-white rounded-full p-1 shadow-inner" />
          <h2 className="font-serif font-bold text-lg tracking-wide text-center">Panel Administrativo</h2>
          <p className="text-xs text-blue-200 mt-1">Liceo José Ángel Álamo</p>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-4">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            text="Vista General" 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
          />
          <SidebarItem 
            icon={<Bell size={20} />} 
            text="Noticias y Anuncios" 
            active={activeTab === "news"} 
            onClick={() => setActiveTab("news")} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            text="Gestión de Archivos" 
            active={activeTab === "files"} 
            onClick={() => setActiveTab("files")} 
          />
          <SidebarItem 
  icon={<Users size={20} />} 
  text="Récord de Inscripciones" 
  active={activeTab === "inscripciones"} 
  onClick={() => setActiveTab("inscripciones")} 
/>
        </nav>

        <div className="p-4 border-t border-blue-900/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex justify-between items-center px-8 z-10">
<h2 className={`text-2xl font-serif font-bold ${theme.primaryText}`}>
  {activeTab === "dashboard" && "Bienvenido al Sistema"}
  {activeTab === "news" && "Gestor de Noticias"}
  {activeTab === "files" && "Archivos y Planillas"}
  {activeTab === "inscripciones" && "Récord Virtual de Inscripciones"}
</h2>
          <div className="flex items-center gap-4">
             {/* Fecha Actual */}
             <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Calendar size={14} className="text-[#1B3A57]"/>
                {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
             </div>

             <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#1B3A57] text-white flex items-center justify-center shadow-sm">
                <User size={16} />
              </div>
              <span className="text-sm font-bold text-gray-700 pr-2">Director</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FDFBF7]">
{activeTab === "dashboard" && <DashboardHome changeTab={setActiveTab} token={token}/>}
{activeTab === "news" && <NewsManager token={token} />}
{activeTab === "files" && <FilesManager token={token} />}
{activeTab === "inscripciones" && <InscripcionesManager token={token} />}
        </div>
      </main>
    </div>
  );
};

/* --- COMPONENTE DE LOGIN  --- */
const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const response = await api.post('login/', credentials);
        const { access, refresh } = response.data;
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        
        onLogin(access);
    } catch (err) {
        setError("Credenciales incorrectas. Verifique usuario y contraseña.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.primary} relative overflow-hidden`}>
       <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
       
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <img src={logoUrl} alt="Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h2 className={`text-3xl font-serif font-bold ${theme.primaryText}`}>Acceso Administrativo</h2>
        </div>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm font-medium">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Usuario</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#1B3A57] outline-none transition-all"
              placeholder="Ej: admin"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#1B3A57] outline-none transition-all"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          
          <div className="text-right">
            <a 
                href="https://joseangelalamo.pythonanywhere.com/reset_password/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#C62828] hover:text-red-800 font-medium hover:underline transition-colors"
            >
                ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full ${theme.primary} hover:bg-[#132a40] text-white font-bold py-3 rounded transition shadow-lg flex justify-center items-center`}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
            </button>

            {/* BOTÓN PARA VOLVER AL INICIO */}
            <a 
              href="/" 
              className="flex items-center justify-center gap-2 text-gray-500 hover:text-[#1B3A57] text-sm font-medium py-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver a la página principal
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- DASHBOARD HOME --- */
const DashboardHome = ({ changeTab, token }) => {
    const [stats, setStats] = useState({ noticias: 0, archivos: 0, inscripciones: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const [noticiasRes, archivosRes, inscripcionesRes] = await Promise.all([
                api.get('noticias/'),
                api.get('archivos/'),
                api.get('registro-inscripciones/') 
            ]);

            setStats({
                noticias: noticiasRes.data.length,
                archivos: archivosRes.data.length,
                inscripciones: inscripcionesRes.data.length
            });

        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (token) {
        fetchStats();
    }
}, [token]);

    return (
      <div className="space-y-8 animate-fade-in">
        
        {/* Mensaje de Bienvenida */}
        <div>
            <h3 className="text-gray-500 text-sm font-bold tracking-widest uppercase">Resumen del Sistema</h3>
            <p className="text-gray-600 mt-1">Aquí tienes un vistazo general de la información publicada y recibida.</p>
        </div>

        {/* Stats Cards Dinámicas*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Tarjeta de Noticias */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase mb-1">Noticias</p>
              <h3 className="text-3xl font-bold text-[#1B3A57]">
                {loadingStats ? <Loader2 className="animate-spin text-blue-300" size={28}/> : stats.noticias}
              </h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-full text-blue-600"><Bell size={28}/></div>
          </div>

          {/* Tarjeta de Archivos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-600 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase mb-1">Archivos</p>
              <h3 className="text-3xl font-bold text-[#1B3A57]">
                {loadingStats ? <Loader2 className="animate-spin text-red-300" size={28}/> : stats.archivos}
              </h3>
            </div>
            <div className="bg-red-50 p-4 rounded-full text-red-600"><FileText size={28}/></div>
          </div>

          {/* Tarjeta de Inscripciones */}
          <div 
            onClick={() => changeTab("inscripciones")}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase mb-1 group-hover:text-purple-600 transition-colors">Planillas</p>
              <h3 className="text-3xl font-bold text-[#1B3A57]">
                {loadingStats ? <Loader2 className="animate-spin text-purple-300" size={28}/> : stats.inscripciones}
              </h3>
            </div>
            <div className="bg-purple-50 p-4 rounded-full text-purple-600 group-hover:scale-110 transition-transform"><Users size={28}/></div>
          </div>

          {/* Tarjeta de Estado */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase mb-1">Web</p>
              <h3 className="text-xl font-bold text-green-600 flex items-center gap-2 mt-2">
                En línea
              </h3>
            </div>
            <div className="bg-green-50 p-4 rounded-full text-green-500"><CheckCircle size={28}/></div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <h3 className="text-xl font-serif font-bold text-[#1B3A57] mb-6 border-b border-gray-100 pb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div onClick={() => changeTab("news")} className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                    <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={28} className="text-blue-700"/>
                    </div>
                    <h4 className="font-bold text-gray-800">Publicar Noticia</h4>
                    <p className="text-xs text-gray-500 text-center mt-2">Redacta un anuncio en la cartelera digital</p>
                </div>
                
                <div onClick={() => changeTab("files")} className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center hover:bg-red-50 hover:border-red-300 transition-all duration-300">
                    <div className="bg-red-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={28} className="text-red-700"/>
                    </div>
                    <h4 className="font-bold text-gray-800">Subir Planilla</h4>
                    <p className="text-xs text-gray-500 text-center mt-2">Actualiza constancias y requisitos</p>
                </div>

                {/* Botón hacia la web pública */}
                <a href="/" target="_blank" rel="noopener noreferrer" className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                    <div className="bg-gray-200 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <ExternalLink size={28} className="text-gray-700"/>
                    </div>
                    <h4 className="font-bold text-gray-800">Ver Sitio Web</h4>
                    <p className="text-xs text-gray-500 text-center mt-2">Abre la página principal en otra pestaña</p>
                </a>

            </div>
        </div>
      </div>
    );
};

const SidebarItem = ({ icon, text, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2
      ${active 
        ? "bg-white text-[#1B3A57] font-bold shadow-md" 
        : "text-blue-100 hover:bg-blue-900/50 hover:text-white"
      }
    `}
  >
    {icon}
    <span className="tracking-wide text-sm">{text}</span>
  </button>
);

export default SchoolAdmin;