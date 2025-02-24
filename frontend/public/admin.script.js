let currentPage = 1;
const limit = 5;

async function fetchEmployees(page = 1, searchQuery = "") {
    document.getElementById('loading').style.display = "block"; // Show loading text

    try {
        const response = await fetch(`http://localhost:3000/api/employees?page=${page}&limit=${limit}&search=${searchQuery}`);
        const data = await response.json();

        const tableBody = document.getElementById('employee-table-body');
        tableBody.innerHTML = '';

        data.employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>
                    <button onclick='openEditForm(${JSON.stringify(employee)})'>Edit</button>
                    <button onclick='deleteEmployee(${employee.id})'>Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('loading').style.display = "none"; // Hide loading text
    } catch (error) {
        alert('Error fetching employees: ' + error.message);
    }
}

function searchEmployees() {
    const query = document.getElementById("search-bar").value;
    fetchEmployees(1, query);
}


function changePage(step) {
    currentPage += step;
    fetchEmployees(currentPage);
}

async function addEmployee(event) {
    event.preventDefault();
    const employee = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value
    };

    await fetch(`http://localhost:3000/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
    });

    fetchEmployees();
    document.getElementById('addForm').style.display = 'none';
}

function closeForm() {
    document.getElementById('addForm').style.display = 'none';
}

function checkUserRole(role) {
    if (role !== "Admin") {
        document.getElementById("add-employee-btn").style.display = "none"; 
        document.getElementById("delete-buttons").style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("userToken");  // Remove user token
    window.location.href = "index.html";  // Redirect to login page
}

function checkAuthentication() {
    const token = localStorage.getItem("userToken");
    if (!token) {
        alert("Please log in first!");
        window.location.href = "index.html";
    }
}

async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const response = await fetch("http://localhost:3000/api/employees");
    const employees = await response.json();

    let yPos = 20;
    doc.text("Employee Report", 10, 10);
    employees.forEach((e, index) => {
        doc.text(`${index + 1}. ${e.name} - ${e.email} (${e.role}, ${e.department})`, 10, yPos);
        yPos += 10;
    });

    doc.save("Employee_Report.pdf");
}
async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const response = await fetch("http://localhost:3000/api/employees");
    const employees = await response.json();

    let yPos = 20;
    doc.text("Employee Report", 10, 10);
    employees.forEach((e, index) => {
        doc.text(`${index + 1}. ${e.name} - ${e.email} (${e.role}, ${e.department})`, 10, yPos);
        yPos += 10;
    });

    doc.save("Employee_Report.pdf");
}


// Check auth on page load
checkAuthentication();

fetchEmployees();
