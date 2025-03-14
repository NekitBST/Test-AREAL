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
                <button onclick="firedEmployee(${employee.id})" class="btn-primary">Уволить</button>
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

async function initializeFilters() {
    try {
        const response = await fetch(`${API_URL}/employees`);
        const employees = await response.json();
        
        const departments = [...new Set(employees.map(emp => emp.department))];
        const positions = [...new Set(employees.map(emp => emp.position))];

        const departmentFilter = document.getElementById('departmentFilter');
        const positionFilter = document.getElementById('positionFilter');

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });

        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            positionFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при инициализации фильтров:', error);
    }
}

async function handleFilters() {
    const department = document.getElementById('departmentFilter').value;
    const position = document.getElementById('positionFilter').value;

    try {
        const response = await fetch(`${API_URL}/employees/filter?department=${department}&position=${position}`);
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Ошибка при фильтрации:', error);
    }
}

async function firedEmployee(id) {
    if (!confirm('Уволить сотрудника?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/employees/fired/${id}`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            throw new Error;
        }
        fetchEmployees();
    } catch (error) {
        console.error('Ошибка при увольнении:', error);
        alert('Не удалось уволить сотрудника');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    initializeFilters();
    
    document.getElementById('searchName').addEventListener('input', handleSearch);
    document.getElementById('departmentFilter').addEventListener('change', handleFilters);
    document.getElementById('positionFilter').addEventListener('change', handleFilters);
});