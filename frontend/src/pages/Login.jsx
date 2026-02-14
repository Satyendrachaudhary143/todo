import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await api.post("/login", form);
            toast.success(data.message);



            localStorage.setItem("isLoggedIn", "true");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 mb-4 rounded-lg"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 mb-6 rounded-lg"
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600">
                    Login
                </button>

                <p className="mt-4 text-center text-sm">
                    Don't have account?{" "}
                    <Link to="/signup" className="text-blue-500">
                        Signup
                    </Link>
                </p>
            </form>
        </div>
    );
}
