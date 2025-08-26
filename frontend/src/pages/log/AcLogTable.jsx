import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

const AcLogTable = ({ logs, loading }) => (
    <TableContainer component={Paper} className="shadow-md" sx={{ maxHeight: 500, overflowY: 'auto' }}>
        <Table>
            <TableHead>
                <TableRow className="bg-gray-100">
                    <TableCell>ID</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Object</TableCell>
                    <TableCell>Changes</TableCell>
                    <TableCell>Thời gian</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center">
                            <CircularProgress size={24} />
                        </TableCell>
                    </TableRow>
                ) : logs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center">Không có dữ liệu</TableCell>
                    </TableRow>
                ) : (
                    logs.map((log, idx) => {
                        const date = new Date(log.createdat);
                        const hours = date.getHours();
                        const period = hours < 12 ? 'sáng' : (hours < 18 ? 'chiều' : 'tối');
                        const formatted = `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (${period})`;
                        return (
                            <TableRow key={idx}>
                                <TableCell>{log.logid}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.object}</TableCell>
                                <TableCell>{log.changes}</TableCell>
                                <TableCell>{formatted}</TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    </TableContainer>
);

export default AcLogTable;
