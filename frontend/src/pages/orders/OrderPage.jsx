import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast, Toaster } from 'sonner';
import AddIcon from '@mui/icons-material/Add';

const PageHeader = ({ onAdd }) => (
    <Box sx={{ mb: 3 }}>
        <Typography
            className="text-center bold text-5xl"
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontSize: '48px', fontWeight: 'bold', color: '#333' }}
        >
            Quản Lý Đơn Thuốc
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
                variant="contained"
                color="primary"
                onClick={onAdd}
                startIcon={<AddIcon />}
            >
                Thêm Đơn Thuốc Mới
            </Button>
        </Box>
    </Box>
);

const AddPrescriptionModal = ({ open, onClose, onSuccess }) => {
    const [selectedBenhNhanId, setSelectedBenhNhanId] = useState('');
    const [thuocList, setThuocList] = useState([]);
    const [selectedThuoc, setSelectedThuoc] = useState([]);
    const [total, setTotal] = useState(0);
    const [benhNhanList, setBenhNhanList] = useState([]);
    const [dichVuList, setDichVuList] = useState([]);
    const [selectedDichVu, setSelectedDichVu] = useState([]);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/thuoc/all')
            .then(res => res.json())
            .then(data => setThuocList(data.data || []))
            .catch(err => {
                console.error('Error fetching thuoc:', err);
                toast.error('Lỗi khi tải danh sách thuốc');
            });
        fetch('http://localhost:5000/api/benhnhan')
            .then(res => res.json())
            .then(data => setBenhNhanList(data.data || []))
            .catch(err => {
                console.error('Error fetching benhnhan:', err);
                toast.error('Lỗi khi tải danh sách bệnh nhân');
            });
        fetch('http://localhost:5000/api/dichvu/all')
            .then(res => res.json())
            .then(data => setDichVuList(data.data || []))
            .catch(err => {
                console.error('Error fetching dichvu:', err);
                toast.error('Lỗi khi tải danh sách dịch vụ');
            });
    }, [open]);

    useEffect(() => {
        let sum = 0;
        selectedThuoc.forEach(item => {
            const found = thuocList.find(t => t.thuocid === Number(item.thuocid));
            if (found) sum += Number(found.giatienmotcong) * Number(item.soluong || 0);
        });
        selectedDichVu.forEach(item => {
            const dv = dichVuList.find(d => d.dichvuid === Number(item.dichvuid));
            if (dv && item.songay) sum += Number(dv.giadichvu) * Number(item.songay);
        });
        setTotal(sum);
    }, [selectedThuoc, thuocList, selectedDichVu, dichVuList]);

    const handleThuocChange = (idx, field, value) => {
        setSelectedThuoc(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };
    const handleAddThuoc = () => {
        setSelectedThuoc(prev => [...prev, { thuocid: '', soluong: 1 }]);
    };
    const handleRemoveThuoc = idx => {
        setSelectedThuoc(prev => prev.filter((_, i) => i !== idx));
    };
    const handleAddDichVu = () => {
        setSelectedDichVu(prev => [...prev, { dichvuid: '', songay: 1, dates: [] }]);
    };
    const handleRemoveDichVu = idx => {
        setSelectedDichVu(prev => prev.filter((_, i) => i !== idx));
    };
    const handleDichVuChange = (idx, field, value) => {
        setSelectedDichVu(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };
    const handleDateChange = (idx, date, dateIdx) => {
        setSelectedDichVu(prev =>
            prev.map((item, i) => {
                if (i !== idx) return item;
                const newDates = [...item.dates];
                newDates[dateIdx] = date;
                return { ...item, dates: newDates };
            })
        );
    };

    const handleSubmit = async () => {
        if (!selectedBenhNhanId) {
            toast.error('Vui lòng chọn bệnh nhân');
            return;
        }
        for (const item of selectedThuoc) {
            const found = thuocList.find(t => t.thuocid === Number(item.thuocid));
            console.log(found);
            if (found && Number(item.soluong) > Number(found.soluongcong)) {
                toast.error(`Thuốc "${found.tenthuoc}" chỉ còn ${found.soluongcong} viên, bạn đã chọn ${item.soluong}`);
                return;
            }
        }
        const patientObj = benhNhanList.find(b => b.benhnhanid === Number(selectedBenhNhanId));
        const patientName = patientObj ? patientObj.hoten : '';
        try {
            await fetch('http://localhost:5000/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName,
                    medicines: selectedThuoc.map(item => ({
                        thuocid: Number(item.thuocid),
                        soluong: Number(item.soluong),
                    })),
                    services: selectedDichVu.map(item => ({
                        dichvuid: Number(item.dichvuid),
                        songay: Number(item.songay),
                        dates: item.dates,
                    })),
                    note,
                }),
            });
            await fetch('http://localhost:5000/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    object: 'donthuoc',
                    changes: `Thêm đơn thuốc mới cho bệnh nhân: ${patientName} với ${JSON.stringify({
                        medicines: selectedThuoc.map(item => ({
                            thuocid: Number(item.thuocid),
                            soluong: Number(item.soluong),
                        })),
                        services: selectedDichVu.map(item => ({
                            dichvuid: Number(item.dichvuid),
                            songay: Number(item.songay),
                            dates: item.dates,
                        })),
                        note,
                    })}`,
                }),
            });
            toast.success('Thêm đơn thuốc thành công!');
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('Error submitting prescription:', err);
            toast.error('Lỗi khi thêm đơn thuốc');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm Đơn Thuốc Mới</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Bệnh nhân:</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                        <TextField
                            select
                            label="Chọn bệnh nhân"
                            SelectProps={{ native: true }}
                            value={selectedBenhNhanId}
                            onChange={e => setSelectedBenhNhanId(e.target.value)}
                            fullWidth
                        >
                            <option value=""></option>
                            {benhNhanList.map(b => (
                                <option key={b.benhnhanid} value={b.benhnhanid}>
                                    {b.hoten}
                                </option>
                            ))}
                        </TextField>
                    </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        label="Ghi chú"
                        multiline
                        minRows={3}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Thuốc:</Typography>
                    <Button variant="outlined" onClick={handleAddThuoc}>
                        Thêm thuốc
                    </Button>
                </Box>
                {selectedThuoc.map((item, idx) => (
                    <Box
                        key={idx}
                        sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <TextField
                            select
                            label="Chọn thuốc"
                            SelectProps={{ native: true }}
                            value={item.thuocid}
                            onChange={e => handleThuocChange(idx, 'thuocid', e.target.value)}
                            sx={{ minWidth: 180, flexGrow: 1 }}
                        >
                            <option value=""></option>
                            {thuocList.map(t => (
                                <option key={t.thuocid} value={t.thuocid}>
                                    {t.tenthuoc}
                                </option>
                            ))}
                        </TextField>
                        <TextField
                            type="number"
                            label="Số lượng"
                            value={item.soluong}
                            onChange={e => handleThuocChange(idx, 'soluong', e.target.value)}
                            sx={{ minWidth: 100, flexGrow: 1 }}
                            inputProps={{ min: 1 }}
                        />
                        <Button color="error" onClick={() => handleRemoveThuoc(idx)}>
                            Xóa
                        </Button>
                    </Box>
                ))}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Dịch vụ (tùy chọn):</Typography>
                    <Button variant="outlined" onClick={handleAddDichVu}>
                        Thêm dịch vụ
                    </Button>
                </Box>
                {selectedDichVu.length > 0 &&
                    selectedDichVu.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}
                        >
                            <TextField
                                select
                                label="Dịch vụ"
                                SelectProps={{ native: true }}
                                value={item.dichvuid}
                                onChange={e => handleDichVuChange(idx, 'dichvuid', e.target.value)}
                                sx={{ minWidth: 180, flexGrow: 1 }}
                            >
                                <option value=""></option>
                                {dichVuList.map(dv => (
                                    <option key={dv.dichvuid} value={dv.dichvuid}>
                                        {dv.tendichvu} ({dv.giadichvu} VND)
                                    </option>
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
                            <Button color="error" onClick={() => handleRemoveDichVu(idx)}>
                                Xóa
                            </Button>
                        </Box>
                    ))}
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                    Tổng tiền: {total.toLocaleString()} VND
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const PrescriptionTable = ({ prescriptions, onViewDetails, page, pageSize, totalPages, onPageChange }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
                width: '100%',
                mt: 4,
                boxSizing: 'border-box',
            }}
        >
            <TableContainer
                component={Paper}
                sx={{
                    maxWidth: 1200,
                    width: '100%',
                    maxHeight: 400,
                    overflow: 'auto',
                    mx: 'auto',
                }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="prescription table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Họ Tên Bệnh Nhân
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Lưu Ý Bệnh Nhân
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Ngày Khám
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Chi Tiết Đơn Thuốc
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Dịch Vụ
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#333',
                                    position: 'sticky',
                                    top: 0,
                                    backgroundColor: '#f5f5f5',
                                    zIndex: 1,
                                }}
                            >
                                Hành Động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {prescriptions.length > 0 ? (
                            prescriptions.map(row => (
                                <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                                    <TableCell>{row.patientname || 'N/A'}</TableCell>
                                    <TableCell>
                                        {row.luuydonthuoc ? (
                                            <span>{row.luuydonthuoc}</span>
                                        ) : (
                                            <span style={{ color: '#888' }}>Không có</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{row.examinationdate || 'N/A'}</TableCell>
                                    <TableCell>
                                        {Array.isArray(row.medicines) && row.medicines.length > 0 ? (
                                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                                {row.medicines.map((item, idx) => (
                                                    <li key={idx}>
                                                        {item.tenthuoc || 'N/A'} ({item.soluong || 0})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span style={{ color: '#888' }}>Không có</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(row.services) && row.services.length > 0 ? (
                                            <div className="flex flex-col">
                                                {row.services.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.tendichvu || 'N/A'} ({item.songay || 0} ngày)
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#888' }}>Không có</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => onViewDetails(row)}
                                        >
                                            Xem Chi Tiết
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box
                sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: 1200, // Match table width to prevent overflow
                    px: { xs: 2, sm: 3 }, // Consistent padding
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => onPageChange(value)}
                    color="primary"
                    size="large" // Larger pagination buttons for better visibility
                />
            </Box>
        </Box>
    );
};

const PatientDetailsModal = ({ open, onClose, patient, onReload }) => {
    const [medicines, setMedicines] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [total, setTotal] = useState(0);
    const [thuocList, setThuocList] = useState([]);
    const [dichVuList, setDichVuList] = useState([]);
    const [selectedDichVu, setSelectedDichVu] = useState([]);
    const [luuyDonThuoc, setLuuyDonThuoc] = useState('');

    useEffect(() => {
        if (open && patient) {
            setPatientName(patient.patientname || '');
            setMedicines(patient.medicines || []);
            setSelectedDichVu(patient.services || []);
            setLuuyDonThuoc(patient.luuydonthuoc || '');
        }
    }, [open, patient]);

    useEffect(() => {
        fetch('http://localhost:5000/api/thuoc')
            .then(res => res.json())
            .then(data => setThuocList(data.data || []))
            .catch(err => {
                console.error('Error fetching thuoc:', err);
                toast.error('Lỗi khi tải danh sách thuốc');
            });
        fetch('http://localhost:5000/api/dichvu')
            .then(res => res.json())
            .then(data => setDichVuList(data.data || []))
            .catch(err => {
                console.error('Error fetching dichvu:', err);
                toast.error('Lỗi khi tải danh sách dịch vụ');
            });
    }, []);

    useEffect(() => {
        let sum = 0;
        medicines.forEach(item => {
            // Tìm đúng thuốc theo thuocid
            let thuocId = item.thuocid;
            if (!thuocId) {
                // Nếu chỉ có tenthuoc, tìm thuocid từ danh sách
                const foundByName = thuocList.find(t => t.tenthuoc === item.tenthuoc);
                thuocId = foundByName ? foundByName.thuocid : null;
            }
            const found = thuocList.find(t => t.thuocid === Number(thuocId));
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

    const handleMedicineChange = (idx, field, value) => {
        setMedicines(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };

    const handleDichVuChange = (idx, field, value) => {
        setSelectedDichVu(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };

    const handleAddMedicine = () => {
        setMedicines(prev => [...prev, { tenthuoc: '', soluong: 1, chuy: '' }]);
    };

    const handleRemoveMedicine = idx => {
        setMedicines(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAddDichVu = () => {
        setSelectedDichVu(prev => [...prev, { dichvuid: '', songay: 1, dates: [] }]);
    };

    const handleRemoveDichVu = idx => {
        setSelectedDichVu(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!patient || !patient.id) {
            toast.error('Không có thông tin đơn thuốc để cập nhật');
            return;
        }
        for (const item of medicines) {
            // Tìm thuốc trong kho
            const thuocObj = thuocList.find(t => t.tenthuoc === item.tenthuoc);
            // Tìm số lượng đã cấp phát cho đơn này (nếu có)
            const oldMed = Array.isArray(patient.medicines)
                ? patient.medicines.find(m => m.tenthuoc === item.tenthuoc)
                : null;
            const oldQty = oldMed ? Number(oldMed.soluong) : 0;
            const maxQty = Number(thuocObj?.soluongcong || 0) + oldQty;
            if (thuocObj && Number(item.soluong) > maxQty) {
                toast.error(`Thuốc "${thuocObj.tenthuoc}" chỉ còn ${maxQty} viên (bao gồm đã cấp phát), bạn đã chọn ${item.soluong}`);
                return;
            }
        }
        const medicinesData = medicines
            .map(item => {
                const thuocObj = thuocList.find(t => t.tenthuoc === item.tenthuoc);
                return {
                    thuocid: thuocObj ? thuocObj.thuocid : null,
                    soluong: Number(item.soluong),
                    chuy: item.chuy || '',
                };
            })
            .filter(m => m.thuocid && m.soluong > 0);
        const servicesData = selectedDichVu
            .map(item => ({
                dichvuid: item.dichvuid ? Number(item.dichvuid) : null,
                songay: Number(item.songay),
                dates: item.dates,
            }))
            .filter(dv => dv.dichvuid);
        try {
            const res = await fetch(`http://localhost:5000/api/prescriptions/${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName,
                    medicines: medicinesData,
                    services: servicesData,
                    luuydonthuoc: luuyDonThuoc,
                }),
            });
            const changes = [];
            if (patient) {
                if (patient.luuydonthuoc !== luuyDonThuoc) {
                    changes.push(`Lưu ý đơn thuốc: ${patient.luuydonthuoc || ''} → ${luuyDonThuoc}`);
                }
                const oldMeds = Array.isArray(patient.medicines) ? patient.medicines : [];
                if (JSON.stringify(oldMeds) !== JSON.stringify(medicines)) {
                    changes.push('Cập nhật thuốc : ' + JSON.stringify(medicines));
                }
                const oldSv = Array.isArray(patient.services) ? patient.services : [];
                if (JSON.stringify(oldSv) !== JSON.stringify(selectedDichVu)) {
                    changes.push('Cập nhật dịch vụ : ' + JSON.stringify(selectedDichVu));
                }
            }
            await fetch('http://localhost:5000/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    object: 'prescription',
                    objectId: patient.id,
                    changes: changes.join('; '),
                }),
            });
            if (!res.ok) throw new Error('Cập nhật thất bại');
            if (typeof onReload === 'function') {
                onReload();
            }
            toast.success('Cập nhật đơn thuốc thành công!');
            onClose();
        } catch (err) {
            console.error('Error updating prescription:', err);
            toast.error('Lỗi khi cập nhật đơn thuốc');
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
                    <Button variant="outlined" onClick={handleAddMedicine}>
                        Thêm thuốc
                    </Button>
                </Box>
                {medicines.map((item, idx) => (
                    <Box
                        key={idx}
                        sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <TextField
                            select
                            label="Thuốc"
                            SelectProps={{ native: true }}
                            value={item.tenthuoc}
                            onChange={e => handleMedicineChange(idx, 'tenthuoc', e.target.value)}
                            sx={{ minWidth: 180, flexGrow: 1 }}
                        >
                            <option value=""></option>
                            {thuocList.map(t => (
                                <option key={t.thuocid} value={t.tenthuoc}>
                                    {t.tenthuoc}
                                </option>
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
                        <Button color="error" onClick={() => handleRemoveMedicine(idx)}>
                            Xóa
                        </Button>
                    </Box>
                ))}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Dịch vụ:</Typography>
                    <Button variant="outlined" onClick={handleAddDichVu}>
                        Thêm dịch vụ
                    </Button>
                </Box>
                {selectedDichVu.length > 0 &&
                    selectedDichVu.map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}
                        >
                            <TextField
                                select
                                label="Dịch vụ"
                                SelectProps={{ native: true }}
                                value={item.dichvuid}
                                onChange={e => handleDichVuChange(idx, 'dichvuid', e.target.value)}
                                sx={{ minWidth: 180, flexGrow: 1 }}
                            >
                                <option value=""></option>
                                {dichVuList.map(dv => (
                                    <option key={dv.dichvuid} value={dv.dichvuid}>
                                        {dv.tendichvu} ({dv.giadichvu} VND)
                                    </option>
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
                            <Button color="error" onClick={() => handleRemoveDichVu(idx)}>
                                Xóa
                            </Button>
                        </Box>
                    ))}
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                    Tổng tiền: {total.toLocaleString()} VND
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Đóng
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Lưu cập nhật
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const PrescriptionManagementPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchPrescriptions = async (pageNum = 1) => {
        try {
            const res = await fetch(`http://localhost:5000/api/prescriptions?page=${pageNum}&limit=${pageSize}`);
            const data = await res.json();
            setPrescriptions(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setPrescriptions([]);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        fetchPrescriptions(page);
    }, [page]);

    const handleViewDetails = patient => {
        setSelectedPatient(patient);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedPatient(null);
    };

    const handleAddOpen = () => setAddOpen(true);
    const handleAddClose = () => setAddOpen(false);
    const handleAddSuccess = () => {
        fetchPrescriptions(page);
    };

    const handlePageChange = value => {
        setPage(value);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
                <Toaster position="top-right" richColors />
                <PageHeader onAdd={handleAddOpen} />
                <PrescriptionTable
                    prescriptions={prescriptions}
                    onViewDetails={handleViewDetails}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                <PatientDetailsModal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    patient={selectedPatient}
                    onReload={() => fetchPrescriptions(page)}
                />
                <AddPrescriptionModal open={addOpen} onClose={handleAddClose} onSuccess={handleAddSuccess} />
            </Box>
        </LocalizationProvider>
    );
};

export default PrescriptionManagementPage;