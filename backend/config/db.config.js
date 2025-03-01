const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'binary_operation23', // Replace with your MySQL password
    database: 'employee_management' // Name of your database
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "binary_operation23",
    DB: "employee_management"
  };
  
