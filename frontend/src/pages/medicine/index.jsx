import { useEffect, useState } from "react";
import MedicineForm from "./MedicineForm";
import MedicineList from "./MedicineList";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Container, Box, Button, Stack, Pagination, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import SearchBar from "../../components/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmDialog from "../../components/ConfirmDialog";

function App() {
    const [thuoc, setThuoc] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingThuoc, setEditingThuoc] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 10;

    useEffect(() => {
        fetchThuoc(page, searchQuery);
    }, [page, searchQuery]);

    const fetchThuoc = async (pageNum = 1, query = "") => {
        try {
            const res = await axios.get(`http://localhost:5000/api/thuoc`, {
                params: { page: pageNum, limit: pageSize, search: query }
            });
            setThuoc(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi tải danh sách thuốc');
        }
    };

    const addThuoc = async (newThuoc) => {
        try {
            await axios.post("http://localhost:5000/api/thuoc", newThuoc);
            fetchThuoc(page, searchQuery);
            setShowForm(false);
            toast.success('Thêm thuốc thành công!');
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi thêm thuốc');
        }
    };

    const updateThuoc = async (id, updatedThuoc) => {
        try {
            await axios.put(`http://localhost:5000/api/thuoc/${id}`, updatedThuoc);
            fetchThuoc(page, searchQuery);
            setEditingThuoc(null);
            setShowForm(false);
            toast.success('Cập nhật thuốc thành công!');
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi cập nhật thuốc');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); // Reset to first page when search query changes
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, minHeight: "100vh", backgroundColor: "#f5f5f5", width: '100%', px: 0 }}>
            <Toaster position="top-right" richColors />
            <Box textAlign="center" mb={4}>
                <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#333" }}>Quản lý Thuốc</h1>
            </Box>

            <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Nhập tên thuốc..."
                    sx={{ width: '300px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingThuoc(null);
                        setShowForm(true);
                    }}
                >
                    Thêm Thuốc
                </Button>
            </Stack>

            <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editingThuoc ? 'Cập nhật thuốc' : 'Thêm thuốc'}
                    <IconButton onClick={() => setShowForm(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <MedicineForm
                        onAdd={addThuoc}
                        onUpdate={updateThuoc}
                        editingThuoc={editingThuoc ? {
                            thuocid: editingThuoc.thuocid,
                            tenthuoc: editingThuoc.tenthuoc,
                            soluongcong: editingThuoc.soluongcong,
                            giatienmotcong: editingThuoc.giatienmotcong
                        } : null}
                        onClose={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <MedicineList
                thuoc={thuoc}
                onEdit={(thuoc) => {
                    setEditingThuoc(thuoc);
                    setShowForm(true);
                }}
                onDelete={(id) => {
                    setDeleteId(id);
                    setConfirmOpen(true);
                }}
            />

            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            <ConfirmDialog
                open={confirmOpen}
                title="Xác nhận xóa"
                content="Bạn có chắc chắn muốn xóa thuốc này?"
                onOk={async () => {
                    try {
                        await axios.delete(`http://localhost:5000/api/thuoc/${deleteId}`);
                        fetchThuoc(page, searchQuery);
                        toast.success('Xóa thuốc thành công!');
                    } catch (err) {
                        console.error(err);
                        toast.error('Lỗi khi xóa thuốc');
                    }
                    setConfirmOpen(false);
                    setDeleteId(null);
                }}
                onCancel={() => {
                    setConfirmOpen(false);
                    setDeleteId(null);
                }}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ color: "error", variant: "contained" }}
            />
        </Container>
    );
}

export default App;
