import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ value, onChange, placeholder = "Tìm kiếm...", sx }) {
    return (
        <TextField
            value={value}
            onChange={onChange}
            variant="outlined"
            placeholder={placeholder}
            sx={sx}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
        />
    );
}

export default SearchBar;
