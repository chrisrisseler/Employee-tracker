const mysql = require("mysql")
const util = require("util");
const inquirer = require("inquirer")

const connectionObj = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db'
};
const connection = mysql.createConnection(connectionObj)

// Converts method to use promises instead of callbacks using node library
connection.query = util.promisify(connection.query)

connection.connect(error => {
    if (error) throw error;
    console.log(`connected to the database as id ${connection.threadId}`);
    runProgram()
})

const runProgram = () => {
    inquirer
        .prompt({
            name: 'action',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees By Department',
                'View All Employees By Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'View All Roles',
                'Add Role',
                'Remove Role',
                'View All Departments',
                'Add Department',
                'Remove Department',
                'View Utilized Budget of Department',
                'Exit'
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case 'View All Employees':
                    employeeView();
                    break;

                case 'View All Employees By Department':
                    departmentView();
                    break;

                case 'View All Employees By Manager':
                    managerView();
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Remove Employee':
                    removeEmployee();
                    break;

                case 'Update Employee Role':
                    updateRole();
                    break;

                case 'Update Employee Manager':
                    updateManager();
                    break;

                case 'View All Roles':
                    viewRoles();
                    break;

                case 'Add Role':
                    addRole();
                    break;

                case 'Remove Role':
                    removeRole();
                    break;

                case 'View All Departments':
                    viewDepartments();
                    break;

                case 'Add Department':
                    addDepartment();
                    break;

                case 'Remove Department':
                    removeDepartment();
                    break;

                case 'View Utilized Budget of Department':
                    viewDepartmentBudget();
                    break;

                case 'Exit':
                    exit();
                    break;

                default:
                    console.log(`Invalid action: ${answer.action}`);
                    break;
            }
        });
};

const getRoles = async () => {
    return connection.query('select id, title from role_table')
}

const getEmployees = async () => {
    return connection.query(
        'select employee.id, employee.first_name, employee.last_name, role_table.title, department.name as department, role_table.salary, concat(manager.first_name," ",manager.last_name) as manager from employee left join role_table on employee.role_id = role_table.id left join department on role_table.department_id = department.id left join employee as manager on employee.manager_id = manager.id'
    );
}

const getDepartment = async () => {
    return connection.query('select name from department')
}

const createEmployee = async (employee) => {
    return connection.query('insert into employee SET ?', employee);
}

createRole = async (role) => {
    return connection.query('insert into role_table SET ?',
        role)
}

// using async / await to simplify code structure by avoiding nested callbacks
const addEmployee = async () => {
    const roles = await getRoles()
    const employees = await getEmployees();

    console.log(roles)
    console.log(employees)

    const employee = await inquirer.prompt([
        {
            name: "first_name",
            message: "Employee's first name?"
        },
        {
            name: "last_name",
            message: "Employee's last name?"
        }
    ]);

    console.log(employee)

    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    const role = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "Employee's role?",
        choices: roleChoices
    });

    employee.role_id = role.roleId

    console.log(employee)

    const managerChoices = employees
        .filter(employee => employee.manager === null)
        .map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }))

    console.log(managerChoices)

    const manager = await inquirer.prompt({
        type: "list",
        name: "managerId",
        message: "Employee's manager?",
        choices: managerChoices
    });

    employee.manager_id = manager.managerId;

    console.log(employee)

    await createEmployee(employee);
    runProgram();
}

const employeeView = async () => {
    const employees = await getEmployees();
    console.table(employees);
    runProgram()
}

const addDepartment = async () => {
    const departments = await getDepartment();
    console.table(departments);
    const department = await inquirer.prompt([
        {
            name: "name",
            message: "What is the name of the new department?"
        }
    ])
    await connection.query('insert into department SET ?', department);
    runProgram()
}

const addRole = async () => {
    const departments = await getDepartment();
    const roles = await getRoles();


    const role = await inquirer.prompt([
        {
            name: "title",
            message: "What role would you like to add?"
        },
        {
            name: "salary",
            message: "What is the salary of this role?"
        }
    ])

    const departmentChoices = departments.map(({ id, name }) => (
        {
            name: name,
            value: id
        }
    ));

    const department = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "What department would you like to add this role to?",
        choices: departmentChoices
    });
    role.department_id = department.id;
    await createRole(role);
    runProgram();
}