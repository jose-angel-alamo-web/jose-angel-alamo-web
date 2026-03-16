import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api/'; 

const api = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

// 1. INTERCEPTOR DE SOLICITUD
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                
                if (refreshToken) {
                    // CAMBIO: La ruta correcta que hicimos en el backend
                    const response = await axios.post(`${baseURL}token/refresh/`, {
                        refresh: refreshToken
                    });

                    localStorage.setItem('access', response.data.access);

                    // CAMBIO: Usar Bearer
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (err) {
                console.log("Sesión caducada, cerrando...");
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/'; // Te devuelve al inicio
            }
        }
        return Promise.reject(error);
    }
);

export default api;