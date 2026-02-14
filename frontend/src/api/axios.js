import axios from "axios";

const api = axios.create({
    baseURL: "https://todo-8640.onrender.com",
    withCredentials: true, // IMPORTANT for cookies
});

export default api;
