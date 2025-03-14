const API_URL = 'http://localhost:5000/api';

async function fetchEmployees() {
    try {
        const response = await fetch(`${API_URL}/employees`);
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Ошибка при получении списка сотрудников:', error);
    }
}

function displayEmployees(employees) {
    const tableBody = document.getElementById('employeesTableBody');
    tableBody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.full_name}</td>
            <td>${new Date(employee.birth_date).toLocaleDateString()}</td>
            <td>${employee.passport}</td>
            <td>${employee.contact}</td>
            <td>${employee.address}</td>
            <td>${employee.department}</td>
            <td>${employee.position}</td>
            <td>${employee.salary}</td>
            <td>${new Date(employee.hire_date).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
});