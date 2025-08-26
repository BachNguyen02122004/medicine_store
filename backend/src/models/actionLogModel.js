const { DataTypes } = require('sequelize');
const sequelize = require('../../sequelize');

const ActionLog = sequelize.define('actionlog', {
    logid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    action: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    object: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    objectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    changes: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'actionlog',
    timestamps: false,
});


module.exports = ActionLog;
