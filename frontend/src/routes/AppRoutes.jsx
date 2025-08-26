import { BrowserRouter, Routes, Route } from "react-router-dom";
import MedicinePage from "../pages/medicine/index";
import PatientPage from "../pages/patient/BenhNhanPage";
import OrderPage from "../pages/orders/OrderPage";
import MainLayout from "../layout/MainLayout";
import ServicePage from "../pages/dichvu/ServicePage";
import AcLog from "../pages/log/AcLog";
export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout><MedicinePage /></MainLayout>} />
                <Route path="/thuoc" element={<MainLayout><MedicinePage /></MainLayout>} />
                <Route path="/benhnhan" element={<MainLayout><PatientPage /></MainLayout>} />
                <Route path="/orders" element={<MainLayout><OrderPage /></MainLayout>} />
                <Route path="/dichvu" element={<MainLayout><ServicePage /></MainLayout>} />
                <Route path="/action" element={<MainLayout><AcLog /></MainLayout>} />
            </Routes>
        </BrowserRouter >
    );
}
