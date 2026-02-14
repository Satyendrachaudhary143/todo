import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await api.post("/register", form);


            toast.success(data.message);
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

                <input
                    type="text"
                    placeholder="Name"
                    className="w-full border p-3 mb-4 rounded-lg"
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

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

                <button className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
                    Signup
                </button>

                <p className="mt-4 text-center text-sm">
                    Already have account?{" "}
                    <Link to="/login" className="text-blue-500">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
