import React, { useEffect, useState } from 'react';
import AcLogToolbar from './AcLogToolbar';
import AcLogTable from './AcLogTable';

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
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold mb-2">User Action Log</h2>
            <AcLogToolbar search={search} setSearch={setSearch} />
            <AcLogTable logs={filteredLogs} loading={loading} />
        </div>
    );
};

export default AcLog;
