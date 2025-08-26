import { useEffect, useState } from "react";
import BenhNhanForm from "./BenhNhanForm";
import BenhNhanList from "./BenhNhanList";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Container, Box, Button, Stack, Pagination, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmDialog from "../../components/ConfirmDialog";
import MainLayout from "../../layout/MainLayout";
function BenhNhanPage() {
    const [benhnhans, setBenhnhans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBenhNhan, setEditingBenhNhan] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 10;

    useEffect(() => {
        fetchBenhNhans(page, searchQuery);
    }, [page, searchQuery]);

    const fetchBenhNhans = async (pageNum = 1, query = "") => {
        try {
            const res = await axios.get(`http://localhost:5000/api/benhnhan`, {
                params: { page: pageNum, limit: pageSize, search: query },
            });
            setBenhnhans(res.data.data || []);
            // Calculate total pages based on total records
            const total = res.data.total || 0;
            setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi tải danh sách bệnh nhân");
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page on search

    };

    const addBenhNhan = async (newBenhNhan) => {
        try {
            const res = await axios.post("http://localhost:5000/api/benhnhan", newBenhNhan);
            const benhnhanId = res.data?.benhnhanid || res.data?.id;
            // Tạo log chi tiết các trường đã thêm
            const changes = Object.entries(newBenhNhan)
                .map(([key, value]) => `${key}: ${value}`)
                .join("; ");
            await axios.post("http://localhost:5000/api/action", {
                action: "create",
                object: "benhnhan",
                objectId: benhnhanId,
                changes
            });
            fetchBenhNhans(page);
            setShowForm(false);
            toast.success("Thêm bệnh nhân thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi thêm bệnh nhân");
        }
    };

    const updateBenhNhan = async (id, updatedBenhNhan) => {
        try {
            await axios.put(`http://localhost:5000/api/benhnhan/${id}`, updatedBenhNhan);
            // So sánh các trường đã thay đổi
            const changes = [];
            if (editingBenhNhan) {
                if (editingBenhNhan.hoten !== updatedBenhNhan.hoten) {
                    changes.push(`Họ tên: ${editingBenhNhan.hoten} → ${updatedBenhNhan.hoten}`);
                }
                if (String(editingBenhNhan.tuoi) !== String(updatedBenhNhan.tuoi)) {
                    changes.push(`Tuổi: ${editingBenhNhan.tuoi} → ${updatedBenhNhan.tuoi}`);
                }
                if (editingBenhNhan.sodienthoai !== updatedBenhNhan.sodienthoai) {
                    changes.push(`Số điện thoại: ${editingBenhNhan.sodienthoai} → ${updatedBenhNhan.sodienthoai}`);
                }
                if (editingBenhNhan.tiensubenh !== updatedBenhNhan.tiensubenh) {
                    changes.push(`Tiền sử bệnh: ${editingBenhNhan.tiensubenh} → ${updatedBenhNhan.tiensubenh}`);
                }
            }
            await axios.post("http://localhost:5000/api/action", {
                action: "update",
                object: "benhnhan",
                objectId: id,
                changes: changes.join("; ")
            });
            fetchBenhNhans(page);
            setEditingBenhNhan(null);
            setShowForm(false);
            toast.success("Cập nhật bệnh nhân thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật bệnh nhân");
        }
    };

    const deleteBenhNhan = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/benhnhan/${deleteId}`);
            await axios.post("http://localhost:5000/api/action", {
                action: "delete",
                object: "benhnhan",
                objectId: deleteId,
                changes: `Xóa bệnh nhân: ${deleteId}`
            });
            fetchBenhNhans(page);
            toast.success("Xóa bệnh nhân thành công!");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi xóa bệnh nhân");
        }
        setConfirmOpen(false);
        setDeleteId(null);
    };

    // State cho modal đơn thuốc
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [patientOrders, setPatientOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleViewOrders = async (benhnhan) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/prescriptions/patient?benhnhanid=${benhnhan.benhnhanid}`);
            return res.data ? [res.data] : [];
        } catch {
            toast.error('Không lấy được đơn thuốc của bệnh nhân này');
            return [];
        }
    };

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
    };
    const handleCloseOrderDetail = () => {
        setSelectedOrder(null);
    };
    const handleCloseOrderModal = () => {
        setOrderModalOpen(false);
        setPatientOrders([]);
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, minHeight: "100vh", backgroundColor: "#f5f5f5", width: '100%', px: 0 }}>
            <Toaster position="top-right" richColors />
            <Box textAlign="center" mb={4}>
                <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#333" }}>
                    Quản lý Bệnh nhân
                </h1>
            </Box>

            <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Nhập tên bệnh nhân..."
                    sx={{ width: "300px" }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingBenhNhan(null);
                        setShowForm(true);
                    }}
                >
                    Thêm Bệnh nhân
                </Button>
            </Stack>

            <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editingBenhNhan ? 'Cập nhật bệnh nhân' : 'Thêm bệnh nhân'}
                    <IconButton onClick={() => setShowForm(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <BenhNhanForm
                        onAdd={addBenhNhan}
                        onUpdate={updateBenhNhan}
                        editingBenhNhan={editingBenhNhan}
                        onClose={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <BenhNhanList
                benhnhans={benhnhans}
                onEdit={(bn) => {
                    setEditingBenhNhan(bn);
                    setShowForm(true);
                }}
                onDelete={(id) => {
                    setDeleteId(id);
                    setConfirmOpen(true);
                }}
                onViewOrders={handleViewOrders}
            />

            {/* Modal danh sách đơn thuốc của bệnh nhân */}
            <Dialog open={orderModalOpen} onClose={handleCloseOrderModal} maxWidth="md" fullWidth>
                <DialogTitle>Đơn thuốc của bệnh nhân</DialogTitle>
                <DialogContent>
                    {patientOrders.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#888', py: 2 }}>Không có đơn thuốc</Box>
                    ) : (
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Ngày khám</TableCell>
                                    <TableCell>Chi tiết</TableCell>
                                    <TableCell>Dịch vụ</TableCell>
                                    <TableCell>Giá</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {patientOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.examinationdate ? new Date(order.examinationdate).toLocaleDateString('vi-VN') : ''}</TableCell>
                                        <TableCell>{order.prescriptiondetails}</TableCell>
                                        <TableCell>{order.services || 'Không có'}</TableCell>
                                        <TableCell>{order.price ? Number(order.price).toLocaleString() + ' VND' : ''}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" onClick={() => handleViewOrderDetail(order)}>Chi tiết & sửa</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal chi tiết đơn thuốc cho phép sửa */}
            {selectedOrder && (
                <Dialog open={!!selectedOrder} onClose={handleCloseOrderDetail} maxWidth="md" fullWidth>
                    <DialogTitle>Chi tiết & cập nhật đơn thuốc</DialogTitle>
                    <DialogContent>
                        {/* ...Bạn có thể tái sử dụng PatientDetailsModal ở đây nếu muốn... */}
                        <Box sx={{ py: 2 }}>
                            <div>ID: {selectedOrder.id}</div>
                            <div>Bệnh nhân: {selectedOrder.patientname}</div>
                            <div>Ngày khám: {selectedOrder.examinationdate ? new Date(selectedOrder.examinationdate).toLocaleDateString('vi-VN') : ''}</div>
                            <div>Chi tiết: {selectedOrder.prescriptiondetails}</div>
                            <div>Dịch vụ: {selectedOrder.services || 'Không có'}</div>
                            <div>Giá: {selectedOrder.price ? Number(selectedOrder.price).toLocaleString() + ' VND' : ''}</div>
                            {/* Bạn có thể thêm form sửa ở đây nếu muốn */}
                        </Box>
                    </DialogContent>
                </Dialog>
            )}

            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            <ConfirmDialog
                open={confirmOpen}
                title="Xác nhận xóa"
                content="Bạn có chắc chắn muốn xóa bệnh nhân này?"
                onOk={deleteBenhNhan}
                onCancel={() => {
                    setConfirmOpen(false);
                    setDeleteId(null);
                }}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ color: "error", variant: "contained" }}
            />
        </Container>
    );
}

export default BenhNhanPage;