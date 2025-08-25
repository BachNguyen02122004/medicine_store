import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

const ServiceForm = ({ service, onClose, onSubmit }) => {
    const [form, setForm] = useState({ tendichvu: '', giadichvu: '' });

    useEffect(() => {
        if (service) {
            setForm({
                tendichvu: service.tendichvu || '',
                giadichvu: service.giadichvu || '',
            });
        } else {
            setForm({ tendichvu: '', giadichvu: '' });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Đảm bảo giadichvu là kiểu số
        const submitData = {
            ...form,
            giadichvu: Number(form.giadichvu)
        };
        onSubmit(submitData);
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{service ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    <TextField
                        label="Tên dịch vụ"
                        name="tendichvu"
                        value={form.tendichvu}
                        onChange={handleChange}
                        required
                        fullWidth
                        className="mb-2"
                    />
                    <TextField
                        label="Giá dịch vụ"
                        name="giadichvu"
                        type="number"
                        value={form.giadichvu}
                        onChange={handleChange}
                        required
                        fullWidth
                        className="mb-2"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">Huỷ</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" type="submit">Lưu</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceForm;
