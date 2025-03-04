const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

const Employee = sequelize.define('Employee', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'HR', 'Employee'), defaultValue: 'Employee' },  // 👈 Role field added
    department: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Employee;
