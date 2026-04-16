import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "../config/AxiosInstance";

const AuthContext = createContext(null);



const TOKEN_KEY = "exp_token";
const USER_KEY = "user";
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;


function saveSession(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, String(Date.now() + TOKEN_TTL));
}

function clearSession() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

function loadSession() {
    try {
        const expiry = parseInt(localStorage.getItem(TOKEN_KEY), 10);
        if (!expiry || Date.now() > expiry) { clearSession(); return null; }
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        clearSession();
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => loadSession());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Auto-logout when token expires (checks every 60s)
    useEffect(() => {
        const id = setInterval(() => {
            const expiry = parseInt(localStorage.getItem(TOKEN_KEY), 10);
            if (expiry && Date.now() > expiry) { clearSession(); setUser(null); }
        }, 60_000);
        return () => clearInterval(id);
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/auth/login", { email, password });
            saveSession(data.user);
            setUser(data.user);
            return true;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                (err.code === "ERR_NETWORK"
                    ? "Unable to reach the server. Please try again."
                    : "Invalid credentials. Access denied.");
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => { clearSession(); setUser(null); setError(""); }, []);
    const clearError = useCallback(() => setError(""), []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);