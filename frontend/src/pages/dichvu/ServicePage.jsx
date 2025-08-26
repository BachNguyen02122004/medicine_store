import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { toast, Toaster } from 'sonner';
import ServiceList from './ServiceList';
import ServiceForm from './ServiceForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import SearchBar from '../../components/SearchBar';
import { Container, Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ServicePage = () => {
    const [services, setServices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [openForm, setOpenForm] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    console.log(selectedService);

    useEffect(() => {
        fetchServices(page, searchQuery);
    }, [page, searchQuery]);

    const fetchServices = async (pageNum = 1, query = "") => {
        try {
            const params = { page: pageNum, pageSize: 10 };
            if (query && query.trim() !== "") params.search = query;
            const res = await axios.get('http://localhost:5000/api/dichvu', { params });
            setServices(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = () => {
        setSelectedService(null);
        setOpenForm(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setOpenForm(true);
    };

    const handleDelete = (service) => {
        setSelectedService(service);
        setOpenConfirm(true);
    };

    const handleFormSubmit = async (data) => {
        try {
            if (selectedService) {
                const oldService = { ...selectedService };
                await axios.put(`http://localhost:5000/api/dichvu/${selectedService.dichvuid}`, data);
                // Tạo log các trường đã thay đổi
                const changes = [];
                if (oldService.tendichvu !== data.tendichvu) {
                    changes.push(`Tên dịch vụ: ${oldService.tendichvu} → ${data.tendichvu}`);
                }
                if (String(oldService.giadichvu) !== String(data.giadichvu)) {
                    changes.push(`Giá dịch vụ: ${oldService.giadichvu} → ${data.giadichvu}`);
                }
                await axios.post('http://localhost:5000/api/action', {
                    action: 'update',
                    object: 'dichvu',
                    objectId: selectedService.dichvuid,
                    changes: changes.join('; ')
                });
                toast.success('Cập nhật dịch vụ thành công!');
                setOpenForm(false);
                fetchServices(page, searchQuery);
            } else {
                const res = await axios.post('http://localhost:5000/api/dichvu', data);
                const newService = res.data;
                await axios.post('http://localhost:5000/api/action', {
                    action: 'create',
                    object: 'dichvu',
                    objectId: newService.dichvuid,
                    changes: `Tên dịch vụ: ${newService.tendichvu}; Giá dịch vụ: ${newService.giadichvu}`
                });
                toast.success('Thêm dịch vụ thành công!');
                setOpenForm(false);
                setPage(1); // Chuyển về trang đầu để thấy dịch vụ mới
                fetchServices(1, searchQuery);
            }
        } catch (err) {
            console.error(err);
            toast.error('Có lỗi xảy ra khi lưu dịch vụ!');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/dichvu/${selectedService?.dichvuid}`);
            await axios.post('http://localhost:5000/api/action', {
                action: 'delete',
                object: 'dichvu',
                objectId: selectedService?.dichvuid,
                changes: `Tên dịch vụ: ${selectedService?.tendichvu}; Giá dịch vụ: ${selectedService?.giadichvu}`
            });
            toast.success('Xóa dịch vụ thành công!');
            setOpenConfirm(false);
            // Nếu xóa hết dịch vụ ở trang hiện tại, chuyển về trang đầu
            if (services.length === 1 && page > 1) {
                setPage(1);
                fetchServices(1, searchQuery);
            } else {
                fetchServices(page, searchQuery);
            }
        } catch (err) {
            console.error('Lỗi khi gọi API xóa:', err);
            toast.error('Có lỗi xảy ra khi xóa dịch vụ!');
            setOpenConfirm(false);
        }
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, minHeight: "100vh", backgroundColor: "#f5f5f5", width: '100%', px: 0 }}>
            <Toaster position="top-right" richColors />
            <Box textAlign="center" mb={4}>
                <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#333" }}>
                    Quản lý Dịch vụ
                </h1>
            </Box>
            <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                <SearchBar
                    value={searchQuery}
                    onChange={e => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Nhập tên dịch vụ..."
                    sx={{ width: "300px" }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Thêm dịch vụ
                </Button>
            </Stack>
            <ServiceList services={services} onEdit={handleEdit} onDelete={handleDelete} />
            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>
            {openForm && (
                <ServiceForm
                    service={selectedService}
                    onClose={() => setOpenForm(false)}
                    onSubmit={handleFormSubmit}
                />
            )}
            {openConfirm && (
                <ConfirmDialog
                    open={openConfirm}
                    title="Xác nhận xoá"
                    content={`Bạn có chắc muốn xoá dịch vụ ${selectedService?.tendichvu}?`}
                    onOk={handleConfirmDelete}
                    onCancel={() => {
                        console.log('Đóng dialog xác nhận xóa');
                        setOpenConfirm(false);
                    }}
                />
            )}
        </Container>
    );
};

export default ServicePage;
