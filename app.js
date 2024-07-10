const { Client } = require('pg');
const inquirer = require('inquirer');

// Database connection
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'employees',
    password: 'your_password', // Change to your postgres password!
    port: 5432,
});

client.connect((err)=>{
    if(err) throw err;
    mainMenu();
});

const mainMenu = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ],
        }
    ]).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                break;
        }
    });
};

const viewAllDepartments = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const viewAllRoles = () => {
    const query = `
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const viewAllEmployees = () => {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
               COALESCE(manager.first_name || ' ' || manager.last_name, 'None') AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
    `;
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'name',
            message: 'Enter the name of the department:',
        }
    ]).then(answer => {
        client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) throw err;
            console.log('Department added successfully.');
            mainMenu();
        });
    });
};

const addRole = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const departments = res.rows.map(dept => ({
            name: dept.name,
            value: dept.id
        }));
        inquirer.prompt([
            {
                name: 'title',
                message: 'Enter the title of the role:'
            },
            {
                name: 'salary',
                message: 'Enter the salary of the role:'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department for the role:',
                choices: departments
            }
        ]).then(answers => {
            const { title, salary, department_id } = answers;
            client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id], (err, res) => {
                if (err) throw err;
                console.log('Role added successfully.');
                mainMenu();
            });
        });
    });
};

const addEmployee = () => {
    client.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        const roles = res.rows.map(role => ({
            name: role.title,
            value: role.id
        }));
        client.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            const managers = res.rows.map(emp => ({
                name: `${emp.first_name} ${emp.last_name}`,
                value: emp.id
            }));
            managers.push({ name: 'None', value: null });
            inquirer.prompt([
                {
                    name: 'first_name',
                    message: 'Enter the first name of the employee:'
                },
                {
                    name: 'last_name',
                    message: 'Enter the last name of the employee:'
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the role of the employee:',
                    choices: roles
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Select the manager of the employee:',
                    choices: managers
                }
            ]).then(answers => {
                const { first_name, last_name, role_id, manager_id } = answers;
                client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id], (err, res) => {
                    if (err) throw err;
                    console.log('Employee added successfully.');
                    mainMenu();
                });
            });
        });
    });
};

const updateEmployeeRole = () => {
    client.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        const employees = res.rows.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }));
        client.query('SELECT * FROM role', (err, res) => {
            if (err) throw err;
            const roles = res.rows.map(role => ({
                name: role.title,
                value: role.id
            }));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to update:',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the new role:',
                    choices: roles
                }
            ]).then(answers => {
                const { employee_id, role_id } = answers;
                client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id], (err, res) => {
                    if (err) throw err;
                    console.log('Employee role updated successfully.');
                    mainMenu();
                });
            });
        });
    });
};
