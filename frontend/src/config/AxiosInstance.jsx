import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:5053/api",
    withCredentials: true,
    headers: {
        "Content-Type": undefined },
});