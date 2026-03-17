import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, User, Lock, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../api/axios';

const theme = {
  primary: "bg-[#1B3A57]",
  primaryText: "text-[#1B3A57]",
  bgLight: "bg-[#FDFBF7]",
};

const logoUrl = "https://i.imgur.com/yoiUI2Z.png";

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ username: '', password: '', confirmPassword: '' });
    
    // NUEVO ESTADO: Para las preguntas de seguridad
    const [preguntasDB, setPreguntasDB] = useState([]);
    const [seguridad, setSeguridad] = useState({
        pregunta1: '', respuesta1: '',
        pregunta2: '', respuesta2: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // NUEVO EFECTO: Cargar las preguntas desde el backend cuando el componente se monta
    useEffect(() => {
        const fetchPreguntas = async () => {
            try {
                const response = await api.get('preguntas-seguridad/');
                setPreguntasDB(response.data);
            } catch (error) {
                console.error("Error cargando preguntas de seguridad", error);
            }
        };
        fetchPreguntas();
    }, []);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSeguridadChange = (e) => {
        setSeguridad({
            ...seguridad,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        // VALIDACIONES 
        if (!isLogin) {
            if (credentials.password.length < 6) {
                setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres por seguridad.' });
                return;
            }
            if (credentials.password !== credentials.confirmPassword) {
                setMessage({ type: 'error', text: 'Las contraseñas no coinciden. Por favor, verifica.' });
                return;
            }
            // Validaciones nuevas para las preguntas
            if (!seguridad.pregunta1 || !seguridad.respuesta1 || !seguridad.pregunta2 || !seguridad.respuesta2) {
                setMessage({ type: 'error', text: 'Debes seleccionar y responder ambas preguntas de seguridad.' });
                return;
            }
            if (seguridad.pregunta1 === seguridad.pregunta2) {
                setMessage({ type: 'error', text: 'Debes seleccionar dos preguntas diferentes.' });
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                const response = await api.post('login/', credentials);
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                localStorage.setItem('username', credentials.username);
                navigate('/inscripcion'); 
            } else {
                const payload = {
                    username: credentials.username,
                    password: credentials.password,
                    respuestas: [
                        { pregunta_id: parseInt(seguridad.pregunta1), respuesta: seguridad.respuesta1 },
                        { pregunta_id: parseInt(seguridad.pregunta2), respuesta: seguridad.respuesta2 }
                    ]
                };
                const response = await api.post('registro/', payload);
                setMessage({ type: 'success', text: response.data.mensaje || 'Cuenta creada exitosamente. Ya puedes iniciar sesión.' });
                setIsLogin(true); 
                
                // Limpia todo el formulario
                setCredentials({ username: '', password: '', confirmPassword: '' }); 
                setSeguridad({ pregunta1: '', respuesta1: '', pregunta2: '', respuesta2: '' });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Ocurrió un error. Intenta nuevamente.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bgLight} relative overflow-hidden px-4 font-sans`}>
            
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#1B3A57 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-gray-100 animate-fade-in-up">
                
                <div className="text-center mb-8">
                    <img src={logoUrl} alt="Logo U.E.N. José Ángel Álamo" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-sm" />
                    <h2 className={`text-3xl font-serif font-bold ${theme.primaryText}`}>
                        {isLogin ? 'Portal de Acceso' : 'Nuevo Registro'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        {isLogin ? 'Ingresa para gestionar tus trámites' : 'Crea tu cuenta segura como representante'}
                    </p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg text-sm font-medium mb-6 flex items-start gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Usuario <span className="text-gray-400 font-normal">(Ej. Cédula)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <input
                                name="username"
                                type="text"
                                required
                                placeholder="V-12345678"
                                value={credentials.username}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* NUEVO: Enlace de Recuperación (Solo en Login) */}
                    {isLogin && (
                        <div className="text-right mt-1">
                            <Link to="/recuperar-password" className="text-xs text-[#1B3A57] hover:underline font-medium transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    )}

                    {/* CAMPO DINÁMICO: Solo aparece si NO es Login (es decir, en Registro) */}
                    {!isLogin && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirmar Contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheck size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required={!isLogin} 
                                        placeholder="Repite la contraseña"
                                        value={credentials.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 ml-1">Debe contener al menos 6 caracteres.</p>
                            </div>

                            {/* NUEVO: Preguntas de Seguridad en el Registro */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-[#1B3A57] flex items-center gap-2 mb-3">
                                    <HelpCircle size={16} /> Preguntas de Seguridad
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">Estas preguntas te ayudarán a recuperar tu cuenta si olvidas la contraseña.</p>

                                {/* Pregunta 1 */}
                                <div className="space-y-2 mb-3">
                                    <select
                                        name="pregunta1"
                                        value={seguridad.pregunta1}
                                        onChange={handleSeguridadChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white text-gray-700"
                                        required={!isLogin}
                                    >
                                        <option value="" disabled>Selecciona la Pregunta 1</option>
                                        {preguntasDB.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.id.toString() === seguridad.pregunta2}>
                                                {p.pregunta}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="respuesta1"
                                        placeholder="Tu respuesta a la pregunta 1"
                                        value={seguridad.respuesta1}
                                        onChange={handleSeguridadChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                        required={!isLogin}
                                    />
                                </div>

                                {/* Pregunta 2 */}
                                <div className="space-y-2">
                                    <select
                                        name="pregunta2"
                                        value={seguridad.pregunta2}
                                        onChange={handleSeguridadChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white text-gray-700"
                                        required={!isLogin}
                                    >
                                        <option value="" disabled>Selecciona la Pregunta 2</option>
                                        {preguntasDB.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.id.toString() === seguridad.pregunta1}>
                                                {p.pregunta}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        name="respuesta2"
                                        placeholder="Tu respuesta a la pregunta 2"
                                        value={seguridad.respuesta2}
                                        onChange={handleSeguridadChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A57] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${theme.primary} hover:bg-[#132a40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B3A57] transition-all shadow-md hover:shadow-lg disabled:opacity-70`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Acceder al Sistema' : 'Crear mi Cuenta Segura')}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                    <button 
                        onClick={() => { 
                            setIsLogin(!isLogin); 
                            setMessage({type: '', text: ''}); 
                            // Opcional: limpiar todos los campos al cambiar de pestaña
                            setCredentials({username: '', password: '', confirmPassword: ''}); 
                            setSeguridad({ pregunta1: '', respuesta1: '', pregunta2: '', respuesta2: '' });
                        }}
                        className="text-sm text-[#1B3A57] hover:text-blue-800 font-bold hover:underline transition-colors"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>

                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors mt-2"
                    >
                        <ArrowLeft size={14} />
                        Volver a la página principal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;