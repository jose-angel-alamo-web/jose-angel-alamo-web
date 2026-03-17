import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, User, ShieldCheck, Lock } from 'lucide-react';
import api from '../api/axios';

const PasswordReset = () => {
    const [step, setStep] = useState(1); // 1: Usuario, 2: Preguntas, 3: Nueva Clave
    const [username, setUsername] = useState('');
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({ r1: '', r2: '' });
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const theme = { primary: "bg-[#1B3A57]", primaryText: "text-[#1B3A57]", bgLight: "bg-[#FDFBF7]" };

    const handleBuscarUsuario = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('recuperar/obtener-preguntas/', { username });
            setPreguntas(res.data.preguntas);
            setStep(2);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Usuario no encontrado.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRestablecer = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            username,
            new_password: passwords.new,
            respuestas: [
                { pregunta_id: preguntas[0].id, respuesta: respuestas.r1 },
                { pregunta_id: preguntas[1].id, respuesta: respuestas.r2 }
            ]
        };

        try {
            await api.post('recuperar/restablecer/', payload);
            setMessage({ type: 'success', text: 'Contraseña actualizada. Redirigiendo...' });
            setTimeout(() => navigate('/public-login'), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Respuestas incorrectas.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bgLight} relative px-4`}>
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100">
                <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold ${theme.primaryText}`}>Recuperar Contraseña</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {step === 1 && "Ingresa tu usuario para buscar tus preguntas"}
                        {step === 2 && "Responde tus preguntas de seguridad y crea tu nueva clave"}
                    </p>
                </div>

                {message.text && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleBuscarUsuario} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Usuario</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej. V-12345678"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1B3A57] outline-none"
                            />
                        </div>
                        <button disabled={loading} className={`w-full py-3 rounded-lg text-white font-bold ${theme.primary} flex justify-center`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Buscar Usuario"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRestablecer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">1. {preguntas[0]?.pregunta}</label>
                            <input
                                required type="text" value={respuestas.r1}
                                onChange={(e) => setRespuestas({ ...respuestas, r1: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">2. {preguntas[1]?.pregunta}</label>
                            <input
                                required type="text" value={respuestas.r2}
                                onChange={(e) => setRespuestas({ ...respuestas, r2: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
                            <input
                                required type="password" value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 mb-3"
                            />
                            <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                required type="password" value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                            />
                        </div>
                        <button disabled={loading} className={`w-full py-3 mt-4 rounded-lg text-white font-bold ${theme.primary} flex justify-center`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Cambiar Contraseña"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/public-login" className="text-sm text-gray-500 hover:text-gray-800 flex justify-center items-center gap-2">
                        <ArrowLeft size={16} /> Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;