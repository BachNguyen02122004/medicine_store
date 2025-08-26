import React, { useEffect, useState } from 'react';
import AcLogToolbar from './AcLogToolbar';
import AcLogTable from './AcLogTable';
import { Container, Box, Typography } from '@mui/material';

const AcLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/action');
                const data = await res.json();
                setLogs(data);
            } catch {
                setLogs([]);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.user?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container maxWidth={false} sx={{ py: 4, minHeight: '100vh', backgroundColor: '#f5f5f5', width: '100%', px: 0 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" component="h1" sx={{ fontSize: '48px', fontWeight: 'bold', color: '#333' }}>
                    Nhật ký thao tác người dùng
                </Typography>
            </Box>
            <Box sx={{ mb: 4 }}>
                <AcLogToolbar search={search} setSearch={setSearch} />
            </Box>
            <AcLogTable logs={filteredLogs} loading={loading} />
        </Container>
    );
};

export default AcLog;
