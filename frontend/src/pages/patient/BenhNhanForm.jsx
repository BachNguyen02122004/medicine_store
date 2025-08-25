import { useState } from "react";
import { toast } from "sonner";
import { Box, TextField, Button, Stack } from "@mui/material";

function BenhNhanForm({ onAdd, onUpdate, editingBenhNhan }) {
    const [newBenhNhan, setNewBenhNhan] = useState(
        editingBenhNhan
            ? {
                hoten: editingBenhNhan.hoten || "",
                tuoi: editingBenhNhan.tuoi || "",
                sodienthoai: editingBenhNhan.sodienthoai || "",
                tiensubenh: editingBenhNhan.tiensubenh || "",
            }
            : {
                hoten: "",
                tuoi: "",
                sodienthoai: "",
                tiensubenh: "",
            }
    );

    const handleSubmit = () => {
        if (!newBenhNhan.hoten) {
            toast.error("Vui lòng điền họ tên");
            return;
        }
        if (editingBenhNhan) {
            onUpdate(editingBenhNhan.benhnhanid, newBenhNhan);
        } else {
            onAdd(newBenhNhan);
        }
        setNewBenhNhan({ hoten: "", tuoi: "", sodienthoai: "", tiensubenh: "" });
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#333", marginBottom: "16px" }}>
                {editingBenhNhan ? "Sửa Bệnh nhân" : "Thêm Bệnh nhân Mới"}
            </h3>
            <Stack spacing={2}>
                <TextField
                    label="Họ tên"
                    value={newBenhNhan.hoten}
                    onChange={(e) => setNewBenhNhan({ ...newBenhNhan, hoten: e.target.value })}
                    variant="outlined"
                    fullWidth
                    required
                />
                <TextField
                    label="Tuổi"
                    type="number"
                    value={newBenhNhan.tuoi}
                    onChange={(e) => setNewBenhNhan({ ...newBenhNhan, tuoi: e.target.value })}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Số điện thoại"
                    value={newBenhNhan.sodienthoai}
                    onChange={(e) => setNewBenhNhan({ ...newBenhNhan, sodienthoai: e.target.value })}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    label="Tiền sử bệnh"
                    value={newBenhNhan.tiensubenh}
                    onChange={(e) => setNewBenhNhan({ ...newBenhNhan, tiensubenh: e.target.value })}
                    variant="outlined"
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                >
                    {editingBenhNhan ? "Cập nhật" : "Thêm"}
                </Button>
            </Stack>
        </Box>
    );
}

export default BenhNhanForm;