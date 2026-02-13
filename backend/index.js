import express from "express";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from 'cors'

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const PORT = process.env.PORT || 3000;

/* ==========================
   Helper Functions
========================== */

const readUsers = async () => {
    try {
        const data = await fs.readFile("db.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeUsers = async (users) => {
    await fs.writeFile("db.json", JSON.stringify(users, null, 2));
};

const readNotes = async () => {
    try {
        const data = await fs.readFile("notes.json", "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const writeNotes = async (notes) => {
    await fs.writeFile("notes.json", JSON.stringify(notes, null, 2));
};

/* ==========================
   Auth Middleware
========================== */

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Token",
            success: false
        });
    }
};

/* ==========================
   Register
========================== */

app.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required",
                success: false
            });
        }

        const users = await readUsers();

        if (users.find((u) => u.email === email)) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await writeUsers(users);

        res.status(201).json({
            message: "User registered",
            success: true
        });

    } catch (err) {
        next(err);
    }
});

/* ==========================
   Login
========================== */

app.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const users = await readUsers();
        const user = users.find((u) => u.email === email);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            success: true
        });

    } catch (err) {
        next(err);
    }
});

/* ==========================
   Logout
========================== */

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "Logged out",
        success: true
    });
});

/* ==========================
   Profile
========================== */

app.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Profile data",
        success: true,
        user: req.user
    });
});

/* ==========================
   Create Note
========================== */

app.post("/create-note", authMiddleware, async (req, res) => {
    const { title, discription } = req.body;

    if (!title || !discription) {
        return res.status(400).json({
            message: "All fields required",
            success: false
        });
    }

    const notes = await readNotes();

    const newNote = {
        id: Date.now(),
        title,
        discription,
        createdBy: req.user.email
    };

    notes.push(newNote);
    await writeNotes(notes);

    res.json({
        message: "Note created",
        success: true,
        note: newNote
    });
});

/* ==========================
   Update Note
========================== */

app.patch("/update-note/:noteId", authMiddleware, async (req, res) => {
    const { noteId } = req.params;
    const { title, discription } = req.body;

    const notes = await readNotes();

    const note = notes.find(
        (n) => n.id === Number(noteId) && n.createdBy === req.user.email
    );

    if (!note) {
        return res.status(404).json({
            message: "Note not found",
            success: false
        });
    }

    if (title) note.title = title;
    if (discription) note.discription = discription;

    await writeNotes(notes);

    res.json({
        message: "Note updated",
        success: true,
        note
    });
});

/* ==========================
   Get Notes
========================== */

app.get("/get-notes", authMiddleware, async (req, res) => {
    const notes = await readNotes();

    const userNotes = notes.filter(
        (note) => note.createdBy === req.user.email
    );

    res.json({
        success: true,
        notes: userNotes
    });
});

// delete note 
app.delete("/delete-note/:noteId", authMiddleware, async (req, res) => {
    const { noteId } = req.params;
    const notes = await readNotes();

    const filtered = notes.filter(
        (n) => n.id !== Number(noteId)
    );

    await writeNotes(filtered);

    res.json({
        message: "Note deleted",
        success: true
    });
});

/* ==========================
   Global Error Handler
========================== */

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Server Error",
        success: false
    });
});

/* ==========================
   Start Server
========================== */

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
