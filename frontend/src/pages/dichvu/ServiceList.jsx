import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ServiceList = ({ services, onEdit, onDelete }) => {
    return (
        <Paper sx={{ width: "100%", boxShadow: 1 }}>
            <Box sx={{ maxHeight: 400, overflowY: "auto", width: "100%" }}>
                <Table sx={{ minWidth: 650 }} aria-label="service table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: '600', color: '#333', width: '25%' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333', width: '25%' }}>Tên dịch vụ</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333', width: '25%' }}>Giá</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333', width: '25%', textAlign: 'center' }}>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(Array.isArray(services) ? services : []).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#666' }}>
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            (Array.isArray(services) ? services : []).map((service, idx) => (
                                <TableRow key={service.dichvuid || idx} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                                    <TableCell sx={{ color: '#333', width: '25%' }}>{service.dichvuid}</TableCell>
                                    <TableCell sx={{ color: '#333', width: '25%' }}>{service.tendichvu}</TableCell>
                                    <TableCell sx={{ color: '#333', width: '25%' }}>{Number(service.giadichvu).toLocaleString()} VND</TableCell>
                                    <TableCell sx={{ width: '25%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                startIcon={<EditIcon />}
                                                onClick={() => onEdit(service)}
                                                sx={{ mr: 1, minWidth: 'auto' }}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => onDelete(service)}
                                                sx={{ minWidth: 'auto' }}
                                            >
                                                Xóa
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );
};

export default ServiceList;
