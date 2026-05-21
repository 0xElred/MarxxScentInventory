import { useCallback, useEffect, useState, type FC, type ReactNode } from "react";
import type { UserDetails } from "../interfaces/AuthInterface";
import AuthService from "../services/AuthService";
import { AuthContext, type AuthContextType } from "./auth-context";
import { AUTH_DISABLED } from "../config/auth";

export { AuthContext, type AuthContextType };

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (username: string, password: string) => {
        const res = await AuthService.login({ username, password });

        if (res.status === 200) {
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
        } else {
            console.error(
                "Unexpected error occurred during logging in user in: ",
                res.status
            );
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const res = await AuthService.logout();

            if (res.status === 200) {
                localStorage.removeItem("token");
                setUser(null);
            } else {
                console.error(
                    "Unexpected status error occurred during logging user out: ",
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected status error occurred during logging user out: ",
                error
            );
            throw error;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        if (AUTH_DISABLED) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            if (token) {
                const res = await AuthService.me();

                if (res.status === 200) {
                    setUser(res.data.user);
                } else {
                    localStorage.removeItem("token");
                    setUser(null);
                    console.error(
                        "Unexpected status error occurred during checking authentication: ",
                        res.status
                    );
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
            console.error(
                "Unexpected server error occurred during checking authentication: ",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
