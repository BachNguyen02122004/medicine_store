import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box
} from '@mui/material';
import { toast } from 'sonner';

const OrderDetailDialog = ({ open, order, onClose, onSave }) => {
    const [medicines, setMedicines] = useState([]);
    const [patientName, setPatientName] = useState("");
    const [total, setTotal] = useState(0);
    const [thuocList, setThuocList] = useState([]);
    const [dichVuList, setDichVuList] = useState([]);
    const [selectedDichVu, setSelectedDichVu] = useState([]);
    const [luuyDonThuoc, setLuuyDonThuoc] = useState("");

    // Fetch danh sách thuốc và dịch vụ
    useEffect(() => {
        fetch('http://localhost:5000/api/thuoc')
            .then(res => res.json())
            .then(data => setThuocList(data.data || []))
            .catch(() => toast.error('Lỗi khi tải danh sách thuốc'));
        fetch('http://localhost:5000/api/dichvu')
            .then(res => res.json())
            .then(data => setDichVuList(data.data || []))
            .catch(() => toast.error('Lỗi khi tải danh sách dịch vụ'));
    }, []);

    // Khởi tạo dữ liệu từ order
    useEffect(() => {
        if (open && order) {
            setPatientName(order.patientname || order.patientName || "");
            setMedicines(order.medicines || []);
            setSelectedDichVu(order.services || []);
            setLuuyDonThuoc(order.luuydonthuoc || "");
        }
    }, [open, order]);

    // Tính tổng tiền
    useEffect(() => {
        let sum = 0;
        medicines.forEach(item => {
            const found = thuocList.find(t => t.thuocid === Number(item.thuocid));
            if (found) sum += Number(found.giatienmotcong) * Number(item.soluong || 0);
        });
        selectedDichVu.forEach(item => {
            let price = 0;
            if (item.dichvuid) {
                const dv = dichVuList.find(d => d.dichvuid === Number(item.dichvuid));
                if (dv) price = Number(dv.giadichvu);
            } else if (item.giadichvu) {
                price = Number(item.giadichvu);
            }
            if (price && item.songay) sum += price * Number(item.songay);
        });
        setTotal(sum);
    }, [medicines, thuocList, selectedDichVu, dichVuList]);

    // Xử lý thay đổi thuốc
    const handleMedicineChange = (idx, field, value) => {
        setMedicines(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };

    // Thêm thuốc mới
    const handleAddMedicine = () => {
        setMedicines(prev => [...prev, { tenthuoc: '', soluong: 1, chuy: '' }]);
    };

    // Xóa thuốc
    const handleRemoveMedicine = (idx) => {
        setMedicines(prev => prev.filter((_, i) => i !== idx));
    };

    // Xử lý thay đổi dịch vụ
    const handleDichVuChange = (idx, field, value) => {
        setSelectedDichVu(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };

    // Thêm dịch vụ mới
    const handleAddDichVu = () => {
        setSelectedDichVu(prev => [...prev, { dichvuid: '', songay: 1, dates: [] }]);
    };

    // Xóa dịch vụ
    const handleRemoveDichVu = (idx) => {
        setSelectedDichVu(prev => prev.filter((_, i) => i !== idx));
    };

    // Lưu cập nhật
    const handleSave = async () => {
        if (!order || !order.id) {
            toast.error("Không có đơn thuốc để cập nhật");
            return;
        }
        const medicinesData = medicines.map(item => {
            const thuocObj = thuocList.find(t => t.tenthuoc === item.tenthuoc);
            return {
                thuocid: thuocObj ? thuocObj.thuocid : null,
                soluong: Number(item.soluong),
                chuy: item.chuy || ""
            };
        }).filter(m => m.thuocid && m.soluong > 0);
        const servicesData = selectedDichVu.map(item => ({
            dichvuid: item.dichvuid ? Number(item.dichvuid) : null,
            songay: Number(item.songay),
            dates: item.dates
        })).filter(dv => dv.dichvuid);
        try {
            const res = await fetch(`http://localhost:5000/api/prescriptions/${order.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName,
                    medicines: medicinesData,
                    services: servicesData,
                    luuydonthuoc: luuyDonThuoc
                })
            });
            if (!res.ok) throw new Error("Cập nhật thất bại");
            if (typeof onSave === 'function') {
                onSave({ id: order.id, patientName, medicines: medicinesData, services: servicesData, luuydonthuoc: luuyDonThuoc });
            }
            toast.success("Cập nhật đơn thuốc thành công!");
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch {
            toast.error("Có lỗi khi cập nhật đơn thuốc!");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Chi Tiết & Cập Nhật Đơn Thuốc</DialogTitle>
            <DialogContent>
                <TextField label="Họ Tên" value={patientName} fullWidth disabled sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Lưu ý đơn thuốc"
                        multiline
                        minRows={3}
                        value={luuyDonThuoc}
                        onChange={e => setLuuyDonThuoc(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Thuốc:</Typography>
                    <Button variant="outlined" onClick={handleAddMedicine}>Thêm thuốc</Button>
                </Box>
                {medicines.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            select
                            label="Thuốc"
                            SelectProps={{ native: true }}
                            value={item.tenthuoc}
                            onChange={e => handleMedicineChange(idx, 'tenthuoc', e.target.value)}
                            sx={{ minWidth: 180, flexGrow: 1 }}
                        >
                            <option value="">--Chọn thuốc--</option>
                            {thuocList.map(t => (
                                <option key={t.thuocid} value={t.tenthuoc}>{t.tenthuoc}</option>
                            ))}
                        </TextField>
                        <TextField
                            type="number"
                            label="Số lượng"
                            value={item.soluong}
                            onChange={e => handleMedicineChange(idx, 'soluong', e.target.value)}
                            sx={{ minWidth: 100, flexGrow: 1 }}
                            inputProps={{ min: 1 }}
                        />
                        <TextField
                            label="Chú ý"
                            value={item.chuy}
                            onChange={e => handleMedicineChange(idx, 'chuy', e.target.value)}
                            sx={{ minWidth: 120, flexGrow: 1 }}
                        />
                        <Button color="error" onClick={() => handleRemoveMedicine(idx)}>Xóa</Button>
                    </Box>
                ))}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Dịch vụ:</Typography>
                    <Button variant="outlined" onClick={handleAddDichVu}>Thêm dịch vụ</Button>
                </Box>
                {selectedDichVu.length > 0 && selectedDichVu.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            select
                            label="Dịch vụ"
                            SelectProps={{ native: true }}
                            value={item.dichvuid}
                            onChange={e => handleDichVuChange(idx, 'dichvuid', e.target.value)}
                            sx={{ minWidth: 180, flexGrow: 1 }}
                        >
                            <option value="">--Chọn dịch vụ--</option>
                            {dichVuList.map(dv => (
                                <option key={dv.dichvuid} value={dv.dichvuid}>{dv.tendichvu} ({dv.giadichvu} VND)</option>
                            ))}
                        </TextField>
                        <TextField
                            type="number"
                            label="Số ngày"
                            value={item.songay}
                            onChange={e => {
                                const val = Math.max(1, Number(e.target.value));
                                handleDichVuChange(idx, 'songay', val);
                            }}
                            sx={{ minWidth: 100, flexGrow: 1 }}
                            inputProps={{ min: 1 }}
                        />
                        <Button color="error" onClick={() => handleRemoveDichVu(idx)}>Xóa</Button>
                    </Box>
                ))}
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>Tổng tiền: {total.toLocaleString()} VND</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Đóng</Button>
                <Button onClick={handleSave} variant="contained" color="primary">Lưu cập nhật</Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailDialog;