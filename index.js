const mysql = require("mysql")
const util = require("util");
const inquirer = require("inquirer");
const { async } = require("rxjs");
const { getegid } = require("process");


const connectionObj = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db'
};
const connection = mysql.createConnection(connectionObj)

connection.query = util.promisify(connection.query).bind(connection)

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
    return connection.query('select id, name from department')
}

const createEmployee = async (employee) => {
    return connection.query('insert into employee SET ?', employee);
}

const createRole = async (role) => {
    return connection.query('insert into role_table SET ?',
        role)
}

const employeeDelete = async (employee) => {
    return connection.query('delete from employee where employee.id = ?', employee)
}

const deleteDepartment = async (department) => {
    return connection.query('delete from department where department.id =?', department)
}

const deleteRole = async (role) => {
    return connection.query('delete from role_table where role.id =?', role)
}

const roleUpdate = async (employee, role) => {
    return connection.query('update employee set role = ? where employee.id = ?', [role, employee])
}

const addEmployee = async () => {
    const roles = await getRoles()
    const employees = await getEmployees();

    // console.log(roles)
    // console.log(employees)

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

    // console.log(employee)

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

    // console.log(employee)

    const managerChoices = employees
        .filter(employee => employee.manager === null)
        .map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }))

    // console.log(managerChoices)

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

const departmentView = async () => {
    const departments = await getDepartment();
    const departmentChoices = departments.map(({ id, name }) => (
        {
            name: name,
            value: id
        }
    ));

    // console.log(departmentChoices)

    const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "What department would you like to add this role to?",
        choices: departmentChoices
    });



    const choice = await connection.query(
        'select employee.id, employee.first_name, employee.last_name, role_table.title, department.name as department, role_table.salary, concat(manager.first_name," ",manager.last_name) as manager from employee left join role_table on employee.role_id = role_table.id left join department on role_table.department_id = department.id left join employee as manager on employee.manager_id = manager.id where department.id = ?', departmentId
    );
    console.table(choice)
    runProgram()
}

const managerView = async () => {
    const employees = await getEmployees();
    const managerChoices = employees
        .filter(employee => employee.manager === null)
        .map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }))

    // console.log(employees)
    // console.log(managerChoices)

    const { managerId } = await inquirer.prompt({
        type: "list",
        name: "managerId",
        message: "Employee's manager?",
        choices: managerChoices
    });

    const choice = await connection.query(
        'select employee.id, employee.first_name, employee.last_name, role_table.title, department.name as department, role_table.salary, concat(manager.first_name," ",manager.last_name) as manager from employee left join role_table on employee.role_id = role_table.id left join department on role_table.department_id = department.id left join employee as manager on employee.manager_id = manager.id where employee.manager_id = ?', managerId
    );
    console.table(choice)
    runProgram()

}

const removeEmployee = async () => {
    const employees = await getEmployees()
    const employeeChoices = employees.map(({ id, first_name, last_name }) => (
        {
            name: first_name,
            value: id
        }
    ));

    // console.log(departmentChoices)

    const { employeeId } = await inquirer.prompt({
        type: "list",
        name: "employeeId",
        message: "What employee would you like to remove?",
        choices: employeeChoices
    });

    employeeDelete(employeeId)

}

const removeDepartment = async () => {
    const departments = await getDepartment;
    const departmentChoices = departments.map(({ id, name }) => (
        {
            name: name,
            value: id
        }
    ));

    // console.log(departmentChoices)

    const { departmentId } = await inquirer.prompt({
        type: "list",
        name: "departmentId",
        message: "What department would you like to remove?",
        choices: departmentChoices
    });

    deleteDepartment(departmentId)
    runProgram()
}

const removeRole = async () => {
    const roles = await getRoles()
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "What role would you like to remove?",
        choices: roleChoices
    });

    deleteRole(roleId)
    runProgram()
}

const updateManager = async () => {

}

const updateRole = async () => {
    const roles = await getRoles()
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    const employees = await getEmployees()
    const employeeChoices = employees.map(({ id, first_name, last_name }) => (
        {
            name: first_name,
            value: id
        }
    ));


    const { employeeId } = await inquirer.prompt({
        type: "list",
        name: "employeeId",
        message: "What employee would you like to update?",
        choices: employeeChoices
    });


    const { roleId } = await inquirer.prompt({
        type: "list",
        name: "roleId",
        message: "What role would you like to update to?",
        choices: roleChoices
    });


    roleUpdate(employeeId, roleId)
}

const viewRoles = async () => {
    const role = await getRoles();
    console.table(role);
    runProgram();
}

const viewDepartments = async () => {
    const department = await getDepartment()
    console.table(department);
    runProgram();
}

const viewDepartmentBudget = async () => {

}

const exit = async () => {

}