import React from 'react';
import TextField from '@mui/material/TextField';

const AcLogToolbar = ({ search, setSearch }) => (
    <div className="flex items-center gap-2 mb-2">
        <TextField
            label="Tìm kiếm người dùng hoặc hành động"
            variant="outlined"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/3"
        />
    </div>
);

export default AcLogToolbar;
