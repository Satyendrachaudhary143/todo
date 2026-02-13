import axios from "axios";

const api = axios.create({
    baseURL: "https://todo-at57.vercel.app",
    withCredentials: true, // IMPORTANT for cookies
});

export default api;
