import { useState } from "react";
import { toast } from "sonner";
import { Box, TextField, Button, Stack } from "@mui/material";

function MedicineForm({ onAdd, onUpdate, editingThuoc }) {
    // Map editingThuoc to form fields if present
    const [newThuoc, setNewThuoc] = useState(
        editingThuoc
            ? {
                tenthuoc: editingThuoc.tenthuoc || "",
                soluongcong: editingThuoc.soluongcong || "",
                giatienmotcong: editingThuoc.giatienmotcong || ""
            }
            : {
                tenthuoc: "",
                soluongcong: "",
                giatienmotcong: ""
            }
    );

    const handleSubmit = () => {
        if (!newThuoc.tenthuoc || !newThuoc.soluongcong || !newThuoc.giatienmotcong) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (editingThuoc) {
            onUpdate(editingThuoc.thuocid, newThuoc);
        } else {
            onAdd(newThuoc);
        }
        setNewThuoc({ tenthuoc: "", soluongcong: "", giatienmotcong: "" });
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#333", marginBottom: "16px" }}>
                {editingThuoc ? 'Sửa Thuốc' : 'Thêm Thuốc Mới'}
            </h3>
            <Stack spacing={2}>
                <TextField
                    label="Tên thuốc"
                    value={newThuoc.tenthuoc}
                    onChange={(e) => setNewThuoc({ ...newThuoc, tenthuoc: e.target.value })}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Số lượng"
                    type="number"
                    value={newThuoc.soluongcong}
                    onChange={(e) => setNewThuoc({ ...newThuoc, soluongcong: e.target.value })}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Giá tiền"
                    type="number"
                    value={newThuoc.giatienmotcong}
                    onChange={(e) => setNewThuoc({ ...newThuoc, giatienmotcong: e.target.value })}
                    variant="outlined"
                    fullWidth
                    InputProps={{ endAdornment: "VNĐ" }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                >
                    {editingThuoc ? 'Cập nhật' : 'Thêm'}
                </Button>
            </Stack>
        </Box>
    );
}

export default MedicineForm