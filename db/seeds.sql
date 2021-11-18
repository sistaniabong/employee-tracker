INSERT INTO departments(name)
VALUES 
    ("Engineering"),
    ("Finance"),   
    ("Sales"),
    ("Legal"),
    ("Support");


INSERT INTO roles(title, salary, department_id)
VALUES 
    ("Sales Lead", 100000.00 , 3),
    ("Software Engineer", 175000.00 , 1),
    ("General Counsel", 200000.00 , 4),
    ("Customer Support", 80000.00 , 5),
    ("Software Engineer Lead", 235000.00 , 1),
    ("Accountant", 135000.00 , 2)
    ; 



INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES 
    ("John", "Doe", 1, NULL),
    ("Justin", "Clark", 5, NULL),
    ("Robert", "Myer", 2, 2),
    ("Taylor", "Swift", 4, 1),
    ("Jamie", "Swift", 3, NULL),
    ("Cool", "Guy", 6, 1)
    ; 