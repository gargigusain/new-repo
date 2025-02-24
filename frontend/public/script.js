let currentPage = 1; // Start from the first page
let totalPages = 1; // This will be updated based on API response

// Show the edit form with pre-filled employee data
function openEditForm(employee) {
    document.getElementById('editId').value = employee.id;
    document.getElementById('editName').value = employee.name;
    document.getElementById('editEmail').value = employee.email;
    document.getElementById('editPassword').value = ''; // Leave blank for security
    document.getElementById('editRole').value = employee.role;
    document.getElementById('editDepartment').value = employee.department;
    document.getElementById('editForm').style.display = 'block';
}

// Hide the edit form
function closeEditForm() {
    document.getElementById('editForm').style.display = 'none';
}

// Show loader
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

// Hide loader
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Add validation for forms
function validateForm(data) {
    let errors = [];

    if (!data.name) errors.push("Name is required.");
    if (!data.email || !data.email.includes('@')) errors.push("Valid email is required.");
    if (data.password && data.password.length < 6)
        errors.push("Password must be at least 6 characters (if provided).");
    if (!data.department) errors.push("Department is required.");
    if (!['Admin', 'HR', 'Employee'].includes(data.role)) errors.push("Invalid role.");

    if (errors.length > 0) {
        alert(errors.join('\n'));
        return false;
    }
    return true;
}

window.onload = () => fetchEmployees();

async function fetchEmployees(page = 1, limit = 10, sortBy = '', order = '', role = '', department = '') {
    try {
        let url = `http://localhost:3000/api/employees?page=${page}&limit=${limit}`;

        if (sortBy) url += `&sortBy=${sortBy}&order=${order}`;
        if (role) url += `&role=${role}`;
        if (department) url += `&department=${department}`;

        const response = await fetch(url);
        const data = await response.json();

        const { employees, currentPage: apiPage, totalPages: apiTotalPages } = data;

        currentPage = apiPage;
        totalPages = apiTotalPages;

        const tableBody = document.getElementById('employee-table-body');
        tableBody.innerHTML = ''; // Clear table before updating

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>
                    <button onclick="openEditForm(${JSON.stringify(employee)})">Edit</button>
                    <button onclick="deleteEmployee(${employee.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        updatePaginationControls();
    } catch (error) {
        alert('Error fetching employees: ' + error.message);
    }
}


// Add a new employee
async function addEmployee(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
    };

    if (!validateForm(data)) return;

    try {
        showLoader();
        const response = await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        alert(result.message || result.error);
        fetchEmployees(); // Refresh the employee list
    } catch (error) {
        alert('Error adding employee: ' + error.message);
    } finally {
        hideLoader();
    }
}

// Update employee details
async function updateEmployee(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        password: document.getElementById('editPassword').value,
        role: document.getElementById('editRole').value,
        department: document.getElementById('editDepartment').value,
    };

    const id = document.getElementById('editId').value;

    if (!validateForm(data)) return;

    try {
        showLoader();
        const response = await fetch(`http://localhost:3000/api/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        alert(result.message || result.error);
        closeEditForm();
        fetchEmployees(); // Refresh the employee list
    } catch (error) {
        alert('Error updating employee: ' + error.message);
    } finally {
        hideLoader();
    }
}

// Delete an employee
async function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            showLoader();
            const response = await fetch(`http://localhost:3000/api/employees/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            alert(result.message || result.error);
            fetchEmployees(); // Refresh the employee list
        } catch (error) {
            alert('Error deleting employee: ' + error.message);
        } finally {
            hideLoader();
        }
    }
}

// Search employees by query
async function searchEmployees(event) {
    const searchQuery = event.target.value;

    try {
        showLoader();
        const response = await fetch(`http://localhost:3000/api/employees?search=${encodeURIComponent(searchQuery)}`);
        const employees = await response.json();

        const tableBody = document.getElementById('employee-table-body');
        tableBody.innerHTML = ''; // Clear previous rows

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>
                    <button onclick="openEditForm(${JSON.stringify(employee)})">Edit</button>
                    <button onclick="deleteEmployee(${employee.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('Error searching employees: ' + error.message);
    } finally {
        hideLoader();
    }
}

function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear previous controls

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1; // Disable on the first page
    prevButton.onclick = () => fetchEmployees(currentPage - 1); // Fetch previous page
    paginationControls.appendChild(prevButton);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.disabled = i === currentPage; // Disable the current page button
        pageButton.onclick = () => fetchEmployees(i); // Fetch the clicked page
        paginationControls.appendChild(pageButton);
    }

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages; // Disable on the last page
    nextButton.onclick = () => fetchEmployees(currentPage + 1); // Fetch next page
    paginationControls.appendChild(nextButton);
}

function applyFilters() {
    const role = document.getElementById('roleFilter').value;
    const department = document.getElementById('departmentFilter').value.trim();
    fetchEmployees(1, 10, currentSort.column, currentSort.order, role, department);
}

async function markAttendance(event) {
    event.preventDefault();

    const status = document.getElementById('attendanceStatus').value;
    const employeeId = localStorage.getItem('employeeId'); // Assuming employee ID is stored in local storage after login

    if (!employeeId) {
        alert('Employee ID not found. Please log in.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: employeeId, status }),
        });

        const result = await response.json();
        alert(result.message || result.error);
    } catch (error) {
        alert('Error marking attendance: ' + error.message);
    }
}

async function fetchAttendance() {
    const employeeId = localStorage.getItem('employeeId'); 

    if (!employeeId) {
        alert('Employee ID not found. Please log in.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/attendance/${employeeId}`);
        const attendanceRecords = await response.json();

        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = '';

        attendanceRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('Error fetching attendance: ' + error.message);
    }
}
