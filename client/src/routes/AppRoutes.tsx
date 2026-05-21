import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../Layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/Auth/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProductsPage from "../pages/Products/ProductsPage";
import UsersPage from "../pages/Users/UsersPage";
import OrdersPage from "../pages/Orders/OrdersPage";

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
            element={
                <ProtectedRoute>
                    <AppLayout />
                </ProtectedRoute>
            }
        >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default AppRoutes;
