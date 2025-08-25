// src/models/toathuocModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../db"); // hoặc từ models/index.js

const BenhNhan = require("./benhNhanModel");
const Thuoc = require("./thuocModel");

const ToaThuoc = sequelize.define("toathuoc", {
    toaid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    benhnhanid: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ngaykadon: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

// Chi tiết toa thuốc
const ChiTietToaThuoc = sequelize.define("chitiettoathuoc", {
    chitietid: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    toaid: { type: DataTypes.INTEGER },
    thuocid: { type: DataTypes.INTEGER },
    soluong: { type: DataTypes.INTEGER },
    sothang: { type: DataTypes.INTEGER },
    chuy: { type: DataTypes.TEXT },
});

// Quan hệ
BenhNhan.hasMany(ToaThuoc, { foreignKey: "benhnhanid" });
ToaThuoc.belongsTo(BenhNhan, { foreignKey: "benhnhanid" });

ToaThuoc.hasMany(ChiTietToaThuoc, { foreignKey: "toaid" });
ChiTietToaThuoc.belongsTo(ToaThuoc, { foreignKey: "toaid" });

Thuoc.hasMany(ChiTietToaThuoc, { foreignKey: "thuocid" });
ChiTietToaThuoc.belongsTo(Thuoc, { foreignKey: "thuocid" });

module.exports = { ToaThuoc, ChiTietToaThuoc };
