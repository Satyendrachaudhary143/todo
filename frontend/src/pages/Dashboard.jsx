import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
    LogOut,
    Plus,
    Trash2,
    Pencil,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({
        title: "",
        discription: "",
    });

    const [editingNote, setEditingNote] = useState(null);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get("/get-notes");
            setNotes(data.notes || []);
        } catch {
            toast.error("Session expired");
            navigate("/login");
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const createNote = async () => {
        if (!form.title || !form.discription) {
            toast.error("All fields required");
            return;
        }

        try {
            await api.post("/create-note", form);
            toast.success("Note created");
            setForm({ title: "", discription: "" });
            fetchNotes();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    const deleteNote = async (id) => {
        try {
            await api.delete(`/delete-note/${id}`);
            toast.success("Note deleted");
            fetchNotes();
        } catch {
            toast.error("Delete failed");
        }
    };

    const updateNote = async () => {
        try {
            await api.patch(`/update-note/${editingNote.id}`, form);
            toast.success("Note updated");
            setEditingNote(null);
            setForm({ title: "", discription: "" });
            fetchNotes();
        } catch {
            toast.error("Update failed");
        }
    };

    const logout = async () => {
        await api.post("/logout");
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    My Notes
                </h1>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Create Form */}
            <div className="max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Description"
                        className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        value={form.discription}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                discription: e.target.value,
                            })
                        }
                    />

                    <button
                        onClick={createNote}
                        className="bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                    >
                        <Plus size={18} />
                        Add Note
                    </button>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center">
                        No notes found
                    </p>
                )}

                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-lg font-semibold mb-2">
                                {note.title}
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {note.discription}
                            </p>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setEditingNote(note);
                                    setForm({
                                        title: note.title,
                                        discription: note.discription,
                                    });
                                }}
                                className="text-blue-500 hover:text-blue-700 transition"
                            >
                                <Pencil size={18} />
                            </button>

                            <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-500 hover:text-red-700 transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingNote && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                Edit Note
                            </h2>
                            <button
                                onClick={() => setEditingNote(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <input
                            type="text"
                            className="w-full border p-3 rounded-lg mb-4"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            className="w-full border p-3 rounded-lg mb-4"
                            value={form.discription}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    discription: e.target.value,
                                })
                            }
                        />

                        <button
                            onClick={updateNote}
                            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                        >
                            Update Note
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
