import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../config/AxiosInstance";

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get All Students
    const getAllStudents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/student/all");
            setStudents(data.students);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch students.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Update Student
    const updateStudent = useCallback(async (id, formData) => {
        setError("");
        try {
            const { data } = await api.put(`/student/update/${id}`, formData);
            setStudents((prev) =>
                prev.map((s) => (s._id === id ? data.student : s))
            );
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update student.";
            setError(message);
            return { success: false, message };
        }
    }, []);

    // Delete Student
    const deleteStudent = useCallback(async (id) => {
        setError("");
        try {
            await api.delete(`/student/delete/${id}`);
            setStudents((prev) => prev.filter((s) => s._id !== id));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete student.";
            setError(message);
            return { success: false, message };
        }
    }, []);

    
    const addStudent = useCallback((newStudent) => {
        setStudents((prev) => [...prev, newStudent]);
    }, []);

    return (
        <StudentContext.Provider value={{
            students,
            loading,
            error,
            getAllStudents,
            updateStudent,
            deleteStudent,
            addStudent,
        }}>
            {children}
        </StudentContext.Provider>
    );
}

export const useStudent = () => useContext(StudentContext);