const express = require("express");
const cors = require("cors");
require("dotenv").config();

const thuocRoutes = require("./src/routes/thuocRoutes");
const benhNhanRoutes = require("./src/routes/benhNhanRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");
const actionLogRoutes = require("./src/routes/actionRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/thuoc", thuocRoutes);
app.use("/api/benhnhan", benhNhanRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/dichvu", serviceRoutes);
app.use("/api/action", actionLogRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
