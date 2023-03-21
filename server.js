const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer'); 
const cTable = require('console.table');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'Corona20!',
        database: 'company_db'
      },
      console.log(`Connected to the company_db database.`)
);

db.connect(err => {
    if (err) throw err;
    DBconnected();
  });

  DBconnected = () => { 
    init();
  };


// Initial prompts

const init = () => {
  inquirer.prompt({
      name: "choices",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View departments",
        "View roles",
        "View employees",
        "Add department",
        "Add role",
        "Add employee",
        "Update employee role",
        "Exit"]
      }
    )
    .then((answer) => {
      switch (answer.choices) {
        case "View departments":
          viewDepartments();
          break;

        case "View roles":
          viewRoles();
          break;

        case "View employees":
          viewEmployees();
          break;

        case "Add department":
          addDepartment();
          break;

        case "Add role":
          addRole();
          break;

        case "Add employee":
          addEmployee();
          break;

        case "Update employee role":
          updateEmployeeRole();
          break;
  
        case "Exit":
          db.end();
          break;
      };
    });
  };

// Function to View Departments
const viewDepartments = () => {
    db.query('SELECT department.id as ID, department.name as Department FROM department', function (err, results) {
        console.table(results);
        init();
    });
};

// Function to view Roles
const viewRoles= () => {  
    const sql = `Select 
    role.id as ID, 
    role.title as Role, 
    department.name as Department
    from role
    inner join department on role.department_id = department.id`;
  
    db.query(sql, function (err, results) {
      console.table(results);
      init();
    });
  }

// Function to Show Employees and their Managers
const viewEmployees = () => {
    const sql = `Select 
        employee.id, 
        concat (employee.first_name, " ", employee.last_name) as Employee,
        role.salary as Salary,
        role.title as Job_Title,
        department.name as Department,
        CONCAT (manager.first_name, " ", manager.last_name) AS manager from employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id;`;
 
    db.query(sql, function (err, results) {
      console.table(results);
      init();
    });
  };

  
// Function to ADD Department
const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'addDepartment',
      message: "What Department are you going to add?",
      validate: addDepartment => {
        if (addDepartment) {
            return true;
        } else {
            console.log('Must Enter a Department!');
            return false;
        }
      }
    }
  ])
  .then(answer => {
    
    const sql = `INSERT INTO department (name)
                 VALUES (?)`;


  db.query(sql, answer.addDepartment ,(err, results) => {
   
    console.log(`You have added the ${answer.addDepartment} Department.`);
    init();
  });
 }) 
}

// Function to ADD Role
const addRole = () => {
  const departments = [];
  db.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach(dep => {
      let depOBJ = {
        name: dep.name,
        value: dep.id
      }
      departments.push(depOBJ);
    });

    
    let questions = [
      {
        type: "input",
        name: "title",
        message: "What is the title of this Role?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the Role?"
      },
      {
        type: "list",
        name: "department",
        choices: departments,
        message: "Add this Role into this department:"
      }
    ];

    inquirer.prompt(questions)
    .then(response => {
      
    const query = `INSERT INTO ROLE (title, salary, department_id) 
                   VALUES (?)`;
      
    db.query(query, [[response.title, response.salary, response.department]], (err, res) => {
        if (err) throw err;
        
        console.log(`Successfully added the ${response.title} role.`);
        init();
      });
    })
    .catch(err => {
      console.error(err);
    });
  });
}

// Function to ADD Employee
const addEmployee = () => {
  db.query("SELECT * FROM EMPLOYEE", (err, eRes) => {
    if (err) throw err;
    const managerAdd = [
      {
        name: 'None',
        value: 0
      }
    ]; 
      eRes.forEach(({ first_name, last_name, id }) => {
        managerAdd.push({
          name: first_name + " " + last_name,
          value: id
      });
    });
    
  // Employee role choices 
    db.query("SELECT * FROM ROLE", (err, roleRes) => {
      if (err) throw err;
      const roles = [];
        roleRes.forEach(({ title, id }) => {
          roles.push({
            name: title,
            value: id
            });
        });

        let questions = [
          {
            type: "input",
            name: "first_name",
            message: "Enter the employee's first name:"
          },
          {
            type: "input",
            name: "last_name",
            message: "Enter the employee's last name:"
          },
          {
            type: "list",
            name: "role_id",
            choices: roles,
            message: "Choose the employee's role:"
          },
          {
            type: "list",
            name: "manager_id",
            choices: managerAdd,
            message: "Enter the employee's manager (if any):"
          }
        ]

        inquirer.prompt(questions)
        .then(response => {

          const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) 
                        VALUES (?)`;

          let manager_id = response.manager_id !== 0? response.manager_id: null;

          db.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
            if (err) throw err;
                console.log(`Successfully added ${response.first_name} ${response.last_name}.`);

              init();
           });
        })
        .catch(err => {
          console.error(err);
        });
    })
  });
};

// Function to UPDATE employee role
const updateEmployee = () => {
  db.query("SELECT * FROM EMPLOYEE", (err, eRes) => {
    if (err) throw err;
    
  const empUpdate = [];
     
      eRes.forEach(({ first_name, last_name, id }) => {
        empUpdate.push({
          name: first_name + " " + last_name,
          value: id
      });

    });
    
//List employees to choose from
    db.query("SELECT * FROM ROLE", (err, rolRes) => {
      if (err) throw err;
      
   const roles = [];
        
      rolRes.forEach(({ title, id }) => {
          roles.push({
            name: title,
            value: id
          });

        });
     
      let questions = [
        {
          type: "list",
          name: "id",
          choices: empUpdate,
          message: "Choose an employee to update:"
        },
        {
          type: "list",
          name: "role_id",
          choices: roles,
          message: "Choose the new role for this employee:"
        }
      ]
  
      inquirer.prompt(questions)
        
      .then(response => {
          
        const sql = `UPDATE EMPLOYEE 
                     SET ? 
                     WHERE ?? = ?;`;
          db.query(sql, [
            {role_id: response.role_id},
            "id",
            response.id], (err, res) => {
            if (err) throw err;
            
            console.log(`You have updated this employee's role.`);
            init();
          });
        })
        .catch(err => {
          console.error(err);
        });
      })
  });
};

