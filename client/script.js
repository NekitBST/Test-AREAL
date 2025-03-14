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
        if (employee.fired) row.classList.add('fired');
        
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
            <td>${employee.fired ? 'Уволен' : 'Работает'}</td>
            <td>
            ${!employee.fired ? `
                <button onclick="editEmployee(${employee.id})" class="btn-primary">Редактировать</button>
                <button onclick="fireEmployee(${employee.id})" class="btn-primary">Уволить</button>
            ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleSearch() {
    const searchTerm = document.getElementById('searchName').value.trim();
    if (!searchTerm) {
        fetchEmployees();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/employees/search?full_name=${searchTerm}`);
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Ошибка при поиске:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    document.getElementById('searchName').addEventListener('input', handleSearch);
});