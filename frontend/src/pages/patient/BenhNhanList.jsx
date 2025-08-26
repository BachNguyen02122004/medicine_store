import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import OrderDetailDialog from '../orders/OrderDetailDialog';

function BenhNhanList({ benhnhans, onEdit, onDelete }) {
    const [openCart, setOpenCart] = useState(false);
    const [cartOrders, setCartOrders] = useState([]);
    const [cartPatient, setCartPatient] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Xử lý khi bấm "Xem giỏ hàng"
    const handleShowCart = async (bn) => {
        if (!bn || !bn.benhnhanid) {
            toast.error('Không tìm thấy ID bệnh nhân');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/prescriptions/patient?benhnhanid=${bn.benhnhanid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // data là mảng đơn thuốc
            const orders = Array.isArray(data) ? data.map(order => ({
                id: order.id,
                patientName: order.patientname || '',
                examinationDate: order.examinationdate ? new Date(order.examinationdate).toLocaleDateString('vi-VN') : '',
                medicines: Array.isArray(order.medicines) ? order.medicines : [],
                services: Array.isArray(order.services) ? order.services : [],
                price: order.price != null && !isNaN(order.price) ? Number(order.price) : 0,
                luuydonthuoc: order.luuydonthuoc || ''
            })) : [];
            setCartOrders(orders);
            setCartPatient(bn);
            setOpenCart(true);
            if (orders.length === 0) {
                toast.info('Bệnh nhân này chưa có đơn thuốc nào');
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            toast.error('Lỗi khi tải danh sách đơn thuốc');
        }
    };

    const handleViewOrderDetail = (order) => {
        if (order && order.id) {
            setSelectedOrder(order);
        } else {
            toast.error('Đơn thuốc không hợp lệ');
        }
    };

    const handleCloseOrderDetail = () => {
        setSelectedOrder(null);
    };

    const handleSaveOrder = async () => {
        // Làm mới danh sách đơn thuốc sau khi lưu
        if (cartPatient) {
            await handleShowCart(cartPatient);
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <Paper sx={{ width: '100%', boxShadow: 1 }}>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', width: '100%' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="benhnhan table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>Họ tên</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>Tuổi</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>Số điện thoại</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>Tiền sử bệnh</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#333' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {benhnhans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#666' }}>
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                benhnhans.map((bn, idx) => (
                                    <TableRow key={bn.benhnhanid || idx} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                                        <TableCell sx={{ color: '#333' }}>{bn.benhnhanid}</TableCell>
                                        <TableCell sx={{ color: '#333' }}>{bn.hoten}</TableCell>
                                        <TableCell sx={{ color: '#333' }}>{bn.tuoi}</TableCell>
                                        <TableCell sx={{ color: '#333' }}>{bn.sodienthoai}</TableCell>
                                        <TableCell sx={{ color: '#333' }}>{bn.tiensubenh}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                sx={{ mr: 1, minWidth: 'auto' }}
                                                onClick={() => handleShowCart(bn)}
                                            >
                                                Xem giỏ hàng
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                startIcon={<EditIcon />}
                                                onClick={() => onEdit(bn)}
                                                sx={{ mr: 1, minWidth: 'auto' }}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => onDelete(bn.benhnhanid)}
                                                sx={{ minWidth: 'auto' }}
                                            >
                                                Xóa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
            {/* Popup giỏ hàng */}
            <Dialog open={openCart} onClose={() => setOpenCart(false)} maxWidth="md" fullWidth>
                <DialogTitle>Giỏ hàng của bệnh nhân {cartPatient?.hoten}</DialogTitle>
                <DialogContent>
                    {cartOrders.length === 0 ? (
                        <Box sx={{ color: '#888', py: 2 }}>Không có đơn thuốc nào đã mua</Box>
                    ) : (
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Ngày khám</TableCell>
                                    <TableCell>Chi tiết thuốc</TableCell>
                                    <TableCell>Dịch vụ</TableCell>
                                    <TableCell>Lưu ý đơn thuốc</TableCell>
                                    <TableCell>Giá</TableCell>
                                    <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cartOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.examinationDate}</TableCell>
                                        <TableCell>
                                            {Array.isArray(order.medicines) && order.medicines.length > 0 ? (
                                                <ul style={{ paddingLeft: 16, margin: 0 }}>
                                                    {order.medicines.map((med, idx) => (
                                                        <li key={idx}>
                                                            {med.tenthuoc} (x{med.soluong}){med.chuy ? ` - ${med.chuy}` : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <span style={{ color: '#888' }}>Không có</span>}
                                        </TableCell>
                                        <TableCell>
                                            {Array.isArray(order.services) && order.services.length > 0 ? (
                                                <ul style={{ paddingLeft: 16, margin: 0 }}>
                                                    {order.services.map((sv, idx) => (
                                                        <li key={idx}>
                                                            {sv.tendichvu} ({sv.songay} ngày)
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <span style={{ color: '#888' }}>Không có</span>}
                                        </TableCell>
                                        <TableCell>{order.luuydonthuoc ? order.luuydonthuoc : <span style={{ color: '#888' }}>Không có</span>}</TableCell>
                                        <TableCell>{order.price ? Number(order.price).toLocaleString() + ' VND' : ''}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" onClick={() => handleViewOrderDetail(order)}>
                                                Xem chi tiết
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            {/* Popup chi tiết đơn thuốc */}
            <OrderDetailDialog
                open={!!selectedOrder}
                order={selectedOrder}
                onClose={handleCloseOrderDetail}
                onSave={handleSaveOrder}
            />
        </>
    );
}

export default BenhNhanList;