import { useState, type FC, type FormEvent } from "react";
import SubmitButton from "../../../components/buttons/SubmitButton";
import FloatingLabelInput from "../../../components/inputs/FloatingLabelInput";
import type { LoginCredentialsErrorFields } from "../../../interfaces/AuthInterface";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { loginInputClass, loginLabelClass } from "../AuthPageLayout";

interface LoginFormProps {
    message: (message: string, isFailed: boolean) => void;
}

const LoginForm: FC<LoginFormProps> = ({ message }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginCredentialsErrorFields>({});

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string; errors?: LoginCredentialsErrorFields } } };
            if (err.response?.status === 401) {
                setErrors({});
                message(err.response.data?.message ?? "Invalid credentials.", true);
            } else if (err.response?.status === 422) {
                setErrors(err.response.data?.errors ?? {});
            } else {
                message("Could not sign in. Check that the server is running.", true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <div className="mb-4">
                <FloatingLabelInput
                    label="Username"
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    errors={errors.username}
                    newInputClassName={loginInputClass}
                    newLabelClassName={loginLabelClass}
                />
            </div>
            <div className="mb-4">
                <FloatingLabelInput
                    label="Password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    errors={errors.password}
                    newInputClassName={loginInputClass}
                    newLabelClassName={loginLabelClass}
                />
            </div>
            <SubmitButton
                newClassName="w-full px-4 py-3 bg-gray-900 hover:bg-black text-white text-sm font-medium cursor-pointer rounded-lg shadow disabled:opacity-80 disabled:cursor-not-allowed"
                label="Sign in"
                loading={isLoading}
                loadingLabel="Signing In..."
            />
        </form>
    );
};

export default LoginForm;
