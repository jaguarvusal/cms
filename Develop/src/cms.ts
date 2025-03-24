import inquirer from 'inquirer';
import { pool } from './connection.js'; // Import the pool object from connection.ts
import cTable from 'console.table';

async function mainMenu() {
  const { action } = await inquirer.prompt([
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
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'View all departments':
      return viewAllDepartments();
    case 'View all roles':
      return viewAllRoles();
    case 'View all employees':
      return viewAllEmployees();
    case 'Add a department':
      return addDepartment();
    case 'Add a role':
      return addRole();
    case 'Add an employee':
      return addEmployee();
    case 'Update an employee role':
      return updateEmployeeRole();
    case 'Exit':
      console.log('Goodbye!');
      process.exit();
  }
}

async function viewAllDepartments() {
  const result = await pool.query('SELECT id AS "ID", name AS "Department" FROM department');
  console.table(result.rows);
  mainMenu();
}

async function viewAllRoles() {
  const result = await pool.query(`
    SELECT role.id AS "ID", role.title AS "Title", department.name AS "Department", role.salary AS "Salary"
    FROM role
    JOIN department ON role.department_id = department.id
  `);
  console.table(result.rows);
  mainMenu();
}

async function viewAllEmployees() {
  const result = await pool.query(`
    SELECT 
      employee.id AS "ID",
      employee.first_name AS "First Name",
      employee.last_name AS "Last Name",
      role.title AS "Title",
      department.name AS "Department",
      role.salary AS "Salary",
      CONCAT(manager.first_name, ' ', manager.last_name) AS "Manager"
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `);
  console.table(result.rows);
  mainMenu();
}

async function addDepartment() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:',
    },
  ]);

  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added ${name} to departments.`);
  mainMenu();
}

async function addRole() {
  const departments = await pool.query('SELECT id, name FROM department');
  const departmentChoices = departments.rows.map((dept) => ({
    name: dept.name,
    value: dept.id,
  }));

  const { title, salary, departmentId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the role:',
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Enter the salary for the role:',
    },
    {
      type: 'list',
      name: 'departmentId',
      message: 'Select the department for the role:',
      choices: departmentChoices,
    },
  ]);

  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [
    title,
    salary,
    departmentId,
  ]);
  console.log(`Added ${title} to roles.`);
  mainMenu();
}

async function addEmployee() {
  const roles = await pool.query('SELECT id, title FROM role');
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const employees = await pool.query('SELECT id, first_name, last_name FROM employee');
  const managerChoices = employees.rows.map((emp) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  managerChoices.unshift({ name: 'None', value: null });

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "Enter the employee's first name:",
    },
    {
      type: 'input',
      name: 'lastName',
      message: "Enter the employee's last name:",
    },
    {
      type: 'list',
      name: 'roleId',
      message: "Select the employee's role:",
      choices: roleChoices,
    },
    {
      type: 'list',
      name: 'managerId',
      message: "Select the employee's manager:",
      choices: managerChoices,
    },
  ]);

  await pool.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [firstName, lastName, roleId, managerId]
  );
  console.log(`Added ${firstName} ${lastName} to employees.`);
  mainMenu();
}

async function updateEmployeeRole() {
  const employees = await pool.query('SELECT id, first_name, last_name FROM employee');
  const employeeChoices = employees.rows.map((emp) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const roles = await pool.query('SELECT id, title FROM role');
  const roleChoices = roles.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employeeId, roleId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: 'Select the employee to update:',
      choices: employeeChoices,
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'Select the new role for the employee:',
      choices: roleChoices,
    },
  ]);

  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
  console.log('Updated employee role.');
  mainMenu();
}

// Start the application
mainMenu().catch((err) => {
  console.error(err);
  process.exit(1);
});