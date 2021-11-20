const inquirer = require('inquirer');
const cTable = require('console.table');
// Import and require mysql2
const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'bootcamp2021',
      database: 'business_db'
    },
    console.log(`Connected to the business_db database.`)
  );


function appPrompt() {
    console.log('Employee Tracker');

    inquirer
        .prompt(
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View all employees',
                    'View all departments',
                    'View all roles',
                    'Add role',
                    'Add department',
                    'Add employee',
                    'Update employee role',
                    'Quit'
                ]
            },
        )
    .then((data) => {
        if (data.action === 'View all employees'){
            viewAllEmployees();
        } else if (data.action === 'View all departments'){
            viewAllDepartments();
        }else if (data.action === 'View all roles'){
            viewAllRoles();
        }else if (data.action === 'Add role'){
            addRole();
        }else if (data.action === 'Add department'){
            addDepartment();
        }else if (data.action === 'Add employee'){
            addEmployee();
        }else if (data.action === 'Update employee role'){
            updateEmployee();
        }else if (data.action === 'Quit'){
            db.end();
            console.log("Thank you!");
        }
    })
    
};



function viewAllDepartments(){
    let query = `SELECT id, name FROM departments;`

    db.query(query, function(err,res){
        if (err) throw err;
        console.table(res); 
        appPrompt();
    })

}

function viewAllRoles(){
    let query = `SELECT roles.id, title, departments.name as department, salary FROM roles JOIN departments ON departments.id = roles.department_id;`

    db.query(query, function(err,res){
        if (err) throw err;
        appPrompt();
    })

}


function viewAllEmployees(){
    let query = `SELECT e1.id, e1.first_name, e1.last_name, roles.title, departments.name as department, roles.salary, e1.manager_id, e2.first_name as manager_first_name, e2.last_name as manager_last_name
    FROM employees e1 
    JOIN roles ON e1.role_id = roles.id 
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees e2 ON  e1.manager_id = e2.id ;`

    db.query(query, function(err,res){
        if (err) throw err;

        for(i = 0; i < res.length; i++) {

            if (res[i].manager_id){
                res[i].manager = res[i].manager_first_name + ' ' + res[i].manager_last_name; 
            }else{
                res[i].manager = "null";
            }
            delete res[i].manager_id;
            delete res[i].manager_first_name;
            delete res[i].manager_last_name;
        }
        console.table(res); 
        appPrompt();
    })
}


function addDepartment(){
    let addDeptPrompt = [

        {
    
            name: "new_department",
            type: "input",
            message: "What is the name of the department?"
        },
    
    ];

    inquirer
        .prompt(addDeptPrompt)
        .then((data) => {
            db.query(`SELECT COUNT(*) as COUNT FROM departments WHERE name = ?`,data.new_department, function(err,res){
                if (err) throw err;
                if (!res[0].COUNT){ //checking if the added department already exists and only add if it doesn't already exist
                    let query = `INSERT INTO departments(name) VALUES (?)`;
                    db.query(query,data.new_department, function(err,res){
                        if (err) throw err;
                        console.log(`New department called ${data.new_department} has been added successfully.`)
                    })
                } else {
                    console.log(`${data.new_department} already exists.`)
                } 
                db.query(`SELECT * FROM departments`, function(err,res){
                    if (err) throw err;
                    console.table(res);
                    appPrompt();
                }) 
            })
        })
    
}


function addRole(){

    db.query(`SELECT * FROM departments`, function(err,res){
        let document_list = res;
        let addRolePrompt = [

            {
                name: "new_role",
                type: "input",
                message: "What is the name of the role?"
            },
            {
                name: "new_salary",
                type: "input",
                message: "What is the salary of the role?"
            },
            {
                name: "new_department",
                type: "list",
                message: "Which department is the role under",
                choices: document_list
            }    
        ];

        inquirer
        .prompt(addRolePrompt)
        .then((data) => {
            db.query(`SELECT id FROM departments WHERE name = ?`, data.new_department, function(err,res){
                let value = [data.new_role, parseFloat(data.new_salary), res[0].id]
                let role_insert_query = `INSERT INTO roles(title, salary, department_id) VALUES (?,?,?);`;
                db.query(role_insert_query, [value[0], value[1], value[2]], function(err,res){
                    if (err) throw err;
                    console.log(`New role called ${data.new_role} has been added successfully.`);
                    appPrompt();
                });
            });
        })

    })
}

