const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db.config');
const { addEmployee, deleteEmployee } = require('../controllers/employeeController');
const checkRole = require('../middleware/auth');  

router.post('/employees', checkRole(['Admin', 'HR']), addEmployee);  // 👈 Only Admin & HR can add
router.delete('/employees/:id', checkRole(['Admin']), deleteEmployee);  // 👈 Only Admin can delete

// GET employees with or without search functionality
router.get('/employees', (req, res) => {
    console.log('GET /employees hit');
    const search = req.query.search || ''; // Get the search query, default to empty string
    const query = `
        SELECT * 
        FROM employees 
        WHERE name LIKE ? 
           OR email LIKE ? 
           OR role LIKE ? 
           OR department LIKE ?
    `;

    const searchTerm = `%${search}%`; // Use wildcards for partial matching
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});



// Fetch an employee by ID
router.get('/employees', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10
    const offset = (page - 1) * limit;

    try {
        // Fetch paginated employees
        const [employees] = await db.query(`SELECT * FROM employees LIMIT ? OFFSET ?`, [limit, offset]);

        // Fetch total employee count
        const [totalCount] = await db.query(`SELECT COUNT(*) as count FROM employees`);
        const totalEmployees = totalCount[0].count;

        // Calculate total pages
        const totalPages = Math.ceil(totalEmployees / limit);

        res.json({
            currentPage: page,
            totalPages: totalPages,
            employees: employees,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});


// Add Employee with Validation
router.post(
    '/employees',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').isIn(['Admin', 'HR', 'Employee']).withMessage('Invalid role'),
        body('department').notEmpty().withMessage('Department is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role, department } = req.body;

        const query = 'INSERT INTO employees (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, email, password, role, department], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                message: 'Employee added successfully',
                id: result.insertId,
            });
        });
    }
);

// Update Employee with Validation
router.put('/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, department } = req.body;

    const query = `
        UPDATE employees 
        SET name = ?, email = ?, password = ?, role = ?, department = ?
        WHERE id = ?
    `;
    db.query(query, [name, email, password, role, department, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully' });
    });
});


// Delete an employee by ID
router.delete('/employees/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM employees WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    });
});

router.post('/api/attendance', async (req, res) => {
    const { employee_id, status } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get today's date

    try {
        // Prevent duplicate attendance for the same day
        const existingAttendance = await db.query(
            'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
            [employee_id, date]
        );

        if (existingAttendance.length > 0) {
            return res.status(400).json({ error: 'Attendance already marked for today' });
        }

        await db.query(
            'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
            [employee_id, date, status]
        );

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error marking attendance' });
    }
});

router.get('/api/attendance/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        const attendance = await db.query(
            'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC',
            [employee_id]
        );

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching attendance' });
    }
});

router.get('/api/admin/attendance', async (req, res) => {
    const { startDate, endDate, employeeName } = req.query;

    try {
        let query = `
            SELECT attendance.id, attendance.date, attendance.status, 
                   employees.name, employees.email, employees.role, employees.department
            FROM attendance
            JOIN employees ON attendance.employee_id = employees.id
            WHERE 1=1
        `;

        let queryParams = [];

        if (startDate && endDate) {
            query += ' AND attendance.date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (employeeName) {
            query += ' AND employees.name LIKE ?';
            queryParams.push(`%${employeeName}%`);
        }

        query += ' ORDER BY attendance.date DESC';

        const results = await db.query(query, queryParams);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching attendance records' });
    }
});

router.use((req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
});

router.get("/api/employees/stats", async (req, res) => {
    const employees = await Employee.findAll();
    const total = employees.length;
    const admins = employees.filter(e => e.role === "Admin").length;
    const hrs = employees.filter(e => e.role === "HR").length;
    const employeesCount = employees.filter(e => e.role === "Employee").length;

    const departments = {};
    employees.forEach(e => {
        departments[e.department] = (departments[e.department] || 0) + 1;
    });

    res.json({ total, admins, hrs, employees: employeesCount, departments });
});

const { sendEmail } = require("./mailer");

router.post("/api/employees", async (req, res) => {
    const { name, email, role, department } = req.body;
    const newEmployee = await Employee.create({ name, email, role, department });

    await sendEmail(email, "Welcome to the Company!", `Dear ${name}, you have been added as a ${role} in ${department}.`);

    res.json({ message: "Employee added and email sent!" });
});

router.put("/api/employees/:id", async (req, res) => {
    const { name, email, role, department } = req.body;
    await Employee.update({ name, email, role, department }, { where: { id: req.params.id } });

    await sendEmail(email, "Profile Updated", `Dear ${name}, your profile has been updated.`);

    res.json({ message: "Employee updated and email sent!" });
});

const { generateCSV, generatePDF } = require('../utils/reportGenerator');
const { getAllEmployees } = require('../controllers/employeeController');

router.get('/employees/report/csv', async (req, res) => {
    const employees = await getAllEmployees();
    const csv = generateCSV(employees);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csv);
});

router.get('/employees/report/pdf', async (req, res) => {
    const employees = await getAllEmployees();
    const filePath = generatePDF(employees);
    res.download(filePath);
});

module.exports = router;
