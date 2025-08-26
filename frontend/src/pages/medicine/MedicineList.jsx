import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function MedicineList({ thuoc = [], onEdit, onDelete }) {
    return (
        <Paper sx={{ width: "100%", boxShadow: 1 }}>
            <Box sx={{ maxHeight: 400, overflowY: "auto", width: "100%" }}>
                <Table sx={{ minWidth: 650 }} aria-label="medicine table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell sx={{ fontWeight: "600", color: "#333", width: '25%' }}>Tên Thuốc</TableCell>
                            <TableCell sx={{ fontWeight: "600", color: "#333", width: '25%' }}>Số Lượng</TableCell>
                            <TableCell sx={{ fontWeight: "600", color: "#333", width: '25%' }}>Giá Tiền</TableCell>
                            <TableCell sx={{ fontWeight: "600", color: "#333", width: '25%', textAlign: 'center' }}>Hành Động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {thuoc.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} sx={{ textAlign: "center", color: "#666" }}>Không có dữ liệu</TableCell>
                            </TableRow>
                        ) : (
                            thuoc.map((t, idx) => (
                                <TableRow key={t.thuocid || t.id || idx} sx={{ "&:hover": { backgroundColor: "#fafafa" } }}>
                                    <TableCell sx={{ color: "#333", width: '25%' }}>{t.tenthuoc}</TableCell>
                                    <TableCell sx={{ color: "#333", width: '25%' }}>{t.soluongcong}</TableCell>
                                    <TableCell sx={{ color: "#333", width: '25%' }}>{Number(t.giatienmotcong).toLocaleString()} VNĐ</TableCell>
                                    <TableCell sx={{ width: '25%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                startIcon={<EditIcon />}
                                                onClick={() => onEdit(t)}
                                                sx={{ mr: 1, minWidth: "auto" }}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => onDelete(t.thuocid)}
                                                sx={{ minWidth: "auto" }}
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
}

export default MedicineList;

