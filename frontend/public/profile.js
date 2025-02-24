async function fetchProfile() {
    const response = await fetch("http://localhost:3000/api/employees/1"); // Replace with dynamic ID
    const employee = await response.json();

    document.getElementById("profile-name").textContent = employee.name;
    document.getElementById("profile-email").textContent = employee.email;
    document.getElementById("profile-role").textContent = employee.role;
    document.getElementById("profile-department").textContent = employee.department;
}

fetchProfile();
