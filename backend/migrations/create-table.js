"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("thuoc", {
            thuocid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tenthuoc: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            soluongcong: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            giatienmotcong: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        // bảng benhnhan
        await queryInterface.createTable("benhnhan", {
            benhnhanid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            hoten: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            tuoi: {
                type: Sequelize.INTEGER,
            },
            sodienthoai: {
                type: Sequelize.STRING(15),
            },
            tiensubenh: {
                type: Sequelize.TEXT,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        // bảng toathuoc
        await queryInterface.createTable("toathuoc", {
            toaid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            benhnhanid: {
                type: Sequelize.INTEGER,
                references: { model: "benhnhan", key: "benhnhanid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            ngaykadon: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        // bảng chitiettoathuoc
        await queryInterface.createTable("chitiettoathuoc", {
            chitietid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            toaid: {
                type: Sequelize.INTEGER,
                references: { model: "toathuoc", key: "toaid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            thuocid: {
                type: Sequelize.INTEGER,
                references: { model: "thuoc", key: "thuocid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            soluong: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            sothang: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            chuy: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        await queryInterface.createTable("thanhtoan", {
            thanhtoanid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            toaid: {
                type: Sequelize.INTEGER,
                references: { model: "toathuoc", key: "toaid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            tongtien: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        await queryInterface.createTable("dichvu", {
            dichvuid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tendichvu: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            giadichvu: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });

        await queryInterface.createTable("chitietdichvu", {
            chitietdichvuid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            toaid: {
                type: Sequelize.INTEGER,
                references: { model: "toathuoc", key: "toaid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            dichvuid: {
                type: Sequelize.INTEGER,
                references: { model: "dichvu", key: "dichvuid" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            songay: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            createdat: { allowNull: false, type: Sequelize.DATE },
            updatedat: { allowNull: false, type: Sequelize.DATE },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("chitietdichvu");
        await queryInterface.dropTable("dichvu");
        await queryInterface.dropTable("thanhtoan");
        await queryInterface.dropTable("chitiettoathuoc");
        await queryInterface.dropTable("toathuoc");
        await queryInterface.dropTable("benhnhan");
        await queryInterface.dropTable("thuoc");
    },
};
