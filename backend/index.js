const express = require('express');
const app = express();

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());  // For parsing application/json
app.use(express.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Test route to ensure the server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Database configuration import
const dbConfig = require('./config/dbconfig.js'); // Ensure this matches the new file name

// Routes for employee management
const employeeRoutes = require('C:\\code\\employee-management-portal\\backend\\routes\\employee.routes.js');
app.use('/api', employeeRoutes); // Attach the employee routes to the '/api' path

// Set the port for the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const path = require('path');

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

const cors = require('cors');
app.use(cors());
