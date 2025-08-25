import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Service from "@mui/icons-material/Build";
import { Link } from "react-router-dom";

const navItems = [
    {
        label: "Quản lý thuốc",
        icon: <LocalPharmacyIcon />,
        to: "/thuoc"
    },
    {
        label: "Quản lý bệnh nhân",
        icon: <PeopleIcon />,
        to: "/benhnhan"
    },
    {
        label: "Quản lý đơn thuốc",
        icon: <AttachMoneyIcon />,
        to: "/orders"
    },
    {
        label: "Quản lý dịch vụ",
        icon: <Service />,
        to: "/dichvu"
    }
];

function NavBar() {
    return (
        <nav className="w-64 min-h-screen bg-white shadow flex flex-col z-10">
            <Box
                sx={{
                    width: "100%",
                    height: "100vh",
                    backgroundColor: "#f8f9fa",
                    boxShadow: 2,
                    display: "flex",
                    flexDirection: "column",
                    pt: 2
                }}
            >
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.to} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.to}
                                selected={location.pathname.startsWith(item.to)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    backgroundColor: location.pathname.startsWith(item.to) ? "#e3f2fd" : "inherit"
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </nav>
    );
}

export default NavBar;