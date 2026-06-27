const API_BASE_URL = `http://${window.location.hostname}:8080/api/employees`;

document.addEventListener('DOMContentLoaded', () => {
    const employeeForm = document.getElementById('employeeForm');
    const employeeList = document.getElementById('employeeList');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.querySelector('.form-card h2');

    let employeesList = [];
    let editingId = null;

    // Fetch and display employees
    async function fetchEmployees() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            employeesList = await response.json();
            displayEmployees(employeesList);
        } catch (error) {
            console.error('Error fetching employees:', error);
            employeeList.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="5" style="color: var(--danger-color); text-align: center; padding: 2rem;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Failed to load employees. Make sure the backend is running on port 8080.
                    </td>
                </tr>
            `;
        }
    }

    // Display employees in table
    function displayEmployees(employees) {
        if (employees.length === 0) {
            employeeList.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="5" class="text-muted" style="text-align: center; padding: 2rem;">
                        No employees found. Add one on the left!
                    </td>
                </tr>
            `;
            return;
        }

        employeeList.innerHTML = '';
        employees.forEach(employee => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${employee.id}</strong></td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td><span class="badge">${employee.department}</span></td>
                <td>
                    <button class="btn-edit edit-btn" data-id="${employee.id}">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn-danger delete-btn" data-id="${employee.id}">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
            employeeList.appendChild(tr);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                startEdit(id);
            });
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-id');
                await deleteEmployee(id);
            });
        });
    }

    // Enter Edit Mode
    function startEdit(id) {
        const employee = employeesList.find(emp => emp.id === id);
        if (!employee) return;

        editingId = id;
        document.getElementById('name').value = employee.name;
        document.getElementById('email').value = employee.email;
        document.getElementById('department').value = employee.department;

        // Update UI states
        formTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Employee`;
        submitBtn.innerHTML = `<span>Save Changes</span><i class="fa-solid fa-floppy-disk"></i>`;
        cancelBtn.style.display = 'flex';
    }

    // Exit Edit Mode / Reset Form
    function resetFormState() {
        editingId = null;
        employeeForm.reset();
        formTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add New Employee`;
        submitBtn.innerHTML = `<span>Add Employee</span><i class="fa-solid fa-plus"></i>`;
        cancelBtn.style.display = 'none';
    }

    // Cancel Button event listener
    cancelBtn.addEventListener('click', resetFormState);

    // Form submission (Add or Update)
    employeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const department = document.getElementById('department').value;

        const employeeData = { name, email, department };

        try {
            let response;
            if (editingId) {
                // Update existing employee (PUT)
                response = await fetch(`${API_BASE_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(employeeData)
                });
            } else {
                // Add new employee (POST)
                response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(employeeData)
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save employee');
            }

            resetFormState();
            fetchEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            alert(`Failed to save employee. Please check connection to backend.`);
        }
    });

    // Delete employee
    async function deleteEmployee(id) {
        if (!confirm(`Are you sure you want to delete employee #${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }

            // If we are currently editing the deleted employee, cancel edit
            if (editingId === parseInt(id)) {
                resetFormState();
            }

            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Failed to delete employee. Please check connection to backend.');
        }
    }

    // Initial fetch
    fetchEmployees();
});