function addEmployee(){

    db.query(`SELECT id, title FROM roles`, function(err,res){
        roles_list = [];
        for(i = 0; i < res.length; i++) {              
            const roleId = i + 1;
            roles_list.push(roleId + ": " + res[i].title);

        };

        db.query(`SELECT e1.id, e1.first_name, e1.last_name FROM employees e1`, function(err,res){
            if (err) throw err;
            manager_list = [];
            for(i = 0; i < res.length; i++) {
                if (res[i].first_name && res[i].last_name){
                    manager_list.push(res[i].id + ": " + res[i].first_name + ' ' + res[i].last_name);
                }
            }
            manager_list.push('0: None');

            let addRolePrompt = [

                {
                    name: "new_first_name",
                    type: "input",
                    message: "What is the first name of the employee?"
                },
                {
                    name: "new_last_name",
                    type: "input",
                    message: "What is the last name of the employee?"
                },
                {
                    name: "new_role",
                    type: "list",
                    message: "What is the employee's role?",
                    choices: roles_list
                },
                {
                    name: "new_manager",
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: manager_list
                }   
            ];
            inquirer
                .prompt(addRolePrompt)
                .then((data) => {
                    let employee_insert_query = "INSERT INTO employees SET ?";
                    if (parseInt(data.new_manager.split(":")[0])){
                        db.query(employee_insert_query,{
                            first_name: data.new_first_name,
                            last_name: data.new_last_name,
                            role_id: parseInt(data.new_role.split(":")[0]),
                            manager_id: parseInt(data.new_manager.split(":")[0])
    
                        }, function(err,res){
                            if (err) throw err;
                            console.log(`New employee "${data.new_first_name} ${data.new_last_name}" has been added successfully.`);
                            appPrompt();
                        });
                    } 
                    else{
                        db.query(employee_insert_query,{
                            first_name: data.new_first_name,
                            last_name: data.new_last_name,
                            role_id: parseInt(data.new_role.split(":")[0])
                        }, function(err,res){
                            if (err) throw err;
                            console.log(`New employee "${data.new_first_name} ${data.new_last_name}" has been added successfully.`);
                            appPrompt();
                        });
                    }
                    
            });
        }); 
    });
};


function updateEmployee(){



        db.query(`SELECT e1.id, e1.first_name, e1.last_name FROM employees e1`, function(err,res){
            if (err) throw err;
            employee_list = [];
            for(i = 0; i < res.length; i++) {
                if (res[i].first_name && res[i].last_name){
                    employee_list.push(res[i].id + ": " + res[i].first_name + ' ' + res[i].last_name);
                }
            }
            db.query(`SELECT id, title FROM roles`, function(err,res){
                roles_list = [];
                for(i = 0; i < res.length; i++) {              
                    const roleId = i + 1;
                    roles_list.push(roleId + ": " + res[i].title);
                };

            let addRolePrompt = [

                {
                    name: "employee",
                    type: "list",
                    message: "Which employee's role do you want to update?",
                    choices: employee_list
                },
                {
                    name: "role",
                    type: "list",
                    message: "Which role do you want to assign the selected employee?",
                    choices: roles_list
                }
            ];
            inquirer
                .prompt(addRolePrompt)
                .then((data) => {
                    let selectedEmp = data.employee.split(":")[0]
                    let query = "UPDATE employees SET ? WHERE employees.id = " + selectedEmp;
                    
                    db.query(query,{
                        role_id: parseInt(data.role.split(":")[0]),                 
                    }, function(err,res){
                        if (err) throw err;
                        console.log(`${data.employee.split(": ")[1]}'s role has been updated successfully.`);
                        appPrompt();
                    });
                    
            });
        }); 
    })
};


appPrompt();