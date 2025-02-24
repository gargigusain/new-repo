async function fetchAttendanceRecords() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const employeeName = document.getElementById('searchEmployee').value;

    let url = `http://localhost:3000/api/admin/attendance?`;

    if (startDate && endDate) {
        url += `startDate=${startDate}&endDate=${endDate}&`;
    }
    if (employeeName) {
        url += `employeeName=${encodeURIComponent(employeeName)}&`;
    }

    try {
        const response = await fetch(url);
        const records = await response.json();

        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = '';

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.name}</td>
                <td>${record.email}</td>
                <td>${record.role}</td>
                <td>${record.department}</td>
                <td>${record.status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        alert('Error fetching attendance records: ' + error.message);
    }
}
