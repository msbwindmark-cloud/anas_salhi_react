import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Tu URL de Django
});

// INTERCEPTOR DE PETICIÓN: Añade el token a cada mensaje que envías
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPUESTA: Si el token falla, intenta renovarlo automáticamente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) y no hemos intentado renovar ya...
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                // Pedimos un nuevo access_token usando el refresh_token
                const res = await axios.post('http://127.0.0.1:8000/api/auth/login/refresh/', {
                    refresh: refreshToken,
                });

                if (res.status === 200) {
                    localStorage.setItem('access_token', res.data.access);
                    // Reintentamos la petición original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Si el refresh_token también falló, cerramos sesión
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;