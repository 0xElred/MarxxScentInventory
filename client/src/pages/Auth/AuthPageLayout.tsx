import type { FC, ReactNode } from "react";
import loginLogo from "../../assets/img/loginlogo.png";

interface AuthPageLayoutProps {
    children: ReactNode;
}

const loginInputClass =
    "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800";
const loginLabelClass = "text-gray-600 bg-white";

const AuthPageLayout: FC<AuthPageLayoutProps> = ({ children }) => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
                <img
                    src={loginLogo}
                    alt="Marxx Scent"
                    className="w-full max-w-[382px] object-contain"
                />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
                <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
                    Sign in to your account
                </h2>
                {children}
            </div>
        </div>
    </div>
);

export { loginInputClass, loginLabelClass };
export default AuthPageLayout;
