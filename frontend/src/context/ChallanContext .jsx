import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../config/AxiosInstance";

const ChallanContext = createContext(null);

export function ChallanProvider({ children }) {
    const [challans, setChallans] = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState("");

    //  GET ALL Challans
    const getAllChallans = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/challan/all?limit=1000");
            setChallans(data.challans || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch challans.");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <ChallanContext.Provider value={{ challans, loading, error, getAllChallans }}>
            {children}
        </ChallanContext.Provider>
    );
}

export const useChallan = () => useContext(ChallanContext);