const mysql = require("mysql")
const inquirer = require("inquirer")

const connectionObj = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'books_db'
};
const connection = mysql.createConnection(connectionObj)

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

