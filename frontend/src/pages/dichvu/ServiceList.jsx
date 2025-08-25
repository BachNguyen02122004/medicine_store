import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ServiceList = ({ services, onEdit, onDelete }) => {
    return (
        <Paper className="w-full shadow-md mb-4">
            <Box className="max-h-96 overflow-y-auto w-full">
                <Table sx={{ minWidth: 650 }} aria-label="service table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: '600', color: '#333' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333' }}>Tên dịch vụ</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333' }}>Giá</TableCell>
                            <TableCell sx={{ fontWeight: '600', color: '#333' }}>Hành động</TableCell>
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
                            (Array.isArray(services) ? services : []).map((service) => (
                                console.log(service),
                                <TableRow key={service.dichvuid} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                                    <TableCell sx={{ color: '#333' }}>{service.dichvuid}</TableCell>
                                    <TableCell sx={{ color: '#333' }}>{service.tendichvu}</TableCell>
                                    <TableCell sx={{ color: '#333' }}>{Number(service.giadichvu).toLocaleString()} VND</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            startIcon={<EditIcon />}
                                            onClick={() => onEdit(service)}
                                            sx={{ mr: 1, minWidth: 'auto' }}
                                            className="mr-2"
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
