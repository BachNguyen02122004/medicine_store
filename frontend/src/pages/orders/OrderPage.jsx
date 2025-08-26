import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
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
    Container
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


    const handleSubmit = async () => {
        // Kiểm tra bệnh nhân có tồn tại trong danh sách
        const patientObj = benhNhanList.find(b => b.benhnhanid === Number(selectedBenhNhanId));
        if (!selectedBenhNhanId || !patientObj) {
            toast.error('Bệnh nhân không tồn tại trong danh sách!');
            return;
        }
        // Kiểm tra từng thuốc có tồn tại trong danh sách
        for (const item of selectedThuoc) {
            if (!item.tenthuoc) {
                toast.error('Vui lòng nhập tên thuốc!');
                return;
            }
            const found = thuocList.find(t => t.tenthuoc === item.tenthuoc);
            if (!found) {
                toast.error(`Thuốc "${item.tenthuoc}" không có trong danh sách!`);
                return;
            }
            if (Number(item.soluong) > Number(found.soluongcong)) {
                toast.error(`Thuốc "${found.tenthuoc}" chỉ còn ${found.soluongcong} viên, bạn đã chọn ${item.soluong}`);
                return;
            }
        }
        // Kiểm tra từng dịch vụ có tồn tại trong danh sách (nếu có nhập)
        for (const item of selectedDichVu) {
            if (!item.tendichvu) continue;
            const found = dichVuList.find(dv => dv.tendichvu === item.tendichvu);
            if (!found) {
                toast.error(`Dịch vụ "${item.tendichvu}" không có trong danh sách!`);
                return;
            }
        }
        const patientName = patientObj.hoten;
        try {
            await fetch('http://localhost:5000/api/prescriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName,
                    medicines: selectedThuoc.map(item => ({
                        thuocid: thuocList.find(t => t.tenthuoc === item.tenthuoc)?.thuocid,
                        soluong: Number(item.soluong),
                    })),
                    services: selectedDichVu.map(item => ({
                        dichvuid: dichVuList.find(dv => dv.tendichvu === item.tendichvu)?.dichvuid,
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
                            thuocid: thuocList.find(t => t.tenthuoc === item.tenthuoc)?.thuocid,
                            soluong: Number(item.soluong),
                        })),
                        services: selectedDichVu.map(item => ({
                            dichvuid: dichVuList.find(dv => dv.tendichvu === item.tendichvu)?.dichvuid,
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
                    <Autocomplete
                        options={benhNhanList.map(b => ({ label: b.hoten, value: b.benhnhanid }))}
                        getOptionLabel={option => option.label || ''}
                        value={benhNhanList.find(b => b.benhnhanid === Number(selectedBenhNhanId)) ? { label: benhNhanList.find(b => b.benhnhanid === Number(selectedBenhNhanId)).hoten, value: selectedBenhNhanId } : null}
                        onChange={(e, val) => setSelectedBenhNhanId(val ? val.value : '')}
                        renderInput={params => (
                            <TextField {...params} label="Tìm hoặc chọn bệnh nhân" fullWidth placeholder="Nhập tên bệnh nhân..." />
                        )}
                        sx={{ flexGrow: 1, minWidth: 220 }}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                    />
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
                        <Autocomplete
                            freeSolo
                            options={thuocList.map(t => t.tenthuoc)}
                            value={item.tenthuoc || ''}
                            onChange={(e, val) => {
                                const found = thuocList.find(t => t.tenthuoc === val);
                                setSelectedThuoc(prev => prev.map((it, i) => i === idx ? {
                                    ...it,
                                    tenthuoc: val || '',
                                    thuocid: found ? found.thuocid : ''
                                } : it));
                            }}
                            onInputChange={(e, val) => {
                                const found = thuocList.find(t => t.tenthuoc === val);
                                setSelectedThuoc(prev => prev.map((it, i) => i === idx ? {
                                    ...it,
                                    tenthuoc: val,
                                    thuocid: found ? found.thuocid : ''
                                } : it));
                            }}
                            renderInput={params => (
                                <TextField {...params} label="Tìm hoặc nhập tên thuốc" sx={{ minWidth: 180, flexGrow: 1 }} placeholder="Nhập tên thuốc..." />
                            )}
                        />
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
                            <Autocomplete
                                freeSolo
                                options={dichVuList.map(dv => dv.tendichvu)}
                                value={item.tendichvu || ''}
                                onChange={(e, val) => {
                                    const found = dichVuList.find(dv => dv.tendichvu === val);
                                    setSelectedDichVu(prev => prev.map((it, i) => i === idx ? {
                                        ...it,
                                        tendichvu: val || '',
                                        dichvuid: found ? found.dichvuid : ''
                                    } : it));
                                }}
                                onInputChange={(e, val) => {
                                    const found = dichVuList.find(dv => dv.tendichvu === val);
                                    setSelectedDichVu(prev => prev.map((it, i) => i === idx ? {
                                        ...it,
                                        tendichvu: val,
                                        dichvuid: found ? found.dichvuid : ''
                                    } : it));
                                }}
                                renderInput={params => (
                                    <TextField {...params} label="Tìm hoặc nhập tên dịch vụ" sx={{ minWidth: 180, flexGrow: 1 }} placeholder="Nhập tên dịch vụ..." />
                                )}
                            />
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

const PrescriptionTable = ({ prescriptions, onViewDetails, page, totalPages, onPageChange }) => {
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

                    width: '100%',
                    maxHeight: 500,
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
                                    <TableCell>{row.examinationdate ? dayjs(row.examinationdate).format('DD/MM/YYYY') : 'N/A'}</TableCell>
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
        // Kiểm tra từng thuốc có tồn tại trong danh sách
        for (const item of medicines) {
            if (!item.tenthuoc) {
                toast.error('Vui lòng nhập tên thuốc!');
                return;
            }
            const thuocObj = thuocList.find(t => t.tenthuoc === item.tenthuoc);
            if (!thuocObj) {
                toast.error(`Thuốc "${item.tenthuoc}" không có trong danh sách!`);
                return;
            }
            // Tìm số lượng đã cấp phát cho đơn này (nếu có)
            const oldMed = Array.isArray(patient.medicines)
                ? patient.medicines.find(m => m.tenthuoc === item.tenthuoc)
                : null;
            const oldQty = oldMed ? Number(oldMed.soluong) : 0;
            const maxQty = Number(thuocObj?.soluongcong || 0) + oldQty;
            if (Number(item.soluong) > maxQty) {
                toast.error(`Thuốc "${thuocObj.tenthuoc}" chỉ còn ${maxQty} viên (bao gồm đã cấp phát), bạn đã chọn ${item.soluong}`);
                return;
            }
        }
        // Kiểm tra từng dịch vụ có tồn tại trong danh sách (nếu có nhập)
        for (const item of selectedDichVu) {
            if (!item.tendichvu) continue;
            const dvObj = dichVuList.find(dv => dv.tendichvu === item.tendichvu);
            if (!dvObj) {
                toast.error(`Dịch vụ "${item.tendichvu}" không có trong danh sách!`);
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
            .map(item => {
                const dvObj = dichVuList.find(dv => dv.tendichvu === item.tendichvu);
                return {
                    dichvuid: dvObj ? dvObj.dichvuid : null,
                    songay: Number(item.songay),
                    dates: item.dates,
                };
            })
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
                        <Autocomplete
                            freeSolo
                            options={thuocList.map(t => t.tenthuoc)}
                            value={item.tenthuoc || ''}
                            onChange={(e, val) => {
                                const found = thuocList.find(t => t.tenthuoc === val);
                                setMedicines(prev => prev.map((it, i) => i === idx ? {
                                    ...it,
                                    tenthuoc: val || '',
                                    thuocid: found ? found.thuocid : ''
                                } : it));
                            }}
                            onInputChange={(e, val) => {
                                const found = thuocList.find(t => t.tenthuoc === val);
                                setMedicines(prev => prev.map((it, i) => i === idx ? {
                                    ...it,
                                    tenthuoc: val,
                                    thuocid: found ? found.thuocid : ''
                                } : it));
                            }}
                            renderInput={params => (
                                <TextField {...params} label="Tìm hoặc nhập tên thuốc" sx={{ minWidth: 180, flexGrow: 1 }} placeholder="Nhập tên thuốc..." />
                            )}
                        />
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
                            <Autocomplete
                                freeSolo
                                options={dichVuList.map(dv => dv.tendichvu)}
                                value={item.tendichvu || ''}
                                onChange={(e, val) => {
                                    const found = dichVuList.find(dv => dv.tendichvu === val);
                                    setSelectedDichVu(prev => prev.map((it, i) => i === idx ? {
                                        ...it,
                                        tendichvu: val || '',
                                        dichvuid: found ? found.dichvuid : ''
                                    } : it));
                                }}
                                onInputChange={(e, val) => {
                                    const found = dichVuList.find(dv => dv.tendichvu === val);
                                    setSelectedDichVu(prev => prev.map((it, i) => i === idx ? {
                                        ...it,
                                        tendichvu: val,
                                        dichvuid: found ? found.dichvuid : ''
                                    } : it));
                                }}
                                renderInput={params => (
                                    <TextField {...params} label="Tìm hoặc nhập tên dịch vụ" sx={{ minWidth: 180, flexGrow: 1 }} placeholder="Nhập tên dịch vụ..." />
                                )}
                            />
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
            <Container maxWidth={false} sx={{ py: 4, minHeight: '100vh', backgroundColor: '#f5f5f5', width: '100%', px: 0 }}>
                <Toaster position="top-right" richColors />
                <Box textAlign="center" mb={4}>
                    <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#333" }}>Quản Lý Đơn Thuốc</h1>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, px: { xs: 2, sm: 3 } }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddOpen}
                    >
                        Thêm Đơn Thuốc Mới
                    </Button>
                </Box>
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
            </Container>
        </LocalizationProvider>
    );
};

export default PrescriptionManagementPage;