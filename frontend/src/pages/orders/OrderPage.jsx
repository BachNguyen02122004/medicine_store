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
    Checkbox,
    FormControlLabel,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { toast, Toaster } from 'sonner';

const PageHeader = ({ onAdd }) => (
    <Box sx={{ mb: 3 }}>
        <Typography className="text-center bold text-5xl" variant="h4" component="h1" gutterBottom>
            Quản Lý Đơn Thuốc
        </Typography>
        <Button variant="contained" color="primary" onClick={onAdd}>
            Thêm Đơn Thuốc Mới
        </Button>
    </Box>
);

const AddPrescriptionModal = ({ open, onClose, onSuccess }) => {
    const [selectedBenhNhanId, setSelectedBenhNhanId] = useState("");
    const [thuocList, setThuocList] = useState([]);
    const [selectedThuoc, setSelectedThuoc] = useState([]);
    const [total, setTotal] = useState(0);
    const [benhNhanList, setBenhNhanList] = useState([]);
    const [dichVuList, setDichVuList] = useState([]);
    const [selectedDichVu, setSelectedDichVu] = useState([]);
    const [note, setNote] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/thuoc/all")
            .then(res => res.json())
            .then(data => setThuocList(data.data || []));
        fetch("http://localhost:5000/api/benhnhan")
            .then(res => res.json())
            .then(data => setBenhNhanList(data.data || []));
        fetch("http://localhost:5000/api/dichvu/all")
            .then(res => res.json())
            .then(data => setDichVuList(data.data || []));
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
        setSelectedThuoc(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };
    const handleAddThuoc = () => {
        setSelectedThuoc(prev => [...prev, { thuocid: '', soluong: 1 }]);
    };
    const handleRemoveThuoc = (idx) => {
        setSelectedThuoc(prev => prev.filter((_, i) => i !== idx));
    };
    const handleAddDichVu = () => {
        setSelectedDichVu(prev => [...prev, { dichvuid: '', songay: 1, dates: [] }]);
    };
    const handleRemoveDichVu = (idx) => {
        setSelectedDichVu(prev => prev.filter((_, i) => i !== idx));
    };
    const handleDichVuChange = (idx, field, value) => {
        setSelectedDichVu(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };
    const handleDateChange = (idx, date, dateIdx) => {
        setSelectedDichVu(prev => prev.map((item, i) => {
            if (i !== idx) return item;
            const newDates = [...item.dates];
            newDates[dateIdx] = date;
            return { ...item, dates: newDates };
        }));
    };

    const handleSubmit = async () => {
        if (!selectedBenhNhanId) return;
        const patientObj = benhNhanList.find(b => b.benhnhanid === Number(selectedBenhNhanId));
        const patientName = patientObj ? patientObj.hoten : "";
        await fetch("http://localhost:5000/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientName,
                medicines: selectedThuoc.map(item => ({ thuocid: Number(item.thuocid), soluong: Number(item.soluong) })),
                services: selectedDichVu.map(item => ({
                    dichvuid: Number(item.dichvuid),
                    songay: Number(item.songay),
                    dates: item.dates
                })),
                note
            })
        });
        await fetch("http://localhost:5000/api/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create",
                object: "donthuoc",
                changes: `Thêm đơn thuốc mới cho bệnh nhân: ${patientName} với ${JSON.stringify({
                    medicines: selectedThuoc.map(item => ({ thuocid: Number(item.thuocid), soluong: Number(item.soluong) })),
                    services: selectedDichVu.map(item => ({
                        dichvuid: Number(item.dichvuid),
                        songay: Number(item.songay),
                        dates: item.dates
                    })),
                    note
                })}`
            })
        });
        toast.success("Thêm đơn thuốc thành công!");
        onSuccess && onSuccess();
        onClose();
    };

    return (
        <>
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
                                <option value="">--Chọn bệnh nhân--</option>
                                {benhNhanList.map(b => (
                                    <option key={b.benhnhanid} value={b.benhnhanid}>{b.hoten}</option>
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
                        <Button variant="outlined" onClick={handleAddThuoc}>Thêm thuốc</Button>
                    </Box>
                    {selectedThuoc.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                                select
                                label="Chọn thuốc"
                                SelectProps={{ native: true }}
                                value={item.thuocid}
                                onChange={e => handleThuocChange(idx, 'thuocid', e.target.value)}
                                sx={{ minWidth: 180, flexGrow: 1 }}
                            >
                                <option value="">--Chọn thuốc--</option>
                                {thuocList.map(t => (
                                    <option key={t.thuocid} value={t.thuocid}>{t.tenthuoc}</option>
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
                            <Button color="error" onClick={() => handleRemoveThuoc(idx)}>Xóa</Button>
                        </Box>
                    ))}
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography sx={{ minWidth: 120, flexShrink: 0 }}>Dịch vụ (tùy chọn):</Typography>
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
                    <Button onClick={onClose}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Lưu</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const PrescriptionTable = ({ prescriptions, onViewDetails }) => {
    const columns = [
        { field: 'patientname', headerName: 'Họ Tên Bệnh Nhân', width: 200 },
        {
            field: 'luuybenhnhan',
            headerName: 'Lưu ý bệnh nhân',
            width: 220,
            renderCell: (params) => {
                return params.row.luuydonthuoc ? <span>{params.row.luuydonthuoc}</span> : <span style={{ color: '#888' }}>Không có</span>;
            }
        },
        { field: 'examinationdate', headerName: 'Ngày Khám', width: 150 },
        {
            field: 'medicines',
            headerName: 'Chi Tiết Đơn Thuốc',
            width: 300,
            renderCell: (params) => {
                const medicines = Array.isArray(params.row.medicines) ? params.row.medicines : [];
                if (!medicines.length) return <span style={{ color: '#888' }}>Không có</span>;
                return (
                    <ul>
                        {medicines.map((item, idx) => (
                            <li key={idx}>
                                {item.tenthuoc} ({item.soluong})
                            </li>
                        ))}
                    </ul>
                );
            },
        },
        {
            field: 'services', headerName: 'Dịch Vụ', width: 250,
            renderCell: (params) => {
                const svs = Array.isArray(params.row.services) ? params.row.services : [];
                return svs.length ? <div className='flex flex-col'>{svs.map((item, idx) => (
                    <div key={idx}>
                        {item.tendichvu} ({item.songay} ngày)
                    </div>
                ))}</div> : <span style={{ color: '#888' }}>Không có</span>
            },
        },
        {
            field: 'actions',
            headerName: 'Xem Chi Tiết',
            width: 150,
            renderCell: (params) => (
                <Button variant="outlined" onClick={() => onViewDetails(params.row)}>
                    Xem Chi Tiết
                </Button>
            ),
        },
    ];

    return (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <Paper sx={{ height: 500, width: 1200, maxWidth: '100%' }}>
                <DataGrid
                    rows={prescriptions}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    getRowHeight={() => 'auto'}
                />
            </Paper>
        </Box>
    );
};

const PatientDetailsModal = ({ open, onClose, patient, onReload }) => {
    const [medicines, setMedicines] = useState([]);
    const [patientName, setPatientName] = useState("");
    const [total, setTotal] = useState(0);
    const [thuocList, setThuocList] = useState([]);
    const [dichVuList, setDichVuList] = useState([]);
    const [selectedDichVu, setSelectedDichVu] = useState([]);
    const [luuyDonThuoc, setLuuyDonThuoc] = useState("");
    console.log(luuyDonThuoc);

    useEffect(() => {
        if (open && patient) {
            setPatientName(patient.patientname);
            setMedicines(patient.medicines || []);
            setSelectedDichVu(patient.services || []);
            setLuuyDonThuoc(patient.luuydonthuoc || "");
        }
    }, [open, patient]);

    useEffect(() => {
        fetch("http://localhost:5000/api/thuoc")
            .then(res => res.json())
            .then(data => setThuocList(data.data || []));
        fetch("http://localhost:5000/api/dichvu")
            .then(res => res.json())
            .then(data => setDichVuList(data.data || []));
    }, []);

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

    const handleMedicineChange = (idx, field, value) => {
        setMedicines(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleDichVuChange = (idx, field, value) => {
        setSelectedDichVu(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleAddMedicine = () => {
        setMedicines(prev => [...prev, { tenthuoc: '', soluong: 1, chuy: '' }]);
    };

    const handleRemoveMedicine = (idx) => {
        setMedicines(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAddDichVu = () => {
        setSelectedDichVu(prev => [...prev, { dichvuid: '', songay: 1, dates: [] }]);
    };

    const handleRemoveDichVu = (idx) => {
        setSelectedDichVu(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!patient || !patient.id) return;
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
            const res = await fetch(`http://localhost:5000/api/prescriptions/${patient.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName,
                    medicines: medicinesData,
                    services: servicesData,
                    luuydonthuoc: luuyDonThuoc
                })
            });
            const changes = [];
            if (patient) {
                if (patient.luuydonthuoc !== luuyDonThuoc) {
                    changes.push(`Lưu ý đơn thuốc: ${patient.luuydonthuoc || ""} → ${luuyDonThuoc}`);
                }
                // Medicines
                const oldMeds = Array.isArray(patient.medicines) ? patient.medicines : [];
                if (JSON.stringify(oldMeds) !== JSON.stringify(medicines)) {
                    changes.push("Cập nhật thuốc");
                }
                // Services
                const oldSv = Array.isArray(patient.services) ? patient.services : [];
                if (JSON.stringify(oldSv) !== JSON.stringify(selectedDichVu)) {
                    changes.push("Cập nhật dịch vụ");
                }
            }
            await fetch("http://localhost:5000/api/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update",
                    object: "prescription",
                    objectId: patient.id,
                    changes: changes.join("; ")
                })
            });
            if (!res.ok) throw new Error("Cập nhật thất bại");
            if (typeof onReload === 'function') {
                onReload();
            }
            toast.success("Cập nhật đơn thuốc thành công!");
            onClose();
        } catch {
            toast.error("Có lỗi khi cập nhật đơn thuốc!");
        }
    };

    return (
        <>
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
        </>
    );
};

const PrescriptionManagementPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    console.log(selectedPatient);

    const fetchPrescriptions = () => {
        fetch('http://localhost:5000/api/prescriptions')
            .then(res => res.json())
            .then(data => {
                const normalizedData = data.map(item => ({
                    ...item,
                    medicines: Array.isArray(item.medicines) ? item.medicines : []
                }));
                console.log('Normalized prescriptions:', normalizedData);
                setPrescriptions(normalizedData);
            });
    };
    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handleViewDetails = (patient) => {
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
        fetchPrescriptions();
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ p: 3 }}>
                    <PageHeader onAdd={handleAddOpen} />
                    <PrescriptionTable prescriptions={prescriptions} onViewDetails={handleViewDetails} />
                    <PatientDetailsModal open={modalOpen} onClose={handleCloseModal} patient={selectedPatient} onReload={fetchPrescriptions} />
                    <AddPrescriptionModal open={addOpen} onClose={handleAddClose} onSuccess={handleAddSuccess} />
                </Box>
            </LocalizationProvider>
        </>
    );
};

export default PrescriptionManagementPage;