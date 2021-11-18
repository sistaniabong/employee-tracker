const inquirer = require('inquirer');
const cTable = require('console.table');
// Import and require mysql2
const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password here
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
                    'View employees by manager',
                    'View employees by department'
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
        console.table(res); 
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
                console.log(value)
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


appPrompt();