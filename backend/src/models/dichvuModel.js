const { DataTypes } = require('sequelize');
const sequelize = require('../../sequelize');

const DichVu = sequelize.define('dichvu', {
    dichvuid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tendichvu: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    giadichvu: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    createdat: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedat: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'dichvu',
    timestamps: false,
});

module.exports = DichVu;
