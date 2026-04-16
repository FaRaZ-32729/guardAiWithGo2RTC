import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../config/AxiosInstance";

const CameraContext = createContext(null);

export function CameraProvider({ children }) {

    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get All Cameras 
    const getAllCameras = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get("/camera/all");

            setCameras(response.data.cameras || []);

        } catch (error) {
            console.error("Failed to fetch cameras", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete Camera 
    const deleteCamera = async (id) => {
        try {

            await api.delete(`/camera/delete/${id}`);

            setCameras((prev) => prev.filter((cam) => cam._id !== id));

        } catch (error) {
            console.error("Failed to delete camera", error);
        }
    };

    // Load cameras
    useEffect(() => {
        getAllCameras();
    }, [getAllCameras]);

    return (
        <CameraContext.Provider
            value={{
                cameras,
                loading,
                getAllCameras,
                deleteCamera,
                setCameras
            }}
        >
            {children}
        </CameraContext.Provider>
    );
}

export const useCamera = () => useContext(CameraContext);   