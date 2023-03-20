INSERT INTO department (name)
VALUES 
('Accounting'),
('Human Resources'),
('IT'),
('Marketing');

INSERT INTO role (title, salary, department_id)
VALUES
('Payroll Specialist', 50000, 1),
('Collections Associate', 35000, 1),
('Human Resources Manager', 90000, 2),
('Benefits Coodinator', 60000, 2),
('IT Manager', 100000, 3),
('Developer', 70000, 3),
('Engineer', 75000, 3),
('Marketing Manager', 90000, 4),
('Digital Marketing Assistant', 40000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Ann', 'Arbor', 1, null),
('Betty', 'Boise', 2, null),
('Charlie', 'Chatanooga', 3, null),
('Devon', 'Dallas', 4, 3),
('Emmett', 'Enfield', 5, null),
('Farrah', 'Frisco', 6, 5),
('Gale', 'Galway', 8, null),
('Hamish', 'Hamburg', 9, 8);

