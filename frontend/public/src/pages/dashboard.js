async function fetchDashboardStats() {
    const response = await fetch("http://localhost:3000/api/employees/stats");
    const data = await response.json();

    document.getElementById("total-employees").textContent = data.total;
    document.getElementById("admin-count").textContent = data.admins;
    document.getElementById("hr-count").textContent = data.hrs;
    document.getElementById("employee-count").textContent = data.employees;

    drawRoleChart(data);
    drawDepartmentChart(data);
}

// Function to draw pie chart
function drawRoleChart(data) {
    const ctx = document.getElementById("roleChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Admins", "HRs", "Employees"],
            datasets: [{
                data: [data.admins, data.hrs, data.employees],
                backgroundColor: ["red", "blue", "green"]
            }]
        }
    });
}

// Function to draw bar chart
function drawDepartmentChart(data) {
    const ctx = document.getElementById("departmentChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data.departments),
            datasets: [{
                data: Object.values(data.departments),
                backgroundColor: "orange"
            }]
        }
    });
}

fetchDashboardStats();
