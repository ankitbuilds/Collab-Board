import axios from "axios";

const normalizeApiBaseUrl = (value: string) => {
    const trimmed = value.trim().replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
    baseURL: normalizeApiBaseUrl(
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ),
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default api;