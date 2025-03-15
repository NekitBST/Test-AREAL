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

function openModal() {
    document.getElementById('employeeModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeForm').dataset.employeeId = '';
    document.getElementById('hireDate').disabled = false;
}

async function saveEmployee(event) {
    event.preventDefault();
    const id = event.target.dataset.employeeId;
    
    const formData = {
        full_name: document.getElementById('fullName').value,
        birth_date: document.getElementById('birthDate').value,
        passport: document.getElementById('passport').value,
        contact: document.getElementById('contact').value,
        address: document.getElementById('address').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        salary: document.getElementById('salary').value,
        hire_date: document.getElementById('hireDate').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/employees/${id}` : `${API_URL}/employees`;
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Произошла ошибка');
        }

        closeModal();
        fetchEmployees();
        alert(id ? 'Данные сотрудника обновлены' : 'Сотрудник добавлен');
    } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert(error.message || 'Не удалось сохранить данные сотрудника');
    }
}

function formatPassport(input) {
    let value = input.value.replace(/\s/g, '');
    
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    if (value.length > 4) {
        value = value.slice(0, 4) + ' ' + value.slice(4);
    }
    
    input.value = value;
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    let formattedValue = '+7 ';
    
    if (value.length > 1) {
        formattedValue += '(' + value.slice(1, 4);
    }
    if (value.length > 4) {
        formattedValue += ') ' + value.slice(4, 7);
    }
    if (value.length > 7) {
        formattedValue += '-' + value.slice(7, 9);
    }
    if (value.length > 9) {
        formattedValue += '-' + value.slice(9, 11);
    }

    input.value = formattedValue;
}

async function editEmployee(id) {
    try {
        const response = await fetch(`${API_URL}/employees/${id}`);
        const employee = await response.json();
        
        document.getElementById('employeeForm').dataset.employeeId = id;
        document.getElementById('fullName').value = employee.full_name;
        document.getElementById('birthDate').value = employee.birth_date.split('T')[0];
        document.getElementById('passport').value = employee.passport;
        document.getElementById('contact').value = employee.contact;
        document.getElementById('address').value = employee.address;
        document.getElementById('department').value = employee.department;
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary;
        document.getElementById('hireDate').value = employee.hire_date.split('T')[0];
        document.getElementById('hireDate').disabled = true;
        
        openModal();
    } catch (error) {
        console.error('Ошибка при получении данных сотрудника:', error);
        alert('Не удалось загрузить данные сотрудника');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    initializeFilters();
    
    document.getElementById('searchName').addEventListener('input', handleSearch);
    document.getElementById('departmentFilter').addEventListener('change', handleFilters);
    document.getElementById('positionFilter').addEventListener('change', handleFilters);

    document.getElementById('addEmployeeBtn').addEventListener('click', openModal);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('employeeForm').addEventListener('submit', saveEmployee);

    const passportInput = document.getElementById('passport');
    const contactInput = document.getElementById('contact');

    passportInput.addEventListener('input', () => formatPassport(passportInput));
    contactInput.addEventListener('input', () => formatPhone(contactInput));
});